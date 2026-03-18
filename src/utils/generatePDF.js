import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * generatePDF.js
 * Uses locally installed jsPDF + autoTable to build
 * a branded Yesminds attendance PDF report.
 */

// Brand colours matching Yesminds orange theme
const C = {
  orange:  [245, 124,   0],
  orange2: [255, 167,  38],
  darkBg:  [ 15,  23,  42],
  header:  [ 22,  33,  62],
  rowEven: [ 17,  24,  39],
  rowOdd:  [ 24,  33,  52],
  white:   [248, 250, 252],
  muted:   [148, 163, 184],
  dim:     [100, 116, 139],
  green:   [ 16, 185, 129],
  amber:   [245, 158,  11],
  red:     [239,  68,  68],
  indigo:  [ 99, 102, 241],
};

/** Dynamically inject a <script> tag and wait for it to load */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload  = resolve;
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

/** Convert a public-folder image URL → base64 data URL via canvas */
function imgToBase64(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width  = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext('2d').drawImage(img, 0, 0);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Logo load failed'));
    img.src = url + '?t=' + Date.now(); // cache-bust
  });
}

/** Status text colour */
function statusColor(s = '') {
  const l = s.toLowerCase();
  if (l === 'present') return C.green;
  if (l === 'absent')  return C.red;
  if (l === 'late')    return C.amber;
  return C.muted;
}

/**
 * Generate and auto-download a branded PDF report.
 * @param {{ records: Array, lastQuery: string, explanation: string, count: number }} opts
 */
export async function generateAttendancePDF({ records = [], lastQuery = '', explanation = '', count = 0 }) {
  /* ── 2. Create document ── */
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const PW  = doc.internal.pageSize.getWidth();   // 297 mm
  const PH  = doc.internal.pageSize.getHeight();  // 210 mm

  /* ── 3. Page background ── */
  doc.setFillColor(...C.darkBg);
  doc.rect(0, 0, PW, PH, 'F');

  /* ── 4. Header band ── */
  const HDR = 38;
  doc.setFillColor(...C.header);
  doc.rect(0, 0, PW, HDR, 'F');

  // Orange top-edge accent bar
  doc.setFillColor(...C.orange);
  doc.rect(0, 0, PW, 2.5, 'F');

  /* ── 5. Yesminds Logo (top-left) ── */
  try {
    const b64 = await imgToBase64('/logo.png'); // Try standard logo location
    // Original logo ~560×150 px → keep aspect ratio at 46 mm wide
    const LW = 46, LH = 46 * (150 / 560);
    doc.addImage(b64, 'PNG', 10, (HDR - LH) / 2, LW, LH);
  } catch (_) {
    // Fallback: draw text instead
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(...C.orange);
    doc.text('Yesminds', 10, 22);
  }

  /* ── 6. Centre title ── */
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...C.white);
  doc.text('Attendance Intelligence Report', PW / 2, 16, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.text('Powered by Groq  ·  Llama-3.3-70b', PW / 2, 24, { align: 'center' });

  /* ── 7. Top-right metadata ── */
  const nowStr = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.dim);
  doc.text(`Generated: ${nowStr} IST`, PW - 10, 16, { align: 'right' });
  doc.text(`Total Records: ${count}`,  PW - 10, 23, { align: 'right' });

  /* ── 8. AI Query info band ── */
  const QB = HDR + 4;
  const qLines = doc.splitTextToSize(`Query: "${lastQuery}"`, PW - 40);
  const exLines = explanation ? doc.splitTextToSize(explanation, PW - 40) : [];
  
  // Calculate dynamic box height
  // qLines + exLines + cushioning
  const qH = qLines.length * 4;
  const exH = exLines.length * 3.5;
  const boxH = Math.max(15, qH + exH + 8); 

  doc.setFillColor(30, 41, 59);
  doc.roundedRect(10, QB, PW - 20, boxH, 2, 2, 'F');

  // Small orange "AI" pill
  doc.setFillColor(...C.orange);
  doc.roundedRect(14, QB + 4, 11, 6, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text('AI', 19.5, QB + 8.2, { align: 'center' });

  // Query text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.white);
  doc.text(qLines, 29, QB + 8);

  // Explanation sub-text
  if (explanation) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.muted);
    doc.text(exLines, 29, QB + 8 + qH + 2);
  }

  /* ── 9. Summary stat cards ── */
  const STAT_Y = QB + boxH + 6;
  const STAT_H = 18;
  const STAT_W = (PW - 20 - 9) / 4;

  const presentCount = records.filter(r => r.status?.toLowerCase() === 'present').length;
  const lateCount    = records.filter(r => r.status?.toLowerCase() === 'late').length;
  const totalMins    = records.reduce((s, r) => s + (r.totalWorkedMinutes || 0), 0);
  const avgMins      = records.length ? totalMins / records.length : 0;
  const avgLabel     = `${Math.floor(avgMins / 60)}h ${Math.round(avgMins % 60)}m`;

  [
    { label: 'TOTAL RECORDS', value: String(count),        accent: C.orange  },
    { label: 'PRESENT',       value: String(presentCount), accent: C.green   },
    { label: 'LATE LOGINS',   value: String(lateCount),    accent: C.amber   },
    { label: 'AVG WORK TIME', value: avgLabel,             accent: C.indigo  },
  ].forEach((stat, i) => {
    const sx = 10 + i * (STAT_W + 3);
    // Card background
    doc.setFillColor(...C.header);
    doc.roundedRect(sx, STAT_Y, STAT_W, STAT_H, 2, 2, 'F');
    // Accent left stripe
    doc.setFillColor(...stat.accent);
    doc.roundedRect(sx, STAT_Y, 3, STAT_H, 1, 1, 'F');
    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.dim);
    doc.text(stat.label, sx + 6, STAT_Y + 6);
    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(...stat.accent);
    doc.text(stat.value, sx + 6, STAT_Y + 15);
  });

  /* ── 10. Section divider ── */
  const TABLE_Y = STAT_Y + STAT_H + 6;
  doc.setDrawColor(...C.orange);
  doc.setLineWidth(0.4);
  doc.line(10, TABLE_Y, PW - 10, TABLE_Y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.orange);
  doc.text('ATTENDANCE RECORDS', 10, TABLE_Y + 5);

  /* ── 11. Data table ── */
  const columns = [
    { header: '#',           dataKey: 'idx'             },
    { header: 'Employee',    dataKey: 'userName'         },
    { header: 'Date',        dataKey: 'dateIST'          },
    { header: 'Status',      dataKey: 'status'           },
    { header: 'Roster Shift',dataKey: 'rosterShift'      },
    { header: 'Check In',    dataKey: 'loginIST'         },
    { header: 'Check Out',   dataKey: 'logoutIST'        },
    { header: 'Duration',    dataKey: 'workDuration'     },
    { header: 'Reason',      dataKey: 'reason'           },
    { header: 'Breaks',      dataKey: 'breaks'           },
    { header: 'Night Shift', dataKey: 'overnight'        },
    { header: 'Auto Closed', dataKey: 'autoClosed'       },
  ];

  const rows = records.map((r, i) => ({
    idx:        i + 1,
    userName:   r.userName || 'Unknown',
    dateIST:    r.dateIST  || '—',
    status:     r.status   || '—',
    rosterShift: (r.shiftStart && r.shiftStart !== '—') ? `${r.shiftStart} - ${r.shiftEnd}` : '—',
    loginIST:   r.loginIST || '—',
    logoutIST:  r.logoutIST || '—',
    workDuration: r.workDuration || '—',
    reason:     r.reason       || '—',
    breaks:     r.breakCount != null ? r.breakCount : '—',
    overnight:  r.isOvernightShift ? 'Yes' : 'No',
    autoClosed: r.autoClosed ? 'Yes' : 'No',
  }));

  const pagesDrawn = new Set();

  autoTable(doc, {
    startY:  TABLE_Y + 7,
    margin:  { top: 25, bottom: 20, left: 10, right: 10 },
    columns,
    body:    rows,
    theme:   'plain',
    styles: {
      font:        'helvetica',
      fontSize:    7.5,
      cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
      textColor:   C.white,
      lineColor:   [30, 41, 59],
      lineWidth:   0.1,
    },
    headStyles: {
      fillColor:  C.header,
      textColor:  C.orange,
      fontStyle:  'bold',
      fontSize:   7.5,
      halign:     'left',
      lineWidth:  0,
    },
    alternateRowStyles: { fillColor: C.rowOdd  },
    bodyStyles:         { fillColor: C.rowEven },
    columnStyles: {
      idx:      { halign: 'center', cellWidth: 12 },
      status:   { halign: 'center', cellWidth: 20 },
      overnight:  { halign: 'center', cellWidth: 20 },
      autoClosed: { halign: 'center', cellWidth: 22 },
      breaks:     { halign: 'center', cellWidth: 15 },
    },
    willDrawCell(data) {
      // Draw background and "Chrome" for new pages BEFORE cells are drawn
      if (!pagesDrawn.has(data.pageNumber)) {
        pagesDrawn.add(data.pageNumber);
        
        // Page 1 background is already drawn at the start of the function.
        // For Page 2+, we must draw it here to ensure it's BEHIND the table.
        if (data.pageNumber > 1) {
          doc.setPage(data.pageNumber);
          // 1. Dark Background
          doc.setFillColor(...C.darkBg);
          doc.rect(0, 0, PW, PH, 'F');
          
          // 2. Orange Top Accent
          doc.setFillColor(...C.orange);
          doc.rect(0, 0, PW, 2.5, 'F');
          
          // 3. Continuation Label
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(...C.orange);
          doc.text('Yesminds — Attendance Report (continued)', 10, 12);
        }
      }
    },
    didParseCell(data) {
      if (data.section !== 'body') return;
      if (data.column.dataKey === 'status') {
        data.cell.styles.textColor = statusColor(data.cell.raw);
        data.cell.styles.fontStyle = 'bold';
      }
      if (['overnight', 'autoClosed'].includes(data.column.dataKey) && (data.cell.raw === 'Yes' || data.cell.raw === true)) {
        data.cell.styles.textColor = C.amber;
        data.cell.styles.fontStyle = 'bold';
      }
    },
    didDrawPage(data) {
      // Footer on every page
      doc.setPage(data.pageNumber);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...C.dim);
      doc.text(
        `Yesminds Attendance Intelligence  ·  Page ${data.pageNumber}`,
        PW / 2, PH - 5, { align: 'center' }
      );
      
      doc.setDrawColor(...C.orange);
      doc.setLineWidth(0.3);
      doc.line(10, PH - 8, PW - 10, PH - 8);
    },
  });

  /* ── 12. Save the file ── */
  const datePart = new Date().toISOString().slice(0, 10);
  doc.save(`Yesminds_Attendance_Report_${datePart}.pdf`);
}
