import { prisma } from '../utils/prismaVault';
import dotenv from 'dotenv';
import { ollamaPrompt } from '../lib/ollamaClient';

dotenv.config();

export const assessRiskEngine = async (userId: string, prismaClient: any) => {
  console.log(`[RISK] Initiating Risk Assessment for User: ${userId}`);

  try {
    // Get user's recent cases
    const recentCases = await prismaClient.case.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    if (recentCases.length === 0) {
      return {
        riskLevel: 'LOW',
        score: 10,
        factors: ['No recent cases'],
        recommendations: ['Continue monitoring'],
      };
    }

    const caseDescriptions = recentCases
      .map((c: any) => `${c.title}: ${c.description}`)
      .join('\n\n');

    const prompt = `
      Analyze the following case descriptions and provide a risk assessment:
      
      ${caseDescriptions}
      
      Determine:
      1. Overall Risk Level (LOW, MEDIUM, HIGH, CRITICAL)
      2. Risk Score (0-100)
      3. Key Risk Factors (array of strings)
      4. Recommendations (array of action items)
      
      Respond in valid JSON: {
        "riskLevel": "string",
        "score": number,
        "factors": ["string"],
        "recommendations": ["string"]
      }
    `;

    const completion = await ollamaPrompt(
      'You are a helpful assistant that only responds in valid JSON.',
      prompt,
      { temperature: 0.3, num_predict: 512 }
    );

    const assessment = JSON.parse(completion || '{}');

    // Store assessment in database
    if (recentCases[0]) {
      await prismaClient.riskAssessment.upsert({
        where: { caseId: recentCases[0].id },
        update: {
          riskLevel: assessment.riskLevel,
          score: assessment.score,
          factors: assessment.factors,
          recommendations: assessment.recommendations,
        },
        create: {
          caseId: recentCases[0].id,
          userId,
          riskLevel: assessment.riskLevel,
          score: assessment.score,
          factors: assessment.factors,
          recommendations: assessment.recommendations,
        },
      });
    }

    console.log(`[RISK] Assessment Complete. Risk Level: ${assessment.riskLevel}`);
    return assessment;
  } catch (error) {
    console.error('[RISK] Error:', error);
    return {
      riskLevel: 'MEDIUM',
      score: 50,
      factors: ['Assessment error'],
      recommendations: ['Manual review required'],
    };
  }
};
