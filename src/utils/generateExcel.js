import * as XLSX from 'xlsx';

/**
 * generateExcel.js
 * Uses locally installed SheetJS (XLSX) to build
 * a branded Yesminds attendance Excel report.
 */

/**
 * Generate and auto-download an Excel report.
 * @param {{ records: Array, title: string }} opts
 */
export async function generateAttendanceExcel({ records = [], title = 'Attendance Report' }) {
  // #region agent log
  fetch('http://127.0.0.1:7377/ingest/f47b4336-2861-489f-8c34-9211868aa4ba', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': '461b59',
    },
    body: JSON.stringify({
      sessionId: '461b59',
      runId: 'pre-fix',
      hypothesisId: 'H4',
      location: 'src/utils/generateExcel.js:generateAttendanceExcel',
      message: 'Excel generation called',
      data: { recordCount: records.length },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion agent log

  /* ── 2. Prepare data ── */
  const worksheetData = records.map((r, i) => ({
    '#': i + 1,
    'Employee Name': r.userName || 'Unknown',
    'Date': r.dateIST || '—',
    'Status': r.status || '—',
    'Check In': r.loginIST || '—',
    'Check Out': r.logoutIST || '—',
    'Duration': r.workDuration || '—',
    'Worked Minutes': r.totalWorkedMinutes || 0,
    'Overtime Minutes': r.overtimeMinutes || 0,
    'Breaks': r.breakCount != null ? r.breakCount : '—',
    'Night Shift': r.isOvernightShift ? 'Yes' : 'No',
    'Auto Closed': r.autoClosed ? 'Yes' : 'No',
    'Reason': r.reason || '—'
  }));

  /* ── 3. Create Workbook and Worksheet ── */
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

  /* ── 4. Add some basic styling/widths (SheetJS community version is limited in styling) ── */
  const wscols = [
    { wch: 5 },  // #
    { wch: 25 }, // Employee Name
    { wch: 15 }, // Date
    { wch: 12 }, // Status
    { wch: 15 }, // Check In
    { wch: 15 }, // Check Out
    { wch: 12 }, // Duration
    { wch: 15 }, // Worked Minutes
    { wch: 15 }, // Overtime Minutes
    { wch: 10 }, // Breaks
    { wch: 12 }, // Night Shift
    { wch: 12 }, // Auto Closed
    { wch: 30 }, // Reason
  ];
  worksheet['!cols'] = wscols;

  /* ── 5. Save the file ── */
  const datePart = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `Yesminds_Attendance_Report_${datePart}.xlsx`);
}
