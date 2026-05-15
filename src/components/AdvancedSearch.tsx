import React, { useState } from 'react';
import { useSearchStore, SearchFilters, applyFilters } from '../../stores/searchStore';
import { useIsMobile } from '../../hooks/useMediaQuery';

/**
 * Advanced Search Component
 * Multi-field filtering with date range and persistence
 */

export default function AdvancedSearch({
  items,
  onFiltered,
  categories = [],
  assignees = []
}: {
  items: any[];
  onFiltered: (items: any[]) => void;
  categories?: string[];
  assignees?: { id: string; name: string }[];
}) {
  const isMobile = useIsMobile();
  const { filters, setFilter, clearFilters, saveFilter, loadFilter, deleteFilter, savedFilters } = useSearchStore();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [showSave, setShowSave] = useState(false);

  // Apply filters to items
  const filteredItems = applyFilters(items, filters);

  // Update parent component
  React.useEffect(() => {
    onFiltered(filteredItems);
  }, [filters]);

  const handleDateRangeChange = (start: string, end: string) => {
    setFilter('dateRange', start && end ? { start, end } : undefined);
  };

  const handleUrgencyChange = (min: number, max: number) => {
    setFilter('urgency', [min, max]);
  };

  const handleSaveFilter = () => {
    if (filterName.trim()) {
      saveFilter(filterName);
      setFilterName('');
      setShowSave(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(26, 30, 36, 0.8)',
      border: '1px solid rgba(212, 175, 55, 0.4)',
      borderRadius: '12px',
      padding: isMobile ? '12px' : '16px',
      marginBottom: '20px'
    }}>
      {/* Basic Search Bar */}
      <div style={{
        display: 'flex',
        gap: isMobile ? '8px' : '12px',
        marginBottom: '12px',
        flexDirection: isMobile ? 'column' : 'row'
      }}>
        <input
          type="text"
          placeholder="Search title..."
          value={filters.title || ''}
          onChange={(e) => setFilter('title', e.target.value || undefined)}
          style={{
            flex: 1,
            padding: '10px 12px',
            background: 'rgba(13, 15, 18, 0.8)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            padding: '10px 16px',
            background: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            color: '#3B82F6',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          {showAdvanced ? '▼ Advanced' : '▶ Advanced'}
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          padding: '12px 0',
          borderTop: '1px solid rgba(212, 175, 55, 0.2)'
        }}>
          {/* Status Filter */}
          <div>
            <label style={{ fontSize: '11px', color: '#A0A0A0', fontWeight: '700', marginBottom: '4px', display: 'block', textTransform: 'uppercase' }}>
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilter('status', e.target.value || undefined)}
              style={{
                width: '100%',
                padding: '8px',
                background: 'rgba(13, 15, 18, 0.8)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                boxSizing: 'border-box'
              }}
            >
              <option value="">All Status</option>
              <option value="NEW">New</option>
              <option value="ENRICHED">Enriched</option>
              <option value="ROUTED">Routed</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div>
              <label style={{ fontSize: '11px', color: '#A0A0A0', fontWeight: '700', marginBottom: '4px', display: 'block', textTransform: 'uppercase' }}>
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => setFilter('category', e.target.value || undefined)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'rgba(13, 15, 18, 0.8)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '12px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          {/* Assigned To Filter */}
          {assignees.length > 0 && (
            <div>
              <label style={{ fontSize: '11px', color: '#A0A0A0', fontWeight: '700', marginBottom: '4px', display: 'block', textTransform: 'uppercase' }}>
                Assigned To
              </label>
              <select
                value={filters.assignedTo || ''}
                onChange={(e) => setFilter('assignedTo', e.target.value || undefined)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'rgba(13, 15, 18, 0.8)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '12px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">All Users</option>
                {assignees.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Date Range Filter */}
          <div>
            <label style={{ fontSize: '11px', color: '#A0A0A0', fontWeight: '700', marginBottom: '4px', display: 'block', textTransform: 'uppercase' }}>
              Start Date
            </label>
            <input
              type="date"
              value={filters.dateRange?.start || ''}
              onChange={(e) => handleDateRangeChange(e.target.value, filters.dateRange?.end || '')}
              style={{
                width: '100%',
                padding: '8px',
                background: 'rgba(13, 15, 18, 0.8)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#A0A0A0', fontWeight: '700', marginBottom: '4px', display: 'block', textTransform: 'uppercase' }}>
              End Date
            </label>
            <input
              type="date"
              value={filters.dateRange?.end || ''}
              onChange={(e) => handleDateRangeChange(filters.dateRange?.start || '', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                background: 'rgba(13, 15, 18, 0.8)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Urgency Range */}
          <div>
            <label style={{ fontSize: '11px', color: '#A0A0A0', fontWeight: '700', marginBottom: '4px', display: 'block', textTransform: 'uppercase' }}>
              Urgency: {filters.urgency ? `${Math.round(filters.urgency[0] * 100)}% - ${Math.round(filters.urgency[1] * 100)}%` : 'All'}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.urgency ? filters.urgency[0] * 100 : 0}
              onChange={(e) => handleUrgencyChange(parseInt(e.target.value) / 100, filters.urgency?.[1] || 1)}
              style={{
                width: '100%',
                cursor: 'pointer'
              }}
            />
          </div>
        </div>
      )}

      {/* Filter Actions */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '12px',
        flexWrap: 'wrap',
        fontSize: '12px'
      }}>
        <span style={{ color: '#A0A0A0' }}>
          {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
        </span>
        
        {Object.keys(filters).length > 0 && (
          <button
            onClick={clearFilters}
            style={{
              padding: '4px 12px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#FCA5A5',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Clear All
          </button>
        )}

        <button
          onClick={() => setShowSave(!showSave)}
          style={{
            padding: '4px 12px',
            background: 'rgba(34, 197, 94, 0.2)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            color: '#86EFAC',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          💾 Save Filter
        </button>

        {/* Save Filter Form */}
        {showSave && (
          <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
            <input
              type="text"
              placeholder="Filter name..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              style={{
                padding: '4px 8px',
                background: 'rgba(13, 15, 18, 0.8)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '11px',
                flex: 1
              }}
            />
            <button
              onClick={handleSaveFilter}
              style={{
                padding: '4px 8px',
                background: '#22C55E',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '11px'
              }}
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Saved Filters */}
      {Object.keys(savedFilters).length > 0 && (
        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(212, 175, 55, 0.2)',
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          {Object.keys(savedFilters).map(name => (
            <div key={name} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button
                onClick={() => loadFilter(name)}
                style={{
                  padding: '4px 8px',
                  background: 'rgba(168, 85, 247, 0.2)',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  color: '#D8B4FE',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600'
                }}
              >
                📌 {name}
              </button>
              <button
                onClick={() => deleteFilter(name)}
                style={{
                  padding: '2px 6px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: 'none',
                  color: '#FCA5A5',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '10px'
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
