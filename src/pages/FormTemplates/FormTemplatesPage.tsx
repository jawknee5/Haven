import React, { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api';
import { useAuthStore } from '../../stores/index';

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

interface Template {
  id: string;
  name: string;
  agency: string;
  category: string;
  description: string;
  sla_days: number;
  fields?: FormField[];
}

interface Submission {
  id: string;
  template_id: string;
  template_name: string;
  submitted_at: string;
}

export default function FormTemplatesPage() {
  const { user } = useAuthStore();
  const [templates, setTemplates]     = useState<Template[]>([]);
  const [selected,  setSelected]      = useState<Template | null>(null);
  const [formData,  setFormData]      = useState<Record<string,string>>({});
  const [loading,   setLoading]       = useState(false);
  const [autofilling, setAutofilling] = useState(false);
  const [lastSub,   setLastSub]       = useState<Submission | null>(null);
  const [error,     setError]         = useState('');

  useEffect(() => {
    apiClient.get<Template[]>('/api/form-templates')
      .then(setTemplates)
      .catch(() => setError('Failed to load templates'));
  }, []);

  const openTemplate = async (t: Template) => {
    const full = await apiClient.get<Template>(`/api/form-templates/${t.id}`);
    setSelected(full);
    setFormData({});
    setLastSub(null);
    setError('');
  };

  const handleAutofill = async () => {
    if (!selected) return;
    setAutofilling(true);
    try {
      const res = await apiClient.post<{ filled: Record<string,string> }>(
        `/api/form-templates/${selected.id}/autofill`, {}
      );
      setFormData(prev => ({ ...prev, ...res.filled }));
    } catch {
      setError('Autofill failed');
    } finally {
      setAutofilling(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    setError('');
    try {
      const sub = await apiClient.post<Submission>(
        `/api/form-templates/${selected.id}/submit`,
        { data: formData }
      );
      setLastSub(sub);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async (submissionId: string) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/form-templates/submissions/${submissionId}/pdf`,
      { headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } }
    );
    if (!res.ok) { setError('PDF download failed'); return; }
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `HAVEN_form_${submissionId.slice(0,8)}.pdf`; a.click();
    URL.revokeObjectURL(url);
  };

  const categoryColor: Record<string,string> = {
    housing: '#3b82f6', food: '#22c55e', health: '#ec4899',
    benefits: '#d4af37', employment: '#f97316', legal: '#8b5cf6',
    identity: '#06b6d4', family: '#ef4444', intake: '#a3a3a3',
  };

  const card: React.CSSProperties = {
    background: 'rgba(26,30,36,0.8)',
    border: '1px solid rgba(42,47,54,0.8)',
    borderRadius: '12px', padding: '20px', cursor: 'pointer',
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      <h1 style={{
        fontSize: '32px', marginBottom: '8px',
        background: 'linear-gradient(135deg,#d4af37 0%,#f0d66d 50%,#d4af37 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>
        Form Templates
      </h1>
      <p style={{ color: '#a0a0a0', marginBottom: '32px', fontSize: '14px' }}>
        13 pre-built agency forms with BB autofill and PDF export.
      </p>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
          borderRadius: '8px', padding: '12px', color: '#fca5a5', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Template grid */}
      {!selected && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
          {templates.map(t => (
            <div key={t.id} style={card} onClick={() => openTemplate(t)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span style={{
                  padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700,
                  background: `${categoryColor[t.category] ?? '#a3a3a3'}22`,
                  color: categoryColor[t.category] ?? '#a3a3a3',
                }}>
                  {t.category}
                </span>
                <span style={{ fontSize: '11px', color: '#6b7280' }}>SLA: {t.sla_days}d</span>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px' }}>{t.name}</h3>
              <p style={{ fontSize: '12px', color: '#a0a0a0', margin: 0 }}>{t.agency}</p>
            </div>
          ))}
        </div>
      )}

      {/* Form view */}
      {selected && !lastSub && (
        <div>
          <button
            onClick={() => setSelected(null)}
            style={{ background: 'none', border: 'none', color: '#d4af37', cursor: 'pointer',
              fontSize: '14px', marginBottom: '20px', padding: 0 }}
          >
            ← Back to templates
          </button>

          <div style={{ ...card, cursor: 'default', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>{selected.name}</h2>
                <p style={{ color: '#a0a0a0', fontSize: '13px', margin: '0 0 12px' }}>{selected.agency}</p>
                <p style={{ fontSize: '13px', color: '#d1d5db' }}>{selected.description}</p>
              </div>
              <button
                onClick={handleAutofill} disabled={autofilling}
                style={{ padding: '8px 16px', background: 'rgba(212,175,55,0.15)',
                  border: '1px solid rgba(212,175,55,0.4)', color: '#d4af37',
                  borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                  whiteSpace: 'nowrap', opacity: autofilling ? 0.6 : 1 }}
              >
                {autofilling ? '✨ Filling…' : '✨ BB Autofill'}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              {(selected.fields ?? []).map(f => (
                <div key={f.name} style={f.type === 'textarea' ? { gridColumn: '1/-1' } : {}}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#a0a0a0',
                    textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.04em' }}>
                    {f.label}{f.required && <span style={{ color: '#ef4444' }}> *</span>}
                  </label>
                  {f.type === 'select' ? (
                    <select
                      value={formData[f.name] ?? ''}
                      onChange={e => setFormData(p => ({ ...p, [f.name]: e.target.value }))}
                      required={f.required}
                      style={{ width: '100%', padding: '10px 12px', background: 'rgba(13,15,18,0.8)',
                        border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px',
                        color: '#fff', fontSize: '14px' }}
                    >
                      <option value="">Select…</option>
                      {(f.options ?? []).map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea
                      value={formData[f.name] ?? ''}
                      onChange={e => setFormData(p => ({ ...p, [f.name]: e.target.value }))}
                      required={f.required} rows={3}
                      style={{ width: '100%', padding: '10px 12px', background: 'rgba(13,15,18,0.8)',
                        border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px',
                        color: '#fff', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical',
                        boxSizing: 'border-box' }}
                    />
                  ) : (
                    <input
                      type={f.type}
                      value={formData[f.name] ?? ''}
                      onChange={e => setFormData(p => ({ ...p, [f.name]: e.target.value }))}
                      required={f.required}
                      style={{ width: '100%', padding: '10px 12px', background: 'rgba(13,15,18,0.8)',
                        border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px',
                        color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              type="submit" disabled={loading}
              style={{ padding: '12px 28px', background: 'linear-gradient(135deg,#FFD700 0%,#FFF44F 50%,#FFD700 100%)',
                color: '#0a0e27', border: 'none', borderRadius: '8px', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Submitting…' : 'Submit Application'}
            </button>
          </form>
        </div>
      )}

      {/* Post-submit */}
      {lastSub && (
        <div style={{ ...card, cursor: 'default', textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px', color: '#22c55e' }}>
            Submitted!
          </h2>
          <p style={{ color: '#a0a0a0', marginBottom: '8px' }}>
            {lastSub.template_name}
          </p>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '24px' }}>
            ID: {lastSub.id}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => downloadPdf(lastSub.id)}
              data-testid="download-pdf-btn"
              style={{ padding: '10px 20px', background: 'rgba(212,175,55,0.15)',
                border: '1px solid rgba(212,175,55,0.4)', color: '#d4af37',
                borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
            >
              ⬇ Download PDF
            </button>
            <button
              onClick={() => { setSelected(null); setLastSub(null); }}
              style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', color: '#a0a0a0',
                borderRadius: '8px', cursor: 'pointer' }}
            >
              Back to Templates
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
