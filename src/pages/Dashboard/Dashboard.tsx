import React, { useEffect, useState } from 'react';
import { useCaseStore } from '../../stores/caseStore';
import { useResourceStore } from '../../stores/resourceStore';
import { Case } from '../../lib/api';

export default function Dashboard() {
  const { cases, loading: casesLoading, error: casesError, fetchCases, createCase, setStatusFilter, setSearchQuery, filteredCases } = useCaseStore();
  const { resources, loading: resourcesLoading, fetchResources } = useResourceStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCases();
    fetchResources();
  }, []);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    
    setFormLoading(true);
    try {
      await createCase(formData);
      setFormData({ title: '', description: '', category: '' });
      setShowCreateForm(false);
    } catch (err) {
      console.error('Failed to create case:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setSearchQuery(term);
  };

  const caseStats = {
    total: cases.length,
    new: cases.filter(c => c.status === 'NEW').length,
    enriched: cases.filter(c => c.status === 'ENRICHED').length,
    routed: cases.filter(c => c.status === 'ROUTED').length,
    completed: cases.filter(c => c.status === 'COMPLETED').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return '#FFA500';
      case 'ENRICHED': return '#FFD700';
      case 'ROUTED': return '#87CEEB';
      case 'COMPLETED': return '#90EE90';
      default: return '#A0A0A0';
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '32px',
          marginBottom: '8px',
          background: 'linear-gradient(135deg, #d4af37 0%, #f0d66d 50%, #d4af37 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          My Cases
        </h1>
        <p style={{ color: '#A0A0A0', fontSize: '14px' }}>Manage your cases and track progress</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="Total Cases" value={caseStats.total} icon="📋" color="#d4af37" />
        <StatCard label="New" value={caseStats.new} icon="🆕" color="#FFA500" />
        <StatCard label="Enriched" value={caseStats.enriched} icon="✨" color="#FFD700" />
        <StatCard label="Routed" value={caseStats.routed} icon="📍" color="#87CEEB" />
        <StatCard label="Completed" value={caseStats.completed} icon="✅" color="#90EE90" />
      </div>

      {/* Create Case Button */}
      <div style={{ marginBottom: '32px' }}>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFF44F 50%, #FFD700 100%)',
            color: '#0a0e27',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(212, 175, 55, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {showCreateForm ? '✕ Cancel' : '+ Create New Case'}
        </button>
      </div>

      {/* Create Case Form */}
      {showCreateForm && (
        <div style={{
          background: 'rgba(26, 30, 36, 0.8)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <form onSubmit={handleCreateCase}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#A0A0A0', marginBottom: '8px', textTransform: 'uppercase' }}>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Case title..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(13, 15, 18, 0.8)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#A0A0A0', marginBottom: '8px', textTransform: 'uppercase' }}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your case..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(13, 15, 18, 0.8)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  minHeight: '100px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#A0A0A0', marginBottom: '8px', textTransform: 'uppercase' }}>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(13, 15, 18, 0.8)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              >
                <option value="">Select category...</option>
                <option value="HOUSING">Housing</option>
                <option value="EMPLOYMENT">Employment</option>
                <option value="HEALTH">Health</option>
                <option value="EDUCATION">Education</option>
                <option value="FINANCIAL">Financial</option>
                <option value="LEGAL">Legal</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={formLoading}
              style={{
                padding: '10px 20px',
                background: '#3B82F6',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: formLoading ? 'not-allowed' : 'pointer',
                opacity: formLoading ? 0.6 : 1
              }}
            >
              {formLoading ? 'Creating...' : 'Create Case'}
            </button>
          </form>
        </div>
      )}

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search cases..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '10px 12px',
            background: 'rgba(13, 15, 18, 0.8)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px'
          }}
        />
        <select
          onChange={(e) => setStatusFilter(e.target.value as any)}
          style={{
            padding: '10px 12px',
            background: 'rgba(13, 15, 18, 0.8)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px'
          }}
        >
          <option value="ALL">All Status</option>
          <option value="NEW">New</option>
          <option value="ENRICHED">Enriched</option>
          <option value="ROUTED">Routed</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Error Display */}
      {casesError && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#FCA5A5',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>{casesError}</span>
        </div>
      )}

      {/* Cases List or Empty State */}
      {casesLoading ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: '#A0A0A0' }}>
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
          <p>Loading cases...</p>
        </div>
      ) : filteredCases.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: '#A0A0A0' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📭</div>
          <p>No cases yet. Create your first case to get started!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredCases.map((c) => (
            <CaseCard
              key={c.id}
              case={c}
              onSelect={() => setSelectedCase(c)}
              statusColor={getStatusColor(c.status)}
            />
          ))}
        </div>
      )}

      {/* Case Detail Modal */}
      {selectedCase && (
        <CaseDetailModal
          case={selectedCase}
          onClose={() => setSelectedCase(null)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <div style={{
      background: 'rgba(26, 30, 36, 0.8)',
      border: '1px solid rgba(42, 47, 54, 0.8)',
      borderRadius: '12px',
      padding: '16px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '20px', fontWeight: '700', color, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
    </div>
  );
}

function CaseCard({ case: c, onSelect, statusColor }: any) {
  return (
    <div
      onClick={onSelect}
      style={{
        background: 'rgba(26, 30, 36, 0.8)',
        border: '1px solid rgba(42, 47, 54, 0.8)',
        borderRadius: '12px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)';
        e.currentTarget.style.background = 'rgba(26, 30, 36, 0.95)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(42, 47, 54, 0.8)';
        e.currentTarget.style.background = 'rgba(26, 30, 36, 0.8)';
      }}
    >
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>{c.title}</h3>
        <p style={{ fontSize: '13px', color: '#A0A0A0', marginBottom: '8px' }}>{c.description.substring(0, 80)}...</p>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: statusColor,
            color: '#000',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '700'
          }}>
            {c.status}
          </span>
          {c.urgency && (
            <span style={{ fontSize: '12px', color: '#FFD700' }}>
              Urgency: {Math.round(c.urgency * 100)}%
            </span>
          )}
        </div>
      </div>
      <div style={{ fontSize: '20px', color: '#A0A0A0' }}>→</div>
    </div>
  );
}

function CaseDetailModal({ case: c, onClose }: any) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(20, 23, 28, 0.98), rgba(13, 15, 18, 0.95))',
        border: '1px solid rgba(212, 175, 55, 0.5)',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '500px',
        width: '100%',
        color: '#fff',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700' }}>{c.title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#A0A0A0',
              cursor: 'pointer',
              fontSize: '24px'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#A0A0A0', textTransform: 'uppercase', marginBottom: '8px' }}>Description</h3>
          <p style={{ fontSize: '14px', lineHeight: '1.6' }}>{c.description}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#A0A0A0', textTransform: 'uppercase', marginBottom: '8px' }}>Status</h3>
            <span style={{
              display: 'inline-block',
              padding: '6px 14px',
              background: '#FFD700',
              color: '#000',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '700'
            }}>
              {c.status}
            </span>
          </div>
          {c.urgency && (
            <div>
              <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#A0A0A0', textTransform: 'uppercase', marginBottom: '8px' }}>Urgency</h3>
              <div style={{
                background: 'rgba(13, 15, 18, 0.8)',
                borderRadius: '8px',
                height: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${c.urgency * 100}%`,
                  background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '24px', fontSize: '12px', color: '#A0A0A0' }}>
          <p>Created: {new Date(c.createdAt).toLocaleDateString()}</p>
          {c.category && <p>Category: {c.category}</p>}
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            background: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            color: '#3B82F6',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
