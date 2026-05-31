// BB Persistent Memory Service - Cross-session memory and learning
// Location: backend/src/services/BBPersistentMemory.ts

import { prisma } from '../lib/prisma';

export class BBPersistentMemoryService {
  /**
   * Initialize or get persistent memory for user
   */
  static async initializeMemory(userId: string) {
    const existing = await prisma.bBPersistentMemory.findUnique({
      where: { userId },
    });

    if (existing) {
      return existing;
    }

    const memory = await prisma.bBPersistentMemory.create({
      data: {
        userId,
        userProfile: {
          create: {},
        },
        preferences: {
          create: {
            language: 'en',
          },
        },
      },
      include: {
        userProfile: true,
        preferences: true,
      },
    });

    return memory;
  }

  /**
   * Get user's persistent memory with all related data
   */
  static async getUserMemory(userId: string) {
    const memory = await prisma.bBPersistentMemory.findUnique({
      where: { userId },
      include: {
        userProfile: true,
        preferences: true,
        resourceInteractions: {
          orderBy: { timestamp: 'desc' },
          take: 20,
        },
        submittedForms: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!memory) {
      return await this.initializeMemory(userId);
    }

    return memory;
  }

  /**
   * Add message to persistent conversation history
   */
  static async addConversationEntry(
    userId: string,
    entry: {
      role: 'user' | 'assistant' | 'system';
      content: string;
      contextTags?: string[];
      topics?: string[];
      sentiment?: string;
      actionTaken?: string;
      actionStatus?: string;
    }
  ) {
    const memory = await this.getUserMemory(userId);

    const conversationEntry = await prisma.conversationHistory.create({
      data: {
        memory: {
          connect: { id: memory.id },
        },
        ...entry,
      },
    });

    return conversationEntry;
  }

  /**
   * Get full conversation history for user
   */
  static async getConversationHistory(
    userId: string,
    limit = 100,
    offset = 0
  ) {
    const memory = await this.getUserMemory(userId);

    const conversations = await prisma.conversationHistory.findMany({
      where: {
        memoryId: memory.id,
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });

    return conversations.reverse();
  }

  /**
   * Update user profile (learned over time)
   */
  static async updateUserProfile(
    userId: string,
    profileData: {
      demographics?: string;
      currentSituation?: string;
      interests?: string[];
      services?: string[];
    }
  ) {
    const memory = await this.getUserMemory(userId);

    if (!memory.userProfileId) {
      throw new Error('User profile not initialized');
    }

    const updated = await prisma.userProfile.update({
      where: { id: memory.userProfileId },
      data: profileData,
    });

    return updated;
  }

  /**
   * Record resource interaction
   */
  static async recordResourceInteraction(
    userId: string,
    interaction: {
      resourceId: string;
      resourceName: string;
      resourceCategory: string;
      interactionType: 'viewed' | 'called' | 'emailed' | 'visited' | 'saved';
      notes?: string;
      outcome?: string;
    }
  ) {
    const memory = await this.getUserMemory(userId);

    const recorded = await prisma.resourceInteraction.create({
      data: {
        memory: {
          connect: { id: memory.id },
        },
        ...interaction,
      },
    });

    return recorded;
  }

  /**
   * Get user's resource interaction history
   */
  static async getResourceInteractions(userId: string, limit = 50) {
    const memory = await this.getUserMemory(userId);

    const interactions = await prisma.resourceInteraction.findMany({
      where: {
        memoryId: memory.id,
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return interactions;
  }

  /**
   * Record submitted form
   */
  static async recordSubmittedForm(
    userId: string,
    form: {
      formName: string;
      formUrl?: string;
      formData: Record<string, any>;
      status: 'draft' | 'submitted' | 'processing' | 'approved' | 'rejected';
      autoFilledFields?: string[];
    }
  ) {
    const memory = await this.getUserMemory(userId);

    const recorded = await prisma.submittedForm.create({
      data: {
        memory: {
          connect: { id: memory.id },
        },
        formName: form.formName,
        formUrl: form.formUrl,
        formData: JSON.stringify(form.formData),
        status: form.status,
        autoFilledFields: form.autoFilledFields || [],
      },
    });

    return recorded;
  }

  /**
   * Get user's submitted forms
   */
  static async getSubmittedForms(userId: string, limit = 20) {
    const memory = await this.getUserMemory(userId);

    const forms = await prisma.submittedForm.findMany({
      where: {
        memoryId: memory.id,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return forms;
  }

  /**
   * Get user preferences
   */
  static async getPreferences(userId: string) {
    const memory = await this.getUserMemory(userId);

    if (!memory.preferencesId) {
      throw new Error('Preferences not found');
    }

    const preferences = await prisma.storedPreferences.findUnique({
      where: { id: memory.preferencesId },
    });

    return preferences;
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(
    userId: string,
    preferences: {
      communicationStyle?: string;
      language?: string;
      preferredCategories?: string[];
      excludedServices?: string[];
      autoFillForms?: boolean;
      saveFormDrafts?: boolean;
    }
  ) {
    const memory = await this.getUserMemory(userId);

    if (!memory.preferencesId) {
      throw new Error('Preferences not found');
    }

    const updated = await prisma.storedPreferences.update({
      where: { id: memory.preferencesId },
      data: preferences,
    });

    return updated;
  }

  /**
   * Get summary of user's interaction patterns
   */
  static async getUserSummary(userId: string) {
    const memory = await this.getUserMemory(userId);
    const recentConversations = await this.getConversationHistory(userId, 20, 0);
    const interactions = await this.getResourceInteractions(userId, 10);
    const forms = await this.getSubmittedForms(userId, 5);

    return {
      memory,
      recentConversations,
      recentInteractions: interactions,
      recentForms: forms,
    };
  }
}

export default BBPersistentMemoryService;
