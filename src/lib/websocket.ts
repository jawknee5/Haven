import { io, Socket } from 'socket.io-client';
import { create } from 'zustand';

/**
 * WebSocket Real-Time Connection Manager
 * Handles Socket.IO connections for live updates
 */

export interface RealtimeMessage {
  type: 'case-update' | 'chat-message' | 'user-presence' | 'notification';
  data: any;
  timestamp: string;
}

interface RealtimeStore {
  socket: Socket | null;
  isConnected: boolean;
  messages: RealtimeMessage[];
  connect: (url: string, token: string) => void;
  disconnect: () => void;
  emit: (event: string, data: any) => void;
  onMessage: (callback: (msg: RealtimeMessage) => void) => void;
  clearMessages: () => void;
}

export const useRealtimeStore = create<RealtimeStore>((set, get) => ({
  socket: null,
  isConnected: false,
  messages: [],

  connect: (url: string, token: string) => {
    try {
      const socket = io(url, {
        auth: {
          token
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      socket.on('connect', () => {
        set({ isConnected: true });
        console.log('WebSocket connected');
      });

      socket.on('disconnect', () => {
        set({ isConnected: false });
        console.log('WebSocket disconnected');
      });

      socket.on('message', (message: RealtimeMessage) => {
        set(state => ({
          messages: [...state.messages, message]
        }));
      });

      socket.on('case-update', (caseData) => {
        set(state => ({
          messages: [...state.messages, {
            type: 'case-update',
            data: caseData,
            timestamp: new Date().toISOString()
          }]
        }));
      });

      socket.on('chat-message', (message) => {
        set(state => ({
          messages: [...state.messages, {
            type: 'chat-message',
            data: message,
            timestamp: new Date().toISOString()
          }]
        }));
      });

      socket.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      set({ socket, isConnected: false });
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  },

  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  emit: (event: string, data: any) => {
    const socket = get().socket;
    if (socket?.connected) {
      socket.emit(event, data);
    }
  },

  onMessage: (callback: (msg: RealtimeMessage) => void) => {
    const socket = get().socket;
    if (socket) {
      socket.on('message', callback);
    }
  },

  clearMessages: () => {
    set({ messages: [] });
  }
}));

/**
 * Hook for real-time updates
 */
export function useRealtime() {
  const { socket, isConnected, messages, emit, onMessage } = useRealtimeStore();

  const connect = (token: string) => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:4000';
    useRealtimeStore.getState().connect(wsUrl, token);
  };

  const disconnect = () => {
    useRealtimeStore.getState().disconnect();
  };

  return {
    socket,
    isConnected,
    messages,
    connect,
    disconnect,
    emit,
    onMessage
  };
}
