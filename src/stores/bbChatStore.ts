/**
 * BB Chat Store
 * Manages BB assistant chat state
 */

import { create } from 'zustand';
import { BbChatMessage } from '../lib/api';
import { bbService, ChatRequest } from '../lib/services/bbService';

interface BbChatState {
  // Data
  messages: BbChatMessage[];
  sessionId: string | null;
  userId: string | null;

  // Loading states
  loading: boolean;
  error: string | null;
  typing: boolean;

  // Actions
  initializeSession: (userId: string) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  clearHistory: () => void;
  setUserId: (userId: string) => void;
  clearError: () => void;
}

export const useBbChatStore = create<BbChatState>((set, get) => {
  return {
    messages: [],
    sessionId: localStorage.getItem('bb_session_id'),
    userId: null,
    loading: false,
    error: null,
    typing: false,

    initializeSession: async (userId) => {
      set({ userId });
      try {
        const intro = await bbService.getIntroduction(userId);
        set({
          messages: [intro],
          sessionId: `session_${Date.now()}`,
        });
        localStorage.setItem('bb_session_id', `session_${Date.now()}`);
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to initialize BB chat',
        });
      }
    },

    sendMessage: async (message) => {
      const { sessionId, userId } = get();

      if (!userId) {
        set({ error: 'User not identified' });
        return;
      }

      // Add user message to history
      const userMessage: BbChatMessage = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };

      set({
        messages: [...get().messages, userMessage],
        typing: true,
        error: null,
      });

      try {
        const response = await bbService.sendMessage({
          userId,
          sessionId: sessionId || undefined,
          message,
        });

        set({
          messages: [...get().messages, response.message],
          sessionId: response.sessionId,
          typing: false,
        });

        localStorage.setItem('bb_session_id', response.sessionId);
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to send message',
          typing: false,
        });
      }
    },

    clearHistory: () => {
      set({ messages: [], sessionId: null });
      localStorage.removeItem('bb_session_id');
    },

    setUserId: (userId) => {
      set({ userId });
    },

    clearError: () => set({ error: null }),
  };
});
