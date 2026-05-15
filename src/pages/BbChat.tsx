import React, { useEffect, useRef, useState } from 'react';
import { useBbChatStore } from '../../stores/bbChatStore';
import { useAuthStore } from '../../stores/index';
import { useResourceStore } from '../../stores/resourceStore';
import { FormAnalysisDisplay, ApplicationTrackingDisplay, SuggestionCard } from '../../components/BbChat/BbChatServices';

export default function BbChatPage() {
  const { messages, loading, sendMessage, userId, setUserId, clearError, error } = useBbChatStore();
  const { user } = useAuthStore();
  const { resources } = useResourceStore();
  const [inputValue, setInputValue] = useState('');
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session
  useEffect(() => {
    if (user && !initialized) {
      setUserId(user.id);
      setInitialized(true);
    }
  }, [user, initialized]);

  // Auto-scroll
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

  const quickSuggestions = [
    {
      title: 'Help with housing',
      description: 'Find housing resources',
      action: () => setInputValue('I need help finding housing'),
      icon: '🏠'
    },
    {
      title: 'Job assistance',
      description: 'Get employment resources',
      action: () => setInputValue('I need help finding a job'),
      icon: '💼'
    },
    {
      title: 'Financial support',
      description: 'Access financial resources',
      action: () => setInputValue('I need financial assistance'),
      icon: '💰'
    },
    {
      title: 'Health services',
      description: 'Find health resources',
      action: () => setInputValue('I need health services'),
      icon: '🏥'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 350px',
      gap: '24px',
      padding: '32px',
      maxWidth: '1400px',
      margin: '0 auto',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      minHeight: '100vh'
    }}>
      {/* Main Chat Area */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            fontSize: '32px',
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #d4af37 0%, #f0d66d 50%, #d4af37 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Chat with BB
          </h1>
          <p style={{ color: '#A0A0A0', fontSize: '14px', margin: 0 }}>
            Your AI assistant for resources, applications, and support
          </p>
        </div>

        {/* Messages Container */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          background: 'rgba(26, 30, 36, 0.8)',
          border: '1px solid rgba(42, 47, 54, 0.8)',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {messages.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>👋</div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                Welcome to BB Assistant
              </h2>
              <p style={{ color: '#A0A0A0', fontSize: '14px', maxWidth: '300px' }}>
                I'm here to help you navigate resources, fill out forms, and track applications. What do you need help with today?
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessageBubble key={msg.id} message={msg} />
            ))
          )}

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                borderRadius: '8px',
                padding: '12px 16px'
              }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#A0A0A0' }}>BB is thinking</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span style={{ animation: 'pulse 1s infinite' }}>•</span>
                    <span style={{ animation: 'pulse 1s infinite', animationDelay: '0.2s' }}>•</span>
                    <span style={{ animation: 'pulse 1s infinite', animationDelay: '0.4s' }}>•</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#FCA5A5',
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <span>{error}</span>
            <button
              onClick={clearError}
              style={{
                background: 'none',
                border: 'none',
                color: '#FCA5A5',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSendMessage} style={{
          display: 'flex',
          gap: '12px'
        }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask BB anything..."
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'rgba(13, 15, 18, 0.8)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              opacity: loading ? 0.5 : 1,
              cursor: loading ? 'not-allowed' : 'text'
            }}
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            style={{
              padding: '12px 24px',
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
            {loading ? '⏳ Sending...' : 'Send'}
          </button>
        </form>
      </div>

      {/* Sidebar */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        {/* Quick Suggestions */}
        <div>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '700',
            color: '#FFD700',
            marginBottom: '12px',
            textTransform: 'uppercase'
          }}>
            Quick Help
          </h3>
          {quickSuggestions.map((sugg, idx) => (
            <SuggestionCard
              key={idx}
              title={sugg.title}
              description={sugg.description}
              action={() => {
                sugg.action();
                // Auto-focus input
              }}
              icon={sugg.icon}
            />
          ))}
        </div>

        {/* Available Resources */}
        <div>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '700',
            color: '#FFD700',
            marginBottom: '12px',
            textTransform: 'uppercase'
          }}>
            📚 Available Resources
          </h3>
          <div style={{
            background: 'rgba(26, 30, 36, 0.8)',
            border: '1px solid rgba(42, 47, 54, 0.8)',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '12px'
          }}>
            <div style={{ marginBottom: '8px', color: '#A0A0A0' }}>
              <p style={{ margin: 0, fontWeight: '600', marginBottom: '4px' }}>Total Resources</p>
              <p style={{ margin: 0, fontSize: '20px', color: '#FFD700', fontWeight: '700' }}>
                {resources.length || '—'}
              </p>
            </div>
            <div style={{
              fontSize: '11px',
              color: '#A0A0A0',
              paddingTop: '8px',
              borderTop: '1px solid rgba(42, 47, 54, 0.8)'
            }}>
              Ask BB about resources in your area
            </div>
          </div>
        </div>

        {/* Tips */}
        <div>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '700',
            color: '#FFD700',
            marginBottom: '12px',
            textTransform: 'uppercase'
          }}>
            💡 Tips
          </h3>
          <div style={{
            background: 'rgba(26, 30, 36, 0.8)',
            border: '1px solid rgba(42, 47, 54, 0.8)',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <ul style={{
              margin: 0,
              paddingLeft: '16px',
              fontSize: '12px',
              color: '#A0A0A0',
              lineHeight: '1.6'
            }}>
              <li>Ask about specific needs</li>
              <li>BB can help fill forms</li>
              <li>Track applications in real-time</li>
              <li>Get personalized recommendations</li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function ChatMessageBubble({ message }: any) {
  const isUser = message.role === 'user';

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      gap: '12px'
    }}>
      {!isUser && <div style={{ fontSize: '24px', flexShrink: 0 }}>🤖</div>}

      <div style={{
        maxWidth: '70%',
        padding: '12px 16px',
        borderRadius: '12px',
        background: isUser
          ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
          : 'rgba(59, 130, 246, 0.2)',
        border: isUser ? 'none' : '1px solid rgba(59, 130, 246, 0.4)',
        color: isUser ? '#fff' : '#E0E7FF',
        fontSize: '14px',
        lineHeight: '1.5',
        wordWrap: 'break-word'
      }}>
        {message.content}
        <div style={{
          fontSize: '11px',
          marginTop: '8px',
          opacity: 0.7,
          color: isUser ? 'rgba(255, 255, 255, 0.7)' : '#A0A0A0'
        }}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {isUser && <div style={{ fontSize: '24px', flexShrink: 0 }}>👤</div>}
    </div>
  );
}
