import React, { useEffect } from 'react';
import { AppRouter } from './routes.tsx';
import BbChatWindow from './components/BbChat/BbChatWindow';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAuthStore } from './stores/index';
import { useRealtimeStore } from './lib/websocket';

export default function App() {
  const { user } = useAuthStore();
  const { connect: connectWebSocket } = useRealtimeStore();

  // Connect to WebSocket when user logs in
  useEffect(() => {
    if (user?.token) {
      const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:4000';
      connectWebSocket(wsUrl, user.token);
    }
  }, [user?.token, connectWebSocket]);

  return (
    <ErrorBoundary>
      <AppRouter />
      <BbChatWindow />
    </ErrorBoundary>
  );
}
