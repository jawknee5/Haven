import React, { useEffect, useRef, useState } from 'react';
import { useBbChatStore } from '../../stores/bbChatStore';
import { useAuthStore } from '../../stores/index';
import { bbService } from '../../lib/services/bbService';

interface FormAnalysisState {
  analyzing: boolean;
  result: any;
  editedData: Record<string, any>;
}

interface TrackingState {
  tracking: boolean;
  applications: any[];
}

/**
 * Enhanced BB Chat Component with Form Analysis and Tracking
 * Fully integrated with backend API endpoints
 */
export function EnhancedBbChat() {
  const { messages, loading, sendMessage, userId, setUserId, error, clearError } = useBbChatStore();
  const { user } = useAuthStore();
  const [inputValue, setInputValue] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [formAnalysis, setFormAnalysis] = useState<FormAnalysisState>({
    analyzing: false,
    result: null,
    editedData: {}
  });
  const [tracking, setTracking] = useState<TrackingState>({
    tracking: false,
    applications: []
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session
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
    if (!inputValue.trim() || loading) return;

    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message);
  };

  const handleAnalyzeForm = async (formHtml: string) => {
    setFormAnalysis({ ...formAnalysis, analyzing: true });
    try {
      const result = await bbService.analyzeForm(formHtml);
      setFormAnalysis({
        analyzing: false,
        result,
        editedData: result.preFilledData || {}
      });
    } catch (err) {
      console.error('Form analysis failed:', err);
      setFormAnalysis({ ...formAnalysis, analyzing: false });
    }
  };

  const handleTrackApplication = async (agencyName: string, appData: Record<string, any>) => {
    setTracking({ ...tracking, tracking: true });
    try {
      const record = await bbService.trackApplication(agencyName, appData);
      setTracking({
        tracking: false,
        applications: [...tracking.applications, record]
      });
    } catch (err) {
      console.error('Application tracking failed:', err);
      setTracking({ ...tracking, tracking: false });
    }
  };

  const handleSubmitForm = async () => {
    if (!formAnalysis.result) return;
    
    try {
      // Submit form data
      const result = await bbService.autoFillForm(
        formAnalysis.result.id,
        formAnalysis.editedData
      );
      
      // Add success message
      await sendMessage(`Successfully submitted form with ${Object.keys(formAnalysis.editedData).length} fields filled.`);
      
      // Clear form analysis
      setFormAnalysis({ analyzing: false, result: null, editedData: {} });
    } catch (err) {
      console.error('Form submission failed:', err);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      gap: '16px'
    }}>
      {/* Messages Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        paddingBottom: '16px'
      }}>
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {loading && <TypingIndicator />}

        {error && (
          <ErrorBanner
            message={error}
            onDismiss={clearError}
          />
        )}

        {/* Form Analysis Display */}
        {formAnalysis.result && (
          <FormAnalysisPanel
            result={formAnalysis.result}
            editedData={formAnalysis.editedData}
            onEditField={(fieldName, value) => {
              setFormAnalysis({
                ...formAnalysis,
                editedData: { ...formAnalysis.editedData, [fieldName]: value }
              });
            }}
            onSubmit={handleSubmitForm}
          />
        )}

        {/* Application Tracking Display */}
        {tracking.applications.length > 0 && (
          <ApplicationTrackingPanel
            applications={tracking.applications}
            onRefresh={async (appId) => {
              try {
                const updated = await bbService.getApplicationStatus(appId);
                setTracking({
                  ...tracking,
                  applications: tracking.applications.map(app =>
                    app.id === appId ? updated : app
                  )
                });
              } catch (err) {
                console.error('Status refresh failed:', err);
              }
            }}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} style={{
        display: 'flex',
        gap: '8px',
        borderTop: '1px solid rgba(212, 175, 55, 0.2)',
        paddingTop: '12px'
      }}>
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
            cursor: loading ? 'not-allowed' : 'text',
            fontFamily: 'inherit'
          }}
          aria-label="Message input"
          role="textbox"
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
            opacity: loading ? 0.6 : 1,
            transition: 'all 0.3s'
          }}
          aria-label="Send message"
        >
          ↑
        </button>
      </form>
    </div>
  );
}

// ============= Subcomponents =============

function ChatBubble({ message }: any) {
  const isUser = message.role === 'user';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        gap: '8px'
      }}
      role="article"
      aria-label={`${isUser ? 'Your' : 'BB'} message`}
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
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px' }}>
      <div style={{
        background: 'rgba(59, 130, 246, 0.2)',
        border: '1px solid rgba(59, 130, 246, 0.4)',
        borderRadius: '8px',
        padding: '12px 16px',
        display: 'flex',
        gap: '6px',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '12px', color: '#A0A0A0' }}>BB is typing</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[0, 0.2, 0.4].map((delay, i) => (
            <span
              key={i}
              style={{
                animation: 'pulse 1s infinite',
                animationDelay: `${delay}s`,
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 0.4 },
                  '50%': { opacity: 1 }
                }
              }}
            >
              •
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorBanner({ message, onDismiss }: any) {
  return (
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
      role="alert"
      aria-live="polite"
    >
      <span>{message}</span>
      <button
        onClick={onDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: '#FCA5A5',
          cursor: 'pointer',
          fontSize: '18px',
          padding: '0 8px'
        }}
        aria-label="Dismiss error"
      >
        ✕
      </button>
    </div>
  );
}

function FormAnalysisPanel({ result, editedData, onEditField, onSubmit }: any) {
  return (
    <div style={{
      background: 'rgba(26, 30, 36, 0.8)',
      border: '1px solid rgba(212, 175, 55, 0.4)',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px'
    }}>
      <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '700', color: '#FFD700' }}>
        📋 Form Analysis
      </h4>

      {/* Fields */}
      {result.fields?.map((field: any) => (
        <div key={field.name} style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: '600',
            color: '#A0A0A0',
            marginBottom: '4px',
            textTransform: 'uppercase'
          }}>
            {field.label}
            {field.required && <span style={{ color: '#FCA5A5' }}> *</span>}
          </label>
          <input
            type={field.type}
            value={editedData[field.name] || ''}
            onChange={(e) => onEditField(field.name, e.target.value)}
            placeholder={field.label}
            style={{
              width: '100%',
              padding: '8px 10px',
              background: 'rgba(13, 15, 18, 0.8)',
              border: editedData[field.name] 
                ? '1px solid rgba(34, 197, 94, 0.4)' 
                : '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '12px',
              boxSizing: 'border-box',
              fontFamily: 'inherit'
            }}
            aria-label={field.label}
          />
        </div>
      ))}

      {/* Missing Fields Warning */}
      {result.missingFields?.length > 0 && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '6px',
          padding: '8px 12px',
          marginBottom: '12px',
          fontSize: '11px',
          color: '#FCA5A5'
        }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>⚠️ Missing required fields:</p>
          <ul style={{ margin: '0', paddingLeft: '16px' }}>
            {result.missingFields.map((field: string) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={onSubmit}
        style={{
          width: '100%',
          padding: '10px 12px',
          background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
        aria-label="Submit form"
      >
        ✓ Submit Form
      </button>
    </div>
  );
}

function ApplicationTrackingPanel({ applications, onRefresh }: any) {
  return (
    <div style={{
      background: 'rgba(26, 30, 36, 0.8)',
      border: '1px solid rgba(212, 175, 55, 0.4)',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px'
    }}>
      <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '700', color: '#FFD700' }}>
        📍 Tracked Applications
      </h4>

      {applications.map((app: any) => (
        <div
          key={app.id}
          style={{
            background: 'rgba(13, 15, 18, 0.8)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '8px'
          }}
          role="region"
          aria-label={`${app.agencyName} application tracking`}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '600', margin: '0 0 4px 0' }}>
                {app.agencyName}
              </p>
              <p style={{ fontSize: '11px', color: '#A0A0A0', margin: 0 }}>
                ID: {app.applicationId}
              </p>
            </div>
            <span style={{
              display: 'inline-block',
              padding: '4px 10px',
              background: getStatusColor(app.status),
              color: '#000',
              borderRadius: '10px',
              fontSize: '10px',
              fontWeight: '700'
            }}>
              {app.status}
            </span>
          </div>

          <div style={{
            fontSize: '11px',
            color: '#A0A0A0',
            marginBottom: '8px'
          }}>
            <p style={{ margin: '0 0 4px 0' }}>
              Submitted: {new Date(app.submittedDate).toLocaleDateString()}
            </p>
            <p style={{ margin: 0 }}>
              Updated: {new Date(app.lastUpdateDate).toLocaleDateString()}
            </p>
          </div>

          <button
            onClick={() => onRefresh(app.id)}
            style={{
              width: '100%',
              padding: '6px 10px',
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              color: '#3B82F6',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            aria-label={`Check status for ${app.agencyName}`}
          >
            🔄 Check Status
          </button>
        </div>
      ))}
    </div>
  );
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    'APPROVED': '#90EE90',
    'DENIED': '#FF6B6B',
    'PENDING': '#FFD700',
    'SUBMITTED': '#87CEEB'
  };
  return colors[status] || '#A0A0A0';
}
