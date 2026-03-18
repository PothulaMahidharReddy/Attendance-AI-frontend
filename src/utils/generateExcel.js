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
