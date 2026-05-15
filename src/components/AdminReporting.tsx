import React, { useState } from 'react';
import { generateCaseSummaryReport, exportToCSV, exportToPDF, scheduleReport } from '../../lib/reporting';
import { useIsMobile } from '../../hooks/useMediaQuery';

/**
 * Admin Reporting Component
 * Generate and export reports with scheduling
 */

export default function AdminReporting({
  cases,
  onExport
}: {
  cases: any[];
  onExport?: (filename: string) => void;
}) {
  const isMobile = useIsMobile();
  const [reportType, setReportType] = useState<'summary' | 'detailed'>('summary');
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');
  const [recurring, setRecurring] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [generating, setGenerating] = useState(false);

  const report = generateCaseSummaryReport(cases);

  const handleExport = async () => {
    setGenerating(true);
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `cases_report_${timestamp}.${exportFormat === 'pdf' ? 'pdf' : 'csv'}`;

      if (exportFormat === 'csv') {
        exportToCSV(report.details, filename);
      } else {
        exportToPDF(
          report.details,
          ['id', 'title', 'status', 'category', 'urgency', 'createdAt', 'updatedAt'],
          'Case Report',
          filename
        );
      }

      onExport?.(filename);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSchedule = async () => {
    if (!scheduleTime) {
      alert('Please select a time');
      return;
    }

    try {
      await scheduleReport({
        name: `Auto Report ${new Date().toLocaleDateString()}`,
        format: exportFormat,
        data: report.details,
        columns: ['id', 'title', 'status', 'category', 'urgency', 'createdAt', 'updatedAt'],
        scheduledTime: scheduleTime,
        recurring: recurring === 'none' ? undefined : recurring
      });

      alert('Report scheduled successfully!');
      setShowSchedule(false);
      setScheduleTime('');
      setRecurring('none');
    } catch (err) {
      console.error('Schedule failed:', err);
      alert('Failed to schedule report');
    }
  };

  return (
    <div style={{
      background: 'rgba(26, 30, 36, 0.8)',
      border: '1px solid rgba(212, 175, 55, 0.4)',
      borderRadius: '12px',
      padding: isMobile ? '16px' : '24px'
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#FFD700' }}>
        📊 Generate Reports
      </h3>

      {/* Report Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <ReportCard label="Total Cases" value={report.summary.total} icon="📋" />
        <ReportCard
          label="Avg Urgency"
          value={`${Math.round(report.summary.avgUrgency * 100)}%`}
          icon="⚡"
        />
        <ReportCard
          label="Completed"
          value={report.summary.byStatus['COMPLETED'] || 0}
          icon="✅"
        />
        <ReportCard
          label="In Progress"
          value={(report.summary.byStatus['ENRICHED'] || 0) + (report.summary.byStatus['ROUTED'] || 0)}
          icon="🔄"
        />
      </div>

      {/* Status Breakdown */}
      <div style={{
        background: 'rgba(13, 15, 18, 0.8)',
        border: '1px solid rgba(42, 47, 54, 0.8)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px'
      }}>
        <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#A0A0A0', marginBottom: '12px', textTransform: 'uppercase' }}>
          Status Breakdown
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Object.entries(report.summary.byStatus).map(([status, count]) => (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: '#A0A0A0', minWidth: '80px' }}>{status}</span>
              <div style={{
                flex: 1,
                height: '6px',
                background: 'rgba(212, 175, 55, 0.2)',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${(count as number / report.summary.total) * 100}%`,
                  background: 'linear-gradient(90deg, #FFD700, #FFA500)'
                }} />
              </div>
              <span style={{ fontSize: '12px', color: '#FFD700', fontWeight: '700', minWidth: '40px', textAlign: 'right' }}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div>
          <label style={{ fontSize: '11px', color: '#A0A0A0', fontWeight: '700', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
            Report Type
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
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
            <option value="summary">Summary</option>
            <option value="detailed">Detailed</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '11px', color: '#A0A0A0', fontWeight: '700', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
            Format
          </label>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as any)}
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
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <button
          onClick={handleExport}
          disabled={generating}
          style={{
            padding: '10px 20px',
            background: '#3B82F6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: generating ? 'not-allowed' : 'pointer',
            opacity: generating ? 0.6 : 1
          }}
        >
          {generating ? '⏳ Generating...' : '📥 Download Report'}
        </button>

        <button
          onClick={() => setShowSchedule(!showSchedule)}
          style={{
            padding: '10px 20px',
            background: 'rgba(168, 85, 247, 0.2)',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            color: '#D8B4FE',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          {showSchedule ? '▼ Schedule' : '▶ Schedule'}
        </button>
      </div>

      {/* Schedule Form */}
      {showSchedule && (
        <div style={{
          background: 'rgba(13, 15, 18, 0.8)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '8px',
          padding: '12px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px'
        }}>
          <div>
            <label style={{ fontSize: '11px', color: '#A0A0A0', fontWeight: '700', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
              Schedule Time
            </label>
            <input
              type="datetime-local"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                background: 'rgba(26, 30, 36, 0.8)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#A0A0A0', fontWeight: '700', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
              Recurring
            </label>
            <select
              value={recurring}
              onChange={(e) => setRecurring(e.target.value as any)}
              style={{
                width: '100%',
                padding: '8px',
                background: 'rgba(26, 30, 36, 0.8)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                boxSizing: 'border-box'
              }}
            >
              <option value="none">Once</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <button
              onClick={handleSchedule}
              style={{
                flex: 1,
                padding: '8px 16px',
                background: '#22C55E',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Schedule
            </button>
            <button
              onClick={() => setShowSchedule(false)}
              style={{
                flex: 1,
                padding: '8px 16px',
                background: 'rgba(107, 114, 128, 0.2)',
                border: '1px solid rgba(107, 114, 128, 0.4)',
                color: '#9CA3AF',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportCard({ label, value, icon }: { label: string; value: any; icon: string }) {
  return (
    <div style={{
      background: 'rgba(13, 15, 18, 0.8)',
      border: '1px solid rgba(42, 47, 54, 0.8)',
      borderRadius: '8px',
      padding: '12px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '20px', marginBottom: '4px' }}>{icon}</div>
      <div style={{ fontSize: '14px', fontWeight: '700', color: '#FFD700', marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '10px', color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </div>
    </div>
  );
}
