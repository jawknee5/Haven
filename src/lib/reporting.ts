/**
 * Admin Reporting Module
 * CSV/PDF export, report generation, scheduling
 */

import { jsPDF } from 'jspdf';
import Papa from 'papaparse';

export interface ReportConfig {
  name: string;
  format: 'csv' | 'pdf';
  data: any[];
  columns: string[];
  title?: string;
  scheduledTime?: string;
  recurring?: 'daily' | 'weekly' | 'monthly';
}

/**
 * Generate CSV export
 */
export function exportToCSV(data: any[], filename: string = 'report.csv'): void {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate PDF export
 */
export function exportToPDF(
  data: any[],
  columns: string[],
  title: string = 'Report',
  filename: string = 'report.pdf'
): void {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text(title, 14, 22);
  
  // Add timestamp
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  
  // Prepare table data
  const tableData = data.map(row => columns.map(col => row[col] || ''));
  
  // Add table
  doc.setTextColor(0, 0, 0);
  (doc as any).autoTable({
    head: [columns],
    body: tableData,
    startY: 40,
    styles: {
      fontSize: 10,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [212, 175, 55],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    }
  });

  // Add footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(filename);
}

/**
 * Schedule report generation
 */
export async function scheduleReport(config: ReportConfig): Promise<void> {
  const scheduleData = {
    ...config,
    createdAt: new Date().toISOString(),
    nextRun: config.scheduledTime || new Date().toISOString()
  };

  // Save to localStorage for persistence
  const reports = JSON.parse(localStorage.getItem('scheduled_reports') || '[]');
  reports.push(scheduleData);
  localStorage.setItem('scheduled_reports', JSON.stringify(reports));

  // Schedule in backend (if integrated)
  try {
    await fetch('/api/reports/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scheduleData)
    });
  } catch (err) {
    console.log('Backend scheduling not available, using client-side');
  }
}

/**
 * Generate case summary report
 */
export function generateCaseSummaryReport(cases: any[]): {
  summary: {
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    avgUrgency: number;
  };
  details: any[];
} {
  const summary = {
    total: cases.length,
    byStatus: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
    avgUrgency: 0
  };

  let totalUrgency = 0;

  cases.forEach(c => {
    // Count by status
    summary.byStatus[c.status] = (summary.byStatus[c.status] || 0) + 1;

    // Count by category
    summary.byCategory[c.category] = (summary.byCategory[c.category] || 0) + 1;

    // Average urgency
    totalUrgency += c.urgency || 0;
  });

  summary.avgUrgency = totalUrgency / cases.length;

  return {
    summary,
    details: cases.map(c => ({
      id: c.id,
      title: c.title,
      status: c.status,
      category: c.category,
      urgency: c.urgency ? Math.round(c.urgency * 100) + '%' : 'N/A',
      createdAt: new Date(c.createdAt).toLocaleDateString(),
      updatedAt: new Date(c.updatedAt).toLocaleDateString()
    }))
  };
}

/**
 * Generate user activity report
 */
export function generateActivityReport(activities: any[]): any {
  const report = {
    totalEvents: activities.length,
    byType: {} as Record<string, number>,
    byUser: {} as Record<string, number>,
    timeline: [] as any[]
  };

  activities.forEach(activity => {
    report.byType[activity.type] = (report.byType[activity.type] || 0) + 1;
    report.byUser[activity.userId] = (report.byUser[activity.userId] || 0) + 1;
  });

  // Group by date
  const grouped: Record<string, number> = {};
  activities.forEach(activity => {
    const date = new Date(activity.timestamp).toLocaleDateString();
    grouped[date] = (grouped[date] || 0) + 1;
  });

  report.timeline = Object.entries(grouped).map(([date, count]) => ({
    date,
    events: count
  }));

  return report;
}

/**
 * Export report to Excel format (CSV variant)
 */
export function exportToExcel(data: any[], filename: string = 'report.xlsx'): void {
  // Note: Full Excel requires additional library, CSV works for most cases
  exportToCSV(data, filename.replace('.xlsx', '.csv'));
}
