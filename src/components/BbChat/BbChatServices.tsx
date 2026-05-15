import React, { useState } from 'react';
import { useBbChatStore } from '../../stores/bbChatStore';
import { bbService } from '../../lib/services/bbService';

interface FormAnalysisProps {
  formHtml: string;
  onSubmit: (data: Record<string, any>) => void;
}

export function FormAnalysisDisplay({ formHtml, onSubmit }: FormAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [editedData, setEditedData] = useState<Record<string, any>>({});

  React.useEffect(() => {
    analyzeForm();
  }, [formHtml]);

  const analyzeForm = async () => {
    setLoading(true);
    try {
      const result = await bbService.analyzeForm(formHtml);
      setAnalysisResult(result);
      // Pre-fill with BB's suggestions
      const prefilledData = result.preFilledData || {};
      setEditedData(prefilledData);
    } catch (err) {
      console.error('Form analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: '#A0A0A0' }}>
        <div style={{ marginBottom: '8px' }}>⏳ Analyzing form...</div>
      </div>
    );
  }

  if (!analysisResult) {
    return null;
  }

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

      {/* Pre-filled fields */}
      <div style={{ marginBottom: '12px' }}>
        <p style={{ fontSize: '11px', color: '#A0A0A0', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
          ✨ Pre-filled Fields
        </p>
        {analysisResult.fields?.map((field: any) => (
          <div key={field.name} style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>
              {field.label}
            </label>
            <input
              type={field.type}
              value={editedData[field.name] || ''}
              onChange={(e) => setEditedData({ ...editedData, [field.name]: e.target.value })}
              placeholder={field.label}
              style={{
                width: '100%',
                padding: '8px 10px',
                background: 'rgba(13, 15, 18, 0.8)',
                border: editedData[field.name] ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        ))}
      </div>

      {/* Missing fields */}
      {analysisResult.missingFields?.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <p style={{ fontSize: '11px', color: '#FCA5A5', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
            ⚠️ Missing Fields
          </p>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#FCA5A5' }}>
            {analysisResult.missingFields.map((field: string) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => onSubmit(editedData)}
        style={{
          width: '100%',
          padding: '8px 12px',
          background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '700',
          cursor: 'pointer'
        }}
      >
        ✓ Submit Form
      </button>
    </div>
  );
}

interface ApplicationTrackingProps {
  trackingData: any[];
}

export function ApplicationTrackingDisplay({ trackingData }: ApplicationTrackingProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async (trackingId: string) => {
    setRefreshing(true);
    try {
      await bbService.getApplicationStatus(trackingId);
      // In real implementation, would update the tracking data
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  };

  if (!trackingData || trackingData.length === 0) {
    return null;
  }

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

      {trackingData.map((app: any) => (
        <div
          key={app.id}
          style={{
            background: 'rgba(13, 15, 18, 0.8)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '8px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '600', margin: '0 0 4px 0' }}>{app.agencyName}</p>
              <p style={{ fontSize: '11px', color: '#A0A0A0', margin: 0 }}>ID: {app.applicationId}</p>
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
            onClick={() => handleRefresh(app.id)}
            disabled={refreshing}
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
              opacity: refreshing ? 0.6 : 1
            }}
          >
            {refreshing ? '⏳ Refreshing...' : '🔄 Check Status'}
          </button>
        </div>
      ))}
    </div>
  );
}

interface SuggestionCardProps {
  title: string;
  description: string;
  action: () => void;
  icon: string;
}

export function SuggestionCard({ title, description, action, icon }: SuggestionCardProps) {
  return (
    <div
      onClick={action}
      style={{
        background: 'rgba(26, 30, 36, 0.8)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s',
        display: 'flex',
        gap: '12px',
        alignItems: 'start'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.6)';
        e.currentTarget.style.background = 'rgba(26, 30, 36, 0.95)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
        e.currentTarget.style.background = 'rgba(26, 30, 36, 0.8)';
      }}
    >
      <span style={{ fontSize: '20px' }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '12px', fontWeight: '600', margin: '0 0 4px 0', color: '#FFD700' }}>
          {title}
        </p>
        <p style={{ fontSize: '11px', color: '#A0A0A0', margin: 0 }}>
          {description}
        </p>
      </div>
      <span style={{ color: '#A0A0A0', fontSize: '14px' }}>→</span>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'APPROVED': return '#90EE90';
    case 'DENIED': return '#FF6B6B';
    case 'PENDING': return '#FFD700';
    case 'SUBMITTED': return '#87CEEB';
    default: return '#A0A0A0';
  }
}
