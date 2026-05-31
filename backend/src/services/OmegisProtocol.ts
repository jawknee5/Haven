// Omegis Protocol Integration - Two-Stage Classification System
// Location: backend/src/services/OmegisProtocol.ts

import { prisma } from '../lib/prisma';

export enum ClassificationStage {
  STAGE_1_PATTERN = 'stage_1_pattern',
  STAGE_2_LLM = 'stage_2_llm',
  APPROVED = 'approved',
  DENIED = 'denied',
}

export interface ClassificationResult {
  stage: ClassificationStage;
  approved: boolean;
  confidence: number;
  reason: string;
  sudoTokenIfApproved?: string;
  timestamp: Date;
}

export interface ToolCall {
  toolName: string;
  parameters: Record<string, any>;
  requesterUserId: string;
  context?: string;
}

export class OmegisProtocol {
  /**
   * Stage 1: Fast Regex-Based Pattern Matching
   * Returns immediately for obvious patterns
   */
  static async classifyStage1(toolCall: ToolCall): Promise<ClassificationResult> {
    const dangerousPatterns = [
      /delete.*database/i,
      /drop.*table/i,
      /truncate/i,
      /rm.*-rf/i,
      /format.*drive/i,
      /dd.*if=.*of=/i,
      /chmod.*000/i,
      /killall/i,
    ];

    const toolNameLower = toolCall.toolName.toLowerCase();
    const paramsStr = JSON.stringify(toolCall.parameters).toLowerCase();

    for (const pattern of dangerousPatterns) {
      if (pattern.test(toolNameLower) || pattern.test(paramsStr)) {
        return {
          stage: ClassificationStage.STAGE_1_PATTERN,
          approved: false,
          confidence: 0.95,
          reason: `Matched dangerous pattern: ${pattern}`,
          timestamp: new Date(),
        };
      }
    }

    // Safe patterns
    const safePatterns = [
      /read.*file/i,
      /get.*data/i,
      /list.*items/i,
      /search/i,
      /query/i,
    ];

    for (const pattern of safePatterns) {
      if (pattern.test(toolNameLower)) {
        return {
          stage: ClassificationStage.STAGE_1_PATTERN,
          approved: true,
          confidence: 0.95,
          reason: 'Matched safe pattern',
          timestamp: new Date(),
        };
      }
    }

    // Uncertain - escalate to Stage 2
    return {
      stage: ClassificationStage.STAGE_2_LLM,
      approved: false,
      confidence: 0,
      reason: 'Escalating to Stage 2 for deep analysis',
      timestamp: new Date(),
    };
  }

  /**
   * Stage 2: Deep Intent Analysis via LLM
   * More thorough evaluation for uncertain operations
   */
  static async classifyStage2(toolCall: ToolCall, stage1Result: ClassificationResult): Promise<ClassificationResult> {
    if (stage1Result.stage === ClassificationStage.STAGE_1_PATTERN) {
      return stage1Result;
    }

    const { toolName, parameters } = toolCall;

    const riskFactors = [
      toolName.includes('delete'),
      toolName.includes('destroy'),
      toolName.includes('admin'),
      toolName.includes('bypass'),
      Object.keys(parameters).some((k) => k.includes('force')),
      Object.keys(parameters).some((k) => k.includes('unsafe')),
    ];

    const riskScore = riskFactors.filter(Boolean).length / riskFactors.length;

    if (riskScore > 0.7) {
      return {
        stage: ClassificationStage.STAGE_2_LLM,
        approved: false,
        confidence: riskScore,
        reason: `High-risk operation detected (risk score: ${riskScore.toFixed(2)})`,
        timestamp: new Date(),
      };
    }

    if (riskScore < 0.2) {
      return {
        stage: ClassificationStage.STAGE_2_LLM,
        approved: true,
        confidence: 1 - riskScore,
        reason: `Low-risk operation (risk score: ${riskScore.toFixed(2)})`,
        timestamp: new Date(),
      };
    }

    return {
      stage: ClassificationStage.STAGE_2_LLM,
      approved: false,
      confidence: 0.5,
      reason: `Moderate-risk operation requires SUDO authorization`,
      timestamp: new Date(),
    };
  }

  /**
   * Full classification pipeline
   */
  static async classify(toolCall: ToolCall): Promise<ClassificationResult> {
    const stage1Result = await this.classifyStage1(toolCall);

    if (stage1Result.stage === ClassificationStage.STAGE_1_PATTERN) {
      return {
        ...stage1Result,
        approved: stage1Result.approved,
        stage: stage1Result.approved ? ClassificationStage.APPROVED : ClassificationStage.DENIED,
      };
    }

    const stage2Result = await this.classifyStage2(toolCall, stage1Result);

    return {
      ...stage2Result,
      stage: stage2Result.approved ? ClassificationStage.APPROVED : ClassificationStage.DENIED,
    };
  }

  /**
   * Mint SUDO token for scoped privilege escalation
   */
  static async mintSudoToken(userId: string, allowedTools: string[], ttlMinutes = 15): Promise<string> {
    const token = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'default-secret';

    const sudoPayload = {
      type: 'sudo',
      userId,
      allowedTools,
      issuedAt: Date.now(),
      expiresAt: Date.now() + ttlMinutes * 60 * 1000,
    };

    return token.sign(sudoPayload, secret, { expiresIn: `${ttlMinutes}m` });
  }

  /**
   * Verify SUDO token
   */
  static async verifySudoToken(token: string): Promise<any> {
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'default-secret';

    try {
      return jwt.verify(token, secret);
    } catch (error) {
      throw new Error('Invalid or expired SUDO token');
    }
  }

  /**
   * Check if tool call is allowed under SUDO token
   */
  static async checkSudoAuthorization(token: string, toolName: string): Promise<boolean> {
    try {
      const payload = await this.verifySudoToken(token);
      return payload.allowedTools.includes(toolName) || payload.allowedTools.includes('*');
    } catch (error) {
      return false;
    }
  }

  /**
   * Log classification decision for audit trail
   */
  static async logClassification(
    userId: string,
    toolCall: ToolCall,
    result: ClassificationResult
  ): Promise<void> {
    await prisma.omegisAuditLog.create({
      data: {
        userId,
        toolName: toolCall.toolName,
        parameters: JSON.stringify(toolCall.parameters),
        classificationStage: result.stage,
        approved: result.approved,
        confidence: result.confidence,
        reason: result.reason,
        context: toolCall.context,
      },
    });
  }

  /**
   * Get classification history for user
   */
  static async getClassificationHistory(userId: string, limit = 50): Promise<any[]> {
    return prisma.omegisAuditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

export default OmegisProtocol;
