/**
 * BB Chat Store — aligned to FastAPI bb_router.py response shapes.
 *
 * Backend POST /api/bb/chat returns:
 *   { reply, intent, session_id, timestamp }
 *
 * Backend GET /api/bb/intro returns:
 *   { reply, role }
 *
 * Auth is handled by apiClient (Bearer token). The backend derives
 * the user's role automatically — no need to pass it manually.
 */

import { create } from 'zustand';
import { BbChatMessage } from '../lib/api';
import { bbService } from '../lib/services/bbService';

interface BbChatState {
  messages: BbChatMessage[];
  sessionId: string;
  loading: boolean;
  typing: boolean;
  error: string | null;

  initializeSession: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  clearHistory: () => void;
  clearError: () => void;
}

function makeSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useBbChatStore = create<BbChatState>((set, get) => ({
  messages: [],
  sessionId: localStorage.getItem('bb_session_id') || makeSessionId(),
  loading: false,
  typing: false,
  error: null,

  initializeSession: async () => {
    set({ loading: true, error: null });
    try {
      const { reply, role } = await bbService.getIntro();
      const intro: BbChatMessage = {
        id: `intro_${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
      };
      const sessionId = makeSessionId();
      localStorage.setItem('bb_session_id', sessionId);
      set({ messages: [intro], sessionId, loading: false });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to start BB session',
      });
    }
  },

  sendMessage: async (message: string) => {
    const { sessionId } = get();

    const userMsg: BbChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    set({ messages: [...get().messages, userMsg], typing: true, error: null });

    try {
      const response = await bbService.sendMessage({
        session_id: sessionId,
        message,
      });

      const assistantMsg: BbChatMessage = {
        id: `msg_${Date.now()}_bb`,
        role: 'assistant',
        content: response.reply,
        timestamp: response.timestamp,
      };

      set({ messages: [...get().messages, assistantMsg], typing: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to send message',
        typing: false,
      });
    }
  },

  clearHistory: () => {
    const newId = makeSessionId();
    localStorage.setItem('bb_session_id', newId);
    set({ messages: [], sessionId: newId });
  },

  clearError: () => set({ error: null }),
}));
