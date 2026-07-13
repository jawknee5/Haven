import React, { useEffect, useState } from 'react';
import { useCaseStore } from '../../stores/caseStore';
import { useAuthStore } from '../../stores/index';
import { Case, caseStatusLabel } from '../../lib/api';

export default function Dashboard() {
  const {
    cases, loading, error,
    fetchCases, createCase, claimCase,
    setStatusFilter, setSearchQuery, filteredCases,
  } = useCaseStore();
  const { user } = useAuthStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'general' });
  const [formLoading, setFormLoading] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchCases(); }, []);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    setFormLoading(true);
    try {
      await createCase(formData);
      setFormData({ title: '', description: '', category: 'general' });
      setShowCreateForm(false);
    } catch {
      // error shown via store
    } finally {
      setFormLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setSearchQuery(term);
  };

  const counts = {
    total: cases.length,
    new: cases.filter((c) => c.status === 'new').length,
    active: cases.filter((c) => c.status === 'active').length,
    resolved: cases.filter((c) => c.status === 'resolved').length,
  };

  const urgencyColor = (score: number) => {
    if (score >= 80) return '#ef4444';
    if (score >= 50) return '#f97316';
    return '#22c55e';
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', color: '#fff', fontFamily: 'system-ui,-apple-system,sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '32px', marginBottom: '8px',
          background: 'linear-gradient(135deg,#d4af37 0%,#f0d66d 50%,#d4af37 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          {user?.role === 'caseworker' ? 'Case Queue' : 'My Cases'}
        </h1>
        <p style={{ color: '#a0a0a0', fontSize: '14px', margin: 0 }}>Manage cases and track progress</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="Total" value={counts.total} icon="📋" color="#d4af37" />
        <StatCard label="New" value={counts.new} icon="🆕" color="#ffa500" />
        <StatCard label="Active" value={counts.active} icon="⚡" color="#3b82f6" />
        <StatCard label="Resolved" value={counts.resolved} icon="✅" color="#22c55e" />
      </div>

      {/* Create button — residents + caseworkers */}
      {(user?.role === 'resident' || user?.role === 'caseworker') && (
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg,#FFD700 0%,#FFF44F 50%,#FFD700 100%)',
              color: '#0a0e27', border: 'none', borderRadius: '8px',
              fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            }}
          >
            {showCreateForm ? '✕ Cancel' : '+ New Case'}
          </button>
        </div>
      )}

      {/* Create form */}
      {showCreateForm && (
        <div style={{
          background: 'rgba(26,30,36,0.8)',
          border: '1px solid rgba(212,175,55,0.4)',
          borderRadius: '12px', padding: '24px', marginBottom: '32px',
        }}>
          <form onSubmit={handleCreateCase}>
            {[
              { label: 'Title', key: 'title', type: 'text' as const },
            ].map(({ label, key, type }) => (
              <div key={key} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#a0a0a0', marginBottom: '8px', textTransform: 'uppercase' }}>{label}</label>
                <input
                  type={type}
                  value={formData[key as keyof typeof formData]}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(13,15,18,0.8)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            ))}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#a0a0a0', marginBottom: '8px', textTransform: 'uppercase' }}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                style={{ width: '100%', padding: '10px 12px', background: 'rgba(13,15,18,0.8)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', color: '#fff', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#a0a0a0', marginBottom: '8px', textTransform: 'uppercase' }}>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', background: 'rgba(13,15,18,0.8)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', color: '#fff', fontSize: '14px' }}
              >
                {['general','housing','food','health','benefits','employment','legal','crisis'].map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>

            <button
              type="submit" disabled={formLoading}
              style={{ padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: formLoading ? 'not-allowed' : 'pointer', opacity: formLoading ? 0.6 : 1 }}
            >
              {formLoading ? 'Creating…' : 'Create Case'}
            </button>
          </form>
        </div>
      )}

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search cases…"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '10px 12px', background: 'rgba(13,15,18,0.8)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', color: '#fff', fontSize: '14px' }}
        />
        <select
          onChange={(e) => setStatusFilter(e.target.value as any)}
          style={{ padding: '10px 12px', background: 'rgba(13,15,18,0.8)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', color: '#fff', fontSize: '14px' }}
        >
          <option value="all">All Status</option>
          {['new','enriched','routed','active','resolved','closed'].map((s) => (
            <option key={s} value={s}>{caseStatusLabel(s)}</option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.5)', borderRadius: '8px', padding: '12px 16px', color: '#fca5a5', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: '#a0a0a0' }}>⏳ Loading cases…</div>
      ) : filteredCases.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: '#a0a0a0' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📭</div>
          <p>No cases yet. Create your first case to get started!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {filteredCases.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCase(c)}
              style={{
                background: 'rgba(26,30,36,0.8)',
                border: '1px solid rgba(42,47,54,0.8)',
                borderRadius: '12px', padding: '16px', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>{c.title}</h3>
                  <span style={{
                    padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700,
                    background: 'rgba(212,175,55,0.15)', color: '#d4af37',
                  }}>
                    {caseStatusLabel(c.status)}
                  </span>
                  {c.category && (
                    <span style={{ fontSize: '11px', color: '#a0a0a0', textTransform: 'uppercase' }}>{c.category}</span>
                  )}
                </div>
                <p style={{ fontSize: '13px', color: '#a0a0a0', margin: 0 }}>
                  {c.description.slice(0, 100)}{c.description.length > 100 ? '…' : ''}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', marginLeft: '16px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: `conic-gradient(${urgencyColor(c.urgency_score)} ${c.urgency_score * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700, color: urgencyColor(c.urgency_score),
                }}>
                  {c.urgency_score}
                </div>
                {user?.role === 'caseworker' && !c.caseworker_id && (
                  <button
                    onClick={(e) => { e.stopPropagation(); claimCase(c.id); }}
                    style={{
                      padding: '4px 10px', fontSize: '11px', fontWeight: 700,
                      background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.4)',
                      color: '#3b82f6', borderRadius: '6px', cursor: 'pointer',
                    }}
                  >
                    Claim
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Case detail modal */}
      {selectedCase && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}
          onClick={() => setSelectedCase(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg,rgba(20,23,28,0.98),rgba(13,15,18,0.95))',
              border: '1px solid rgba(212,175,55,0.5)',
              borderRadius: '12px', padding: '32px', maxWidth: '560px', width: '100%',
              color: '#fff', maxHeight: '80vh', overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>{selectedCase.title}</h2>
              <button onClick={() => setSelectedCase(null)} style={{ background: 'none', border: 'none', color: '#a0a0a0', cursor: 'pointer', fontSize: '24px', lineHeight: 1 }}>×</button>
            </div>

            <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#d1d5db', marginBottom: '20px' }}>{selectedCase.description}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Status', value: caseStatusLabel(selectedCase.status) },
                { label: 'Category', value: selectedCase.category },
                { label: 'Urgency', value: `${selectedCase.urgency_score}/100` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: '11px', color: '#a0a0a0', textTransform: 'uppercase', margin: '0 0 4px' }}>{label}</p>
                  <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>{value}</p>
                </div>
              ))}
            </div>

            {selectedCase.caseworker_name && (
              <p style={{ fontSize: '13px', color: '#a0a0a0', marginBottom: '12px' }}>
                Caseworker: <span style={{ color: '#fff' }}>{selectedCase.caseworker_name}</span>
              </p>
            )}

            <p style={{ fontSize: '12px', color: '#6b7280' }}>
              Created: {new Date(selectedCase.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div style={{ background: 'rgba(26,30,36,0.8)', border: '1px solid rgba(42,47,54,0.8)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '20px', fontWeight: 700, color, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#a0a0a0', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
    </div>
  );
}
