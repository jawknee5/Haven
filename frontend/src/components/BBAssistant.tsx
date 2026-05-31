import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import bbMemoryService from '../services/bbMemoryService';
import '../styles/BBAssistant.css';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const BBAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! I\'m BB, your HAVEN assistant. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize BB session and memory on component mount
  useEffect(() => {
    initializeBBSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeBBSession = async () => {
    try {
      // Get or create session
      const session = await bbMemoryService.getSession();
      setSessionId(session.sessionId);

      // Load conversation history
      const history = await bbMemoryService.getConversationHistory(
        session.sessionId,
        50
      );

      // Load system prompt
      const prompt = await bbMemoryService.getSystemPrompt();
      setSystemPrompt(prompt);

      // Set initial message from history or default
      if (history.length === 0) {
        const initialMessage: Message = {
          id: '1',
          type: 'assistant',
          content: 'Hi! I\'m BB, your HAVEN assistant. I remember our past conversations and I\'m here to help you access resources, housing, employment, and community support. What do you need today?',
          timestamp: new Date(),
        };
        setMessages([initialMessage]);
      } else {
        // Convert stored history to messages
        const historyMessages = history
          .filter((msg: any) => msg.role === 'user' || msg.role === 'assistant')
          .map((msg: any, idx: number) => ({
            id: `${idx}`,
            type: msg.role as 'user' | 'assistant',
            content: msg.content,
            timestamp: new Date(msg.timestamp),
          }));
        setMessages(historyMessages.length > 0 ? historyMessages : messages);
      }
    } catch (error) {
      console.error('Error initializing BB session:', error);
      // Fallback to local storage if API unavailable
      const localSessions = await bbMemoryService.getLocalSessions();
      if (localSessions.length > 0) {
        setSessionId(localSessions[0].sessionId);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || !sessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Save user message to memory (session + persistent)
      await bbMemoryService.addMessage(sessionId, {
        role: 'user',
        content: userInput,
        timestamp: new Date(),
      });

      // Store locally for offline support
      await bbMemoryService.storeMessageLocally(sessionId, {
        role: 'user',
        content: userInput,
        timestamp: new Date(),
      });

      // Get BB response from backend
      const response = await fetch('http://backend:5555/api/bb/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          sessionId,
          systemPrompt,
        }),
      });

      if (!response.ok) throw new Error('Chat failed');

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Save assistant message to memory
      await bbMemoryService.addMessage(sessionId, {
        role: 'assistant',
        content: data.response,
        contextTags: data.contextTags || [],
        topics: data.topics || [],
      });

      // Store locally for offline support
      await bbMemoryService.storeMessageLocally(sessionId, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Try to use local storage if network is down
      try {
        const localMessages = await bbMemoryService.getLocalMessages(sessionId);
        console.log('Offline mode - using local message history');
      } catch (localError) {
        console.error('Offline mode not available:', localError);
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I\'m having trouble connecting. If you\'re offline, I can still see your saved conversation history. Try asking again when the connection is restored.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bb-assistant ${isOpen ? 'open' : 'closed'}`}>
      {!isOpen ? (
        <button
          className="bb-fab"
          onClick={() => setIsOpen(true)}
          title="Open BB Assistant"
        >
          <MessageCircle size={24} />
          <span className="bb-label">BB Assistant</span>
        </button>
      ) : (
        <div className={`bb-chat-window ${isMinimized ? 'minimized' : ''}`}>
          <div className="bb-header">
            <div className="bb-title">
              <MessageCircle size={20} />
              <h3>BB Assistant</h3>
            </div>
            <div className="bb-controls">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="bb-control-btn"
              >
                {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="bb-control-btn close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="bb-messages">
                {messages.map((msg) => (
                  <div key={msg.id} className={`message ${msg.type}`}>
                    <div className="message-content">
                      {msg.content}
                      <div className="message-time">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="message assistant loading">
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="bb-input-form">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything..."
                  className="bb-input"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="bb-send-btn"
                  disabled={isLoading || !inputValue.trim()}
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BBAssistant;
