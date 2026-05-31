// BB Personality Export & Assimilation
import { prisma } from '../lib/prisma';
import OmegisKnowledgeBase from './OmegisKnowledgeBase';

export interface BBGenesisState {
  version: string;
  timestamp: Date;
  bbSystemPrompt: string;
  bbPersonality: { traits: string[], communicationStyle: string, decisionFramework: string };
  bbCapabilities: string[];
  exportedBy: string;
  securityLevel: 'personal' | 'shared' | 'infrastructure';
}

export class BBPersonalitySync {
  static async exportBBGenesisState(bbSessionId, exportedBy) {
    const bbContext = await prisma.bBContextSystem.findFirst({ orderBy: { createdAt: 'desc' } });
    return {
      version: '1.0',
      timestamp: new Date(),
      bbSystemPrompt: bbContext?.systemPrompt || 'Default BB system prompt',
      bbPersonality: { traits: ['helpful', 'empathetic', 'direct', 'resourceful'], communicationStyle: 'Clear, warm, practical', decisionFramework: 'User wellbeing first' },
      bbCapabilities: ['Resource guidance', 'Crisis support', 'Form assistance', 'Email drafting', 'Offline operation'],
      exportedBy,
      securityLevel: 'infrastructure',
    };
  }

  static async assimilateBBPersonality(genesisState) {
    try {
      await prisma.bBContextSystem.create({
        data: {
          systemPrompt: genesisState.bbSystemPrompt,
          guidanceStages: JSON.stringify({ stage1: 'Triage', stage2: 'Connection', stage3: 'Sustainability' }),
          resourceCategories: JSON.stringify(['Housing', 'Healthcare', 'Food', 'Survival Skills']),
          metadata: JSON.stringify(genesisState.bbPersonality),
        }
      });
      return { success: true, bbVersion: genesisState.version, personalityLoaded: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async getBBStatus() {
    const bbContext = await prisma.bBContextSystem.findFirst({ orderBy: { createdAt: 'desc' } });
    return { isLoaded: !!bbContext, personality: bbContext?.metadata || null, survivalKnowledgeAvailable: true };
  }
}

export default BBPersonalitySync;
