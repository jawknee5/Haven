// BB Session Memory Service - Manages conversation history during user session
// Location: backend/src/services/BBSessionMemory.ts

import { prisma } from '../lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export interface BBMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  contextTags?: string[];
  topics?: string[];
  entities?: string[];
}

export class BBSessionMemoryService {
  /**
   * Initialize or get active session for user
   */
  static async initializeSession(userId: string) {
    const sessionId = uuidv4();
    
    const session = await prisma.bBSessionMemory.create({
      data: {
        userId,
        sessionId,
        conversationHistory: {
          create: {
            role: 'system',
            content: 'Session initialized',
            contextTags: ['initialization'],
          },
        },
        userContext: {
          create: {},
        },
        preferences: {
          create: {
            language: 'en',
          },
        },
      },
      include: {
        conversationHistory: true,
        userContext: true,
        preferences: true,
      },
    });

    return session;
  }

  /**
   * Get active session for user
   */
  static async getActiveSession(userId: string) {
    const session = await prisma.bBSessionMemory.findFirst({
      where: {
        userId,
        isActive: true,
      },
      include: {
        conversationHistory: {
          orderBy: { timestamp: 'asc' },
          take: 100, // Last 100 messages
        },
        userContext: true,
        preferences: true,
      },
    });

    return session;
  }

  /**
   * Add message to session conversation history
   */
  static async addMessage(
    sessionId: string,
    message: BBMessage
  ) {
    const conversationMessage = await prisma.conversationMessage.create({
      data: {
        sessionMemory: {
          connect: { sessionId },
        },
        role: message.role,
        content: message.content,
        contextTags: message.contextTags || [],
        topics: message.topics || [],
        entities: message.entities || [],
      },
    });

    return conversationMessage;
  }

  /**
   * Get conversation history for session
   */
  static async getConversationHistory(sessionId: string, limit = 50) {
    const messages = await prisma.conversationMessage.findMany({
      where: {
        sessionMemory: { sessionId },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return messages.reverse(); // Return in chronological order
  }

  /**
   * Update user context within session
   */
  static async updateUserContext(
    sessionId: string,
    contextData: {
      currentNeeds?: string[];
      userStage?: string;
      urgentIssues?: string[];
      currentLocation?: string;
      accessibilityNeeds?: string[];
      servicesAccessed?: string[];
      resourcesViewed?: string[];
    }
  ) {
    const session = await prisma.bBSessionMemory.findUnique({
      where: { sessionId },
    });

    if (!session?.userContextId) {
      throw new Error('User context not initialized for session');
    }

    const updated = await prisma.userContext.update({
      where: { id: session.userContextId },
      data: {
        ...contextData,
      },
    });

    return updated;
  }

  /**
   * Update user preferences within session
   */
  static async updatePreferences(
    sessionId: string,
    preferences: {
      communicationStyle?: string;
      language?: string;
      timezone?: string;
      emailNotifications?: boolean;
      smsNotifications?: boolean;
    }
  ) {
    const session = await prisma.bBSessionMemory.findUnique({
      where: { sessionId },
    });

    if (!session?.userPreferencesId) {
      throw new Error('Preferences not initialized for session');
    }

    const updated = await prisma.userPreferences.update({
      where: { id: session.userPreferencesId },
      data: preferences,
    });

    return updated;
  }

  /**
   * End session
   */
  static async endSession(sessionId: string) {
    const session = await prisma.bBSessionMemory.update({
      where: { sessionId },
      data: {
        isActive: false,
        sessionEnd: new Date(),
      },
    });

    return session;
  }

  /**
   * Get full session context for BB
   */
  static async getSessionContext(sessionId: string) {
    const session = await prisma.bBSessionMemory.findUnique({
      where: { sessionId },
      include: {
        conversationHistory: {
          orderBy: { timestamp: 'asc' },
          take: 50,
        },
        userContext: true,
        preferences: true,
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    return {
      session,
      messages: session.conversationHistory,
      context: session.userContext,
      preferences: session.preferences,
    };
  }

  /**
   * Clear old sessions (cleanup)
   */
  static async clearOldSessions(hoursOld = 24) {
    const cutoffTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000);

    const deleted = await prisma.bBSessionMemory.deleteMany({
      where: {
        sessionEnd: {
          lt: cutoffTime,
        },
        isActive: false,
      },
    });

    return deleted;
  }
}

export default BBSessionMemoryService;
