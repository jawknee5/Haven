// BB Memory Integration - Frontend Service
// Location: frontend/src/services/bbMemoryService.ts

export interface BBSessionData {
  sessionId: string;
  userId: string;
  startTime: Date;
  isActive: boolean;
}

export interface BBMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  contextTags?: string[];
  topics?: string[];
  entities?: string[];
  timestamp?: Date;
}

class BBMemoryService {
  private apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  /**
   * Initialize or get current session
   */
  async getSession(): Promise<BBSessionData> {
    const response = await fetch(`${this.apiUrl}/bb/session`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get BB session');
    }

    const data = await response.json();
    return data.session;
  }

  /**
   * Add message to session conversation
   */
  async addMessage(sessionId: string, message: BBMessage): Promise<void> {
    const response = await fetch(`${this.apiUrl}/bb/session/message?sessionId=${sessionId}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error('Failed to add message to session');
    }
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(sessionId: string, limit = 50): Promise<BBMessage[]> {
    const response = await fetch(
      `${this.apiUrl}/bb/session/history?sessionId=${sessionId}&limit=${limit}`,
      {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get conversation history');
    }

    const data = await response.json();
    return data.messages;
  }

  /**
   * End session
   */
  async endSession(sessionId: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/bb/session/end`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      throw new Error('Failed to end session');
    }
  }

  /**
   * Get user's persistent memory
   */
  async getMemory(): Promise<any> {
    const response = await fetch(`${this.apiUrl}/bb/memory`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get memory');
    }

    const data = await response.json();
    return data.memory;
  }

  /**
   * Get memory summary
   */
  async getMemorySummary(): Promise<any> {
    const response = await fetch(`${this.apiUrl}/bb/memory/summary`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get memory summary');
    }

    const data = await response.json();
    return data.summary;
  }

  /**
   * Record resource interaction
   */
  async recordResourceInteraction(interaction: {
    resourceId: string;
    resourceName: string;
    resourceCategory: string;
    interactionType: 'viewed' | 'called' | 'emailed' | 'visited' | 'saved';
    notes?: string;
    outcome?: string;
  }): Promise<void> {
    const response = await fetch(`${this.apiUrl}/bb/memory/resource-interaction`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify(interaction),
    });

    if (!response.ok) {
      throw new Error('Failed to record resource interaction');
    }
  }

  /**
   * Get resource interactions
   */
  async getResourceInteractions(limit = 50): Promise<any[]> {
    const response = await fetch(`${this.apiUrl}/bb/memory/interactions?limit=${limit}`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get resource interactions');
    }

    const data = await response.json();
    return data.interactions;
  }

  /**
   * Get system prompt for BB
   */
  async getSystemPrompt(): Promise<string> {
    const response = await fetch(`${this.apiUrl}/bb/context/prompt`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get system prompt');
    }

    const data = await response.json();
    return data.prompt;
  }

  /**
   * Get guidance by stage
   */
  async getGuidanceByStage(stage: string): Promise<string> {
    const response = await fetch(`${this.apiUrl}/bb/context/guidance?stage=${stage}`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get guidance');
    }

    const data = await response.json();
    return data.guidance;
  }

  /**
   * Get resources by category
   */
  async getResourcesByCategory(category: string): Promise<any> {
    const response = await fetch(`${this.apiUrl}/bb/context/resources?category=${category}`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get resources');
    }

    const data = await response.json();
    return data.resources;
  }

  /**
   * Local session storage for offline support
   */
  async saveSessionLocally(session: BBSessionData): Promise<void> {
    const sessions = JSON.parse(localStorage.getItem('bb_sessions') || '{}');
    sessions[session.sessionId] = {
      ...session,
      startTime: new Date(session.startTime).toISOString(),
    };
    localStorage.setItem('bb_sessions', JSON.stringify(sessions));
  }

  /**
   * Get locally stored sessions
   */
  async getLocalSessions(): Promise<BBSessionData[]> {
    const sessions = JSON.parse(localStorage.getItem('bb_sessions') || '{}');
    return Object.values(sessions) as BBSessionData[];
  }

  /**
   * Store message locally for offline support
   */
  async storeMessageLocally(sessionId: string, message: BBMessage): Promise<void> {
    const key = `bb_messages_${sessionId}`;
    const messages = JSON.parse(localStorage.getItem(key) || '[]');
    messages.push({
      ...message,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(key, JSON.stringify(messages));
  }

  /**
   * Get locally stored messages
   */
  async getLocalMessages(sessionId: string): Promise<BBMessage[]> {
    const key = `bb_messages_${sessionId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  /**
   * Clear session storage
   */
  async clearSessionStorage(sessionId: string): Promise<void> {
    const key = `bb_messages_${sessionId}`;
    localStorage.removeItem(key);
  }
}

export default new BBMemoryService();
