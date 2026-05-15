import React, { useEffect, useRef } from 'react';
import { useBbChatStore } from '../../stores/bbChatStore';
import { useAuthStore } from '../../stores/index';

export default function BbChatWindow() {
  const { messages, loading, sendMessage, userId, setUserId, clearError, error } = useBbChatStore();
  const { user } = useAuthStore();
  const [inputValue, setInputValue] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [initialized, setInitialized] = React.useState(false);

  // Initialize session on first render
  useEffect(() => {
    if (user && !initialized) {
      setUserId(user.id);
      setInitialized(true);
    }
  }, [user, initialized]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFD700 0%, #FFF44F 50%, #FFD700 100%)',
          color: '#0a0e27',
          border: 'none',
          fontSize: '28px',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999,
          transition: 'all 0.3s',
          transform: isOpen ? 'scale(1.1)' : 'scale(1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.15)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(212, 175, 55, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(212, 175, 55, 0.4)';
        }}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '20px',
            width: '400px',
            height: '600px',
            background: 'linear-gradient(135deg, rgba(20, 23, 28, 0.98), rgba(13, 15, 18, 0.95))',
            border: '1px solid rgba(212, 175, 55, 0.5)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            boxShadow: '0 10px 50px rgba(212, 175, 55, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            maxHeight: '80vh',
            '@media (max-width: 480px)': {
              width: 'calc(100vw - 40px)',
              height: '70vh'
            }
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px',
              borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
              background: 'rgba(13, 15, 18, 0.8)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0' }}>BB Assistant</h3>
              <p style={{ fontSize: '12px', color: '#A0A0A0', margin: 0 }}>Always here to help</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#A0A0A0',
                cursor: 'pointer',
                fontSize: '20px'
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#A0A0A0', padding: '24px 0' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>👋</div>
                <p>Hi! I'm BB, your personal assistant.</p>
                <p style={{ fontSize: '12px', marginTop: '12px' }}>Ask me anything about your cases or resources.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))
            )}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px' }}>
                <div
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    maxWidth: '70%'
                  }}
                >
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#A0A0A0' }}>BB is typing</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <span style={{ animation: 'pulse 1s infinite', animationDelay: '0s' }}>•</span>
                      <span style={{ animation: 'pulse 1s infinite', animationDelay: '0.2s' }}>•</span>
                      <span style={{ animation: 'pulse 1s infinite', animationDelay: '0.4s' }}>•</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: '#FCA5A5',
                  fontSize: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{error}</span>
                <button
                  onClick={clearError}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#FCA5A5',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '16px',
              borderTop: '1px solid rgba(212, 175, 55, 0.2)',
              display: 'flex',
              gap: '8px'
            }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask BB anything..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px 12px',
                background: 'rgba(13, 15, 18, 0.8)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '13px',
                opacity: loading ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'text'
              }}
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              style={{
                padding: '10px 14px',
                background: !inputValue.trim() ? 'rgba(212, 175, 55, 0.3)' : 'linear-gradient(135deg, #FFD700 0%, #FFF44F 50%, #FFD700 100%)',
                color: '#0a0e27',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: !inputValue.trim() ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              ↑
            </button>
          </form>

          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 0.4; }
              50% { opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </>
  );
}

function ChatMessage({ message }: any) {
  const isUser = message.role === 'user';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        gap: '8px'
      }}
    >
      <div
        style={{
          maxWidth: '70%',
          padding: '12px 16px',
          borderRadius: '8px',
          background: isUser
            ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
            : 'rgba(59, 130, 246, 0.2)',
          border: isUser ? 'none' : '1px solid rgba(59, 130, 246, 0.4)',
          color: isUser ? '#fff' : '#E0E7FF',
          fontSize: '13px',
          lineHeight: '1.5',
          wordWrap: 'break-word'
        }}
      >
        {message.content}
        <div style={{
          fontSize: '11px',
          marginTop: '6px',
          opacity: 0.7,
          color: isUser ? 'rgba(255, 255, 255, 0.7)' : '#A0A0A0'
        }}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
