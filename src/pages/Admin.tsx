import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import { useResourceStore } from '../../stores/resourceStore';
import { Case, Resource } from '../../lib/api';

export default function Admin() {
  const {
    allCases,
    selectedCases,
    loading,
    error,
    statusFilter,
    totalCases,
    enrichedCases,
    routedCases,
    completedCases,
    fetchAllCases,
    toggleCaseSelection,
    selectAllCases,
    clearSelection,
    bulkEnrich,
    bulkRoute,
    setStatusFilter,
    setSearchQuery,
  } = useAdminStore();

  const { resources, fetchResources } = useResourceStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [routeFormData, setRouteFormData] = useState<Record<string, string>>({});
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    fetchAllCases();
    fetchResources();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setSearchQuery(term);
  };

  const filteredCases = statusFilter === 'ALL'
    ? allCases
    : allCases.filter(c => c.status === statusFilter);

  const handleBulkEnrich = async () => {
    if (selectedCases.size === 0) return;
    setBulkLoading(true);
    try {
      await bulkEnrich();
    } catch (err) {
      console.error('Bulk enrich failed:', err);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkRoute = async () => {
    if (selectedCases.size === 0 || Object.keys(routeFormData).length === 0) return;
    setBulkLoading(true);
    try {
      await bulkRoute(routeFormData);
      setShowRouteModal(false);
      setRouteFormData({});
    } catch (err) {
      console.error('Bulk route failed:', err);
    } finally {
      setBulkLoading(false);
    }
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
    <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
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
          Caseworker Dashboard
        </h1>
        <p style={{ color: '#A0A0A0', fontSize: '14px' }}>Manage all cases and resources</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="Total Cases" value={totalCases} icon="📋" color="#d4af37" />
        <StatCard label="Enriched" value={enrichedCases} icon="✨" color="#FFD700" />
        <StatCard label="Routed" value={routedCases} icon="📍" color="#87CEEB" />
        <StatCard label="Completed" value={completedCases} icon="✅" color="#90EE90" />
      </div>

      {/* Bulk Actions Toolbar */}
      <div style={{
        background: 'rgba(26, 30, 36, 0.8)',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '200px', fontSize: '14px', color: '#A0A0A0' }}>
          {selectedCases.size} case(s) selected
        </div>
        <button
          onClick={selectAllCases}
          style={{
            padding: '8px 16px',
            background: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            color: '#3B82F6',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          Select All
        </button>
        <button
          onClick={clearSelection}
          style={{
            padding: '8px 16px',
            background: 'rgba(107, 114, 128, 0.2)',
            border: '1px solid rgba(107, 114, 128, 0.4)',
            color: '#9CA3AF',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          Clear
        </button>
        <button
          onClick={handleBulkEnrich}
          disabled={selectedCases.size === 0 || bulkLoading}
          style={{
            padding: '8px 16px',
            background: selectedCases.size === 0 ? 'rgba(107, 114, 128, 0.2)' : 'rgba(34, 197, 94, 0.2)',
            border: '1px solid ' + (selectedCases.size === 0 ? 'rgba(107, 114, 128, 0.4)' : 'rgba(34, 197, 94, 0.4)'),
            color: selectedCases.size === 0 ? '#9CA3AF' : '#22C55E',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: selectedCases.size === 0 ? 'not-allowed' : 'pointer',
            opacity: bulkLoading ? 0.6 : 1
          }}
        >
          {bulkLoading ? '⏳ Enriching...' : `✨ Bulk Enrich (${selectedCases.size})`}
        </button>
        <button
          onClick={() => setShowRouteModal(true)}
          disabled={selectedCases.size === 0 || bulkLoading}
          style={{
            padding: '8px 16px',
            background: selectedCases.size === 0 ? 'rgba(107, 114, 128, 0.2)' : 'rgba(168, 85, 247, 0.2)',
            border: '1px solid ' + (selectedCases.size === 0 ? 'rgba(107, 114, 128, 0.4)' : 'rgba(168, 85, 247, 0.4)'),
            color: selectedCases.size === 0 ? '#9CA3AF' : '#A855F7',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: selectedCases.size === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          📍 Bulk Route ({selectedCases.size})
        </button>
      </div>

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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
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
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#FCA5A5',
          marginBottom: '24px'
        }}>
          {error}
        </div>
      )}

      {/* Cases Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: '#A0A0A0' }}>
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
          <p>Loading cases...</p>
        </div>
      ) : filteredCases.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: '#A0A0A0' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📭</div>
          <p>No cases found.</p>
        </div>
      ) : (
        <div style={{
          background: 'rgba(26, 30, 36, 0.8)',
          border: '1px solid rgba(42, 47, 54, 0.8)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <div style={{
            overflowX: 'auto'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ background: 'rgba(13, 15, 18, 0.8)', borderBottom: '1px solid rgba(42, 47, 54, 0.8)' }}>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: '700',
                    color: '#A0A0A0',
                    textTransform: 'uppercase',
                    fontSize: '12px'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedCases.size === filteredCases.length && filteredCases.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          selectAllCases();
                        } else {
                          clearSelection();
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: '#A0A0A0', textTransform: 'uppercase', fontSize: '12px' }}>Case Title</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: '#A0A0A0', textTransform: 'uppercase', fontSize: '12px' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: '#A0A0A0', textTransform: 'uppercase', fontSize: '12px' }}>Urgency</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: '#A0A0A0', textTransform: 'uppercase', fontSize: '12px' }}>Created</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: '#A0A0A0', textTransform: 'uppercase', fontSize: '12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((c, idx) => (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: idx < filteredCases.length - 1 ? '1px solid rgba(42, 47, 54, 0.4)' : 'none',
                      background: selectedCases.has(c.id) ? 'rgba(212, 175, 55, 0.1)' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '12px' }}>
                      <input
                        type="checkbox"
                        checked={selectedCases.has(c.id)}
                        onChange={() => toggleCaseSelection(c.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '600' }}>{c.title}</div>
                      <div style={{ fontSize: '12px', color: '#A0A0A0', marginTop: '4px' }}>{c.description.substring(0, 50)}...</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        background: getStatusColor(c.status),
                        color: '#000',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {c.urgency ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '60px',
                            height: '6px',
                            background: 'rgba(13, 15, 18, 0.8)',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              height: '100%',
                              width: `${c.urgency * 100}%`,
                              background: 'linear-gradient(90deg, #FFD700, #FFA500)'
                            }} />
                          </div>
                          <span style={{ fontSize: '12px', color: '#FFD700' }}>{Math.round(c.urgency * 100)}%</span>
                        </div>
                      ) : (
                        <span style={{ color: '#A0A0A0', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#A0A0A0' }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => setSelectedCase(c)}
                        style={{
                          padding: '4px 12px',
                          background: 'rgba(59, 130, 246, 0.2)',
                          border: '1px solid rgba(59, 130, 246, 0.4)',
                          color: '#3B82F6',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bulk Route Modal */}
      {showRouteModal && (
        <BulkRouteModal
          selectedCases={selectedCases}
          resources={resources}
          onClose={() => setShowRouteModal(false)}
          onConfirm={handleBulkRoute}
          formData={routeFormData}
          setFormData={setRouteFormData}
          loading={bulkLoading}
        />
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
      <div style={{ fontSize: '20px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '18px', fontWeight: '700', color, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
    </div>
  );
}

function BulkRouteModal({ selectedCases, resources, onClose, onConfirm, formData, setFormData, loading }: any) {
  const caseArray = Array.from(selectedCases);

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
        maxWidth: '600px',
        width: '100%',
        color: '#fff',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Route Cases to Resources</h2>
        <p style={{ color: '#A0A0A0', marginBottom: '24px' }}>Assign a resource to each selected case</p>

        <div style={{ marginBottom: '24px', maxHeight: '200px', overflowY: 'auto' }}>
          {caseArray.map((caseId: string) => (
            <div key={caseId} style={{ marginBottom: '16px', padding: '12px', background: 'rgba(13, 15, 18, 0.8)', borderRadius: '8px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#A0A0A0', marginBottom: '8px' }}>
                Case: {caseId.substring(0, 8)}...
              </label>
              <select
                value={formData[caseId] || ''}
                onChange={(e) => setFormData({ ...formData, [caseId]: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'rgba(26, 30, 36, 0.8)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '13px'
                }}
              >
                <option value="">Select resource...</option>
                {resources.map((r: Resource) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              background: 'rgba(107, 114, 128, 0.2)',
              border: '1px solid rgba(107, 114, 128, 0.4)',
              color: '#9CA3AF',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || Object.keys(formData).length !== caseArray.length}
            style={{
              flex: 1,
              padding: '12px',
              background: Object.keys(formData).length === caseArray.length ? '#3B82F6' : 'rgba(59, 130, 246, 0.4)',
              border: 'none',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: Object.keys(formData).length === caseArray.length ? 'pointer' : 'not-allowed',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Routing...' : 'Route Cases'}
          </button>
        </div>
      </div>
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
