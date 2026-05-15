import React, { useEffect } from 'react';
import { useRealtimeStore } from '../lib/websocket';
import { useBbChatStore } from '../stores/bbChatStore';

/**
 * Real-Time Updates Handler
 * Processes WebSocket messages and updates stores
 */

export function useRealtimeUpdates() {
  const socket = useRealtimeStore(state => state.socket);
  const { addMessage } = useBbChatStore();

  useEffect(() => {
    if (!socket) return;

    // Listen for case updates
    socket.on('case-update', (caseData) => {
      console.log('Case update received:', caseData);
      // Update case store
      window.dispatchEvent(new CustomEvent('case-update', { detail: caseData }));
    });

    // Listen for chat messages
    socket.on('chat-message', (message) => {
      console.log('Chat message received:', message);
      addMessage({
        id: message.id,
        role: message.role || 'assistant',
        content: message.content,
        timestamp: new Date().toISOString()
      });
    });

    // Listen for notifications
    socket.on('notification', (notification) => {
      console.log('Notification received:', notification);
      window.dispatchEvent(new CustomEvent('notification', { detail: notification }));
    });

    // Listen for user presence
    socket.on('user-presence', (data) => {
      console.log('User presence:', data);
      window.dispatchEvent(new CustomEvent('user-presence', { detail: data }));
    });

    return () => {
      socket.off('case-update');
      socket.off('chat-message');
      socket.off('notification');
      socket.off('user-presence');
    };
  }, [socket, addMessage]);
}

/**
 * Hook to listen for specific real-time events
 */
export function useRealtimeListener(event: string, callback: (data: any) => void) {
  useEffect(() => {
    const handler = (e: CustomEvent) => callback(e.detail);
    window.addEventListener(event, handler as EventListener);
    return () => window.removeEventListener(event, handler as EventListener);
  }, [event, callback]);
}

/**
 * Component to enable real-time updates throughout the app
 */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { connect } = useRealtimeStore();
  const { user } = React.useContext(AuthContext) || {};

  useEffect(() => {
    if (user?.token) {
      connect(user.token);
    }
  }, [user?.token]);

  useRealtimeUpdates();

  return <>{children}</>;
}

// Placeholder for AuthContext (import from your auth store)
const AuthContext = React.createContext<any>(null);
