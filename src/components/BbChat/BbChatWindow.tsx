import React, { useEffect, useRef, useCallback } from 'react';
import { useBbChatStore } from '../../stores/bbChatStore';
import { useAuthStore } from '../../stores/index';

// ── Web Speech API availability detection ─────────────────────────────────────
// Firefox does not implement SpeechRecognition or SpeechSynthesis.
// We detect at module load time so the component never renders broken controls.
const hasSpeechRecognition =
  typeof window !== 'undefined' &&
  !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition);

const hasSpeechSynthesis =
  typeof window !== 'undefined' &&
  'speechSynthesis' in window &&
  typeof window.speechSynthesis.speak === 'function';

const voiceSupported = hasSpeechRecognition && hasSpeechSynthesis;

export default function BbChatWindow() {
  const { messages, loading, sendMessage, userId, setUserId, clearError, error } = useBbChatStore();
  const { user } = useAuthStore();
  const [inputValue, setInputValue] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const [initialized, setInitialized] = React.useState(false);

  // Voice state — only active on supported browsers
  const [isListening, setIsListening] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && !initialized) {
      setUserId(user.id);
      setInitialized(true);
    }
  }, [user, initialized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Voice: mic input ───────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!hasSpeechRecognition) return;
    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // ── Voice: speaker output ──────────────────────────────────────────────────
  const speakLastReply = useCallback(() => {
    if (!hasSpeechSynthesis) return;
    const lastBb = [...messages].reverse().find(m => m.role !== 'user');
    if (!lastBb) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(lastBb.content);
    utt.onstart = () => setIsSpeaking(true);
    utt.onend = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utt);
  }, [messages]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

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
        aria-label={isOpen ? 'Close BB chat' : 'Open BB chat assistant'}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        style={{
          position: 'fixed', bottom: '20px', right: '20px',
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFD700 0%, #FFF44F 50%, #FFD700 100%)',
          color: '#0a0e27', border: 'none', fontSize: '28px',
          cursor: 'pointer', boxShadow: '0 4px 20px rgba(212,175,55,0.4)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 999, transition: 'all 0.3s',
        }}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="BB — AI Civic Concierge"
          style={{
            position: 'fixed', bottom: '100px', right: '20px',
            width: '400px', height: '600px', maxHeight: '80vh',
            background: 'linear-gradient(135deg,rgba(20,23,28,0.98),rgba(13,15,18,0.95))',
            border: '1px solid rgba(212,175,55,0.5)', borderRadius: '12px',
            display: 'flex', flexDirection: 'column', zIndex: 1000,
            boxShadow: '0 10px 50px rgba(212,175,55,0.25)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px', borderBottom: '1px solid rgba(212,175,55,0.2)',
            background: 'rgba(13,15,18,0.8)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <h3 id="bb-dialog-title" style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0' }}>
                BB Assistant
              </h3>
              <p style={{ fontSize: '12px', color: '#A0A0A0', margin: 0 }}>Always here to help</p>
            </div>

            {/* Voice controls — rendered only on supported browsers */}
            {voiceSupported ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {/* Mic button */}
                <button
                  onClick={isListening ? stopListening : startListening}
                  aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                  aria-pressed={isListening}
                  title={isListening ? 'Stop listening' : 'Speak to BB'}
                  style={{
                    background: isListening ? 'rgba(239,68,68,0.2)' : 'rgba(212,175,55,0.15)',
                    border: `1px solid ${isListening ? 'rgba(239,68,68,0.5)' : 'rgba(212,175,55,0.3)'}`,
                    color: isListening ? '#FCA5A5' : '#FFD700',
                    borderRadius: '6px', padding: '6px 10px',
                    cursor: 'pointer', fontSize: '16px',
                  }}
                >
                  {isListening ? '⏹' : '🎤'}
                </button>

                {/* Speaker button */}
                <button
                  onClick={isSpeaking ? stopSpeaking : speakLastReply}
                  aria-label={isSpeaking ? 'Stop speaking' : 'Read last reply aloud'}
                  aria-pressed={isSpeaking}
                  title={isSpeaking ? 'Stop speaking' : 'Read BB reply aloud'}
                  disabled={messages.filter(m => m.role !== 'user').length === 0}
                  style={{
                    background: isSpeaking ? 'rgba(59,130,246,0.2)' : 'rgba(212,175,55,0.15)',
                    border: `1px solid ${isSpeaking ? 'rgba(59,130,246,0.5)' : 'rgba(212,175,55,0.3)'}`,
                    color: isSpeaking ? '#93C5FD' : '#FFD700',
                    borderRadius: '6px', padding: '6px 10px',
                    cursor: 'pointer', fontSize: '16px',
                    opacity: messages.filter(m => m.role !== 'user').length === 0 ? 0.4 : 1,
                  }}
                >
                  {isSpeaking ? '🔇' : '🔊'}
                </button>
              </div>
            ) : (
              /* ── Section 508 / WCAG 2.1 AA: Firefox / non-Speech-API fallback ──
                 When Web Speech API is unavailable, replace icon controls with
                 visible, keyboard-navigable text alternatives so assistive
                 technologies (screen readers, switch controls, keyboard-only nav)
                 have a complete, equivalent experience.
              */
              <div
                role="note"
                aria-label="Voice input not available in this browser"
                style={{
                  fontSize: '11px', color: '#A0A0A0',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px', padding: '4px 10px',
                  maxWidth: '160px', textAlign: 'center', lineHeight: '1.4',
                }}
              >
                <span aria-hidden="true">⌨️ </span>
                Text-only mode
                <br />
                <span style={{ fontSize: '10px', opacity: 0.7 }}>
                  Voice requires Chrome or Edge
                </span>
              </div>
            )}

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close BB chat"
              style={{ background: 'none', border: 'none', color: '#A0A0A0', cursor: 'pointer', fontSize: '20px', marginLeft: '8px' }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
            aria-atomic="false"
            style={{
              flex: 1, overflowY: 'auto', padding: '16px',
              display: 'flex', flexDirection: 'column', gap: '12px',
            }}
          >
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#A0A0A0', padding: '24px 0' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }} aria-hidden="true">👋</div>
                <p>Hi! I'm BB, your personal assistant.</p>
                <p style={{ fontSize: '12px', marginTop: '12px' }}>
                  Ask me anything about your cases or resources.
                </p>
                {/* WCAG 2.1 AA: explicit keyboard shortcut hint for non-voice users */}
                {!voiceSupported && (
                  <p style={{ fontSize: '11px', marginTop: '8px', color: '#6B7280' }}>
                    Type your message below and press <kbd style={{
                      background: 'rgba(255,255,255,0.1)', borderRadius: '3px',
                      padding: '1px 5px', fontSize: '10px', border: '1px solid rgba(255,255,255,0.2)',
                    }}>Enter</kbd> to send.
                  </p>
                )}
              </div>
            ) : (
              messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))
            )}

            {loading && (
              <div role="status" aria-live="polite" aria-label="BB is composing a reply">
                <div style={{
                  background: 'rgba(59,130,246,0.2)',
                  border: '1px solid rgba(59,130,246,0.4)',
                  borderRadius: '8px', padding: '12px 16px', maxWidth: '70%',
                  display: 'flex', gap: '6px', alignItems: 'center',
                }}>
                  <span style={{ fontSize: '12px', color: '#A0A0A0' }}>BB is typing</span>
                  <span aria-hidden="true" style={{ display: 'flex', gap: '4px' }}>
                    <span style={{ animation: 'pulse 1s infinite' }}>•</span>
                    <span style={{ animation: 'pulse 1s infinite', animationDelay: '0.2s' }}>•</span>
                    <span style={{ animation: 'pulse 1s infinite', animationDelay: '0.4s' }}>•</span>
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                aria-live="assertive"
                style={{
                  background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.5)',
                  borderRadius: '8px', padding: '12px 16px', color: '#FCA5A5',
                  fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <span>{error}</span>
                <button
                  onClick={clearError}
                  aria-label="Dismiss error"
                  style={{ background: 'none', border: 'none', color: '#FCA5A5', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
            )}

            <div ref={messagesEndRef} aria-hidden="true" />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            aria-label="Send a message to BB"
            style={{
              padding: '16px', borderTop: '1px solid rgba(212,175,55,0.2)',
              display: 'flex', gap: '8px',
            }}
          >
            <label htmlFor="bb-message-input" className="sr-only" style={{
              position: 'absolute', width: '1px', height: '1px',
              padding: 0, margin: '-1px', overflow: 'hidden',
              clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0,
            }}>
              Message BB
            </label>
            <input
              id="bb-message-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={voiceSupported ? 'Ask BB anything… or use 🎤' : 'Ask BB anything…'}
              disabled={loading}
              autoComplete="off"
              aria-label="Message to BB"
              aria-disabled={loading}
              style={{
                flex: 1, padding: '10px 12px',
                background: 'rgba(13,15,18,0.8)',
                border: '1px solid rgba(212,175,55,0.2)',
                borderRadius: '8px', color: '#fff', fontSize: '13px',
                opacity: loading ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'text',
              }}
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              aria-label="Send message"
              style={{
                padding: '10px 14px',
                background: !inputValue.trim()
                  ? 'rgba(212,175,55,0.3)'
                  : 'linear-gradient(135deg,#FFD700 0%,#FFF44F 50%,#FFD700 100%)',
                color: '#0a0e27', border: 'none', borderRadius: '8px',
                fontSize: '14px', fontWeight: '700',
                cursor: !inputValue.trim() ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              ↑
            </button>
          </form>

          <style>{`
            @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
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
      style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', gap: '8px' }}
      role="article"
      aria-label={`${isUser ? 'Your' : "BB's"} message`}
    >
      <div style={{
        maxWidth: '70%', padding: '12px 16px', borderRadius: '8px',
        background: isUser
          ? 'linear-gradient(135deg,#3B82F6 0%,#2563EB 100%)'
          : 'rgba(59,130,246,0.2)',
        border: isUser ? 'none' : '1px solid rgba(59,130,246,0.4)',
        color: isUser ? '#fff' : '#E0E7FF',
        fontSize: '13px', lineHeight: '1.5', wordWrap: 'break-word',
      }}>
        {message.content}
        <div style={{ fontSize: '11px', marginTop: '6px', opacity: 0.7 }}>
          <time dateTime={message.timestamp}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </time>
        </div>
      </div>
    </div>
  );
}
