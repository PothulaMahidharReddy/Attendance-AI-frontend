import React, { useState, useEffect, useRef } from 'react';
import { generateAttendancePDF } from '../utils/generatePDF';
import { generateAttendanceExcel } from '../utils/generateExcel';

/**
 * Dashboard component that displays a summary of attendance for a selected date.
 * Features:
 * - Date picker to select the specific date.
 * - AI-generated summary text.
 * - Key metrics: Present employees, Late logins, Average working hours from previous day.
 */
export default function Dashboard({ apiUrl }) {
  // Default to today's date in YYYY-MM-DD format
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Report Generation State
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [generating, setGenerating] = useState(false);
  const menuRef = useRef(null);

  // Popup state
  const [activePopup, setActivePopup] = useState(null); // 'present', 'late', 'worked'
  const [popupData, setPopupData] = useState([]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowReportMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch summary whenever the selected date changes
  useEffect(() => {
    if (!apiUrl) return;
    fetchSummary();
  }, [selectedDate, apiUrl]);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${apiUrl}/dashboard-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate })
      });
      
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to fetch dashboard summary');
      }
      
      const data = await resp.json();
      setSummary(data);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (range, format) => {
    setGenerating(true);
    setShowReportMenu(false);
    try {
      // Direct call to standard report endpoint for maximum reliability
      const url = `${apiUrl}/reports?type=${range}&date=${selectedDate}`;
      const resp = await fetch(url);

      if (!resp.ok) throw new Error('Failed to fetch records from database report service');
      const data = await resp.json();

      if (!data.records || data.records.length === 0) {
        alert(`No records in MongoDB for ${range} range (${selectedDate}). Please check if data exists for this period.`);
        return;
      }

      if (format === 'PDF') {
        let expl = "";
        if (range === 'daily') expl = `Specific attendance audit for ${selectedDate}.`;
        else if (range === 'weekly') expl = `Consolidated attendance report for the 7-day period ending ${selectedDate}.`;
        else if (range === 'monthly') expl = `Full montly attendance audit for the 30-day period ending ${selectedDate}.`;

        await generateAttendancePDF({
          records: data.records,
          lastQuery: `${range.toUpperCase()} Report: ${selectedDate}`,
          explanation: expl,
          count: data.count
        });
      } else {
        await generateAttendanceExcel({
          records: data.records,
          title: `Attendance ${range.toUpperCase()} Report`
        });
      }
    } catch (err) {
      console.error('Report generation error:', err);
      alert('Failed to generate report: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <section className="dashboard-container" style={{ width: '100%', marginBottom: '1rem' }}>
      <div className="glass-panel" style={{ 
        padding: '2.5rem', 
        position: 'relative',
        overflow: 'visible' // Changed from hidden to show dropdown
      }}>
        {/* Background glow effect */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end', 
          marginBottom: '2.5rem',
          position: 'relative',
          zIndex: 10,
          flexWrap: 'wrap',
          gap: '1.5rem',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '1.5rem'
        }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.6rem', 
              background: 'rgba(99, 102, 241, 0.1)', 
              padding: '0.4rem 0.8rem', 
              borderRadius: '100px',
              marginBottom: '0.75rem',
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Intelligence Hub</span>
            </div>
            <h2 style={{ fontSize: '2.25rem', color: 'var(--text)', marginBottom: '0.25rem', fontWeight: 800 }}>Daily Insights</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>
              Automated attendance analysis and metrics for <span style={{ color: 'var(--text)', fontWeight: 700 }}>{selectedDate}</span>
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Date Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="date-select" style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Analysis Date
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  id="date-select"
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-field"
                  style={{ 
                    width: '180px', 
                    padding: '0.6rem 0.75rem 0.6rem 2.5rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2.5" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
            </div>

            {/* Generate Report Dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Export Hub</span>
              <div style={{ position: 'relative' }} ref={menuRef}>
                <button 
                  onClick={() => setShowReportMenu(!showReportMenu)}
                  disabled={generating}
                  className="btn-primary"
                  style={{ 
                    padding: '0.6rem 1.25rem', 
                    fontSize: '0.9rem',
                    minWidth: '150px',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    <span>{generating ? 'Processing...' : 'Generate'}</span>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ transform: showReportMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
                </button>

                {showReportMenu && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '280px',
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid var(--border-hover)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
                    zIndex: 1000,
                    padding: '0.75rem',
                    animation: 'scaleIn 0.15s ease-out'
                  }}>
                    {['Daily', 'Weekly', 'Monthly'].map((range, idx) => (
                      <div key={range} style={{ 
                        marginBottom: idx === 2 ? 0 : '0.75rem',
                        paddingBottom: idx === 2 ? 0 : '0.75rem',
                        borderBottom: idx === 2 ? 'none' : '1px solid rgba(255,255,255,0.05)'
                      }}>
                        <div style={{ 
                          padding: '0 0.5rem 0.5rem', 
                          fontSize: '0.65rem', 
                          color: 'var(--text-dim)', 
                          textTransform: 'uppercase', 
                          fontWeight: 800,
                          letterSpacing: '0.1em'
                        }}>
                          {range} Report
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => generateReport(range.toLowerCase(), 'PDF')}
                            style={{
                              flex: 1,
                              padding: '0.5rem',
                              background: 'rgba(99, 102, 241, 0.1)',
                              border: '1px solid rgba(99, 102, 241, 0.2)',
                              borderRadius: '8px',
                              color: 'var(--primary-hover)',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.4rem',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            PDF
                          </button>
                          <button 
                            onClick={() => generateReport(range.toLowerCase(), 'Excel')}
                            style={{
                              flex: 1,
                              padding: '0.5rem',
                              background: 'rgba(16, 185, 129, 0.1)',
                              border: '1px solid rgba(16, 185, 129, 0.2)',
                              borderRadius: '8px',
                              color: '#34d399',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.4rem',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            Excel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div style={{ padding: '1rem' }}>
            <div className="loading-shimmer" style={{ height: '100px', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div className="loading-shimmer" style={{ height: '80px', borderRadius: 'var(--radius-md)' }}></div>
              <div className="loading-shimmer" style={{ height: '80px', borderRadius: 'var(--radius-md)' }}></div>
              <div className="loading-shimmer" style={{ height: '80px', borderRadius: 'var(--radius-md)' }}></div>
            </div>
          </div>
        ) : error ? (
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            color: 'var(--error)',
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-md)'
          }}>
            <p>Error: {error}</p>
            <button 
              onClick={fetchSummary}
              className="btn-primary" 
              style={{ marginTop: '1rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              Retry
            </button>
          </div>
        ) : summary ? (
          <div style={{ animation: 'fadeIn 0.5s ease-out', position: 'relative', zIndex: 1, width: '100%' }}>
            {/* AI Summary Card */}
            <div style={{ 
              whiteSpace: 'pre-line', 
              fontSize: '1.15rem', 
              lineHeight: '1.7',
              marginBottom: '2.5rem', 
              padding: '2rem', 
              background: 'rgba(255, 255, 255, 0.02)', 
              borderRadius: 'var(--radius-lg)', 
              borderLeft: '4px solid var(--primary)',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)',
              color: 'var(--text)'
            }}>
              {summary.aiSummary}
            </div>
            
            {/* Stats Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
              gap: '1.5rem' 
            }}>
              <div 
                onClick={() => { setActivePopup('Present'); setPopupData(summary.presentEmployees || []); }}
                style={{ 
                  padding: '1.5rem', 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border)',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Present Employees</div>
                <div style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--text)' }}>
                  {summary.presentCount}
                  <span style={{ fontSize: '1rem', color: 'var(--success)', marginLeft: '0.5rem', fontWeight: '500' }}>●</span>
                </div>
              </div>

              <div 
                onClick={() => { setActivePopup('Late Login'); setPopupData(summary.lateEmployees || []); }}
                style={{ 
                  padding: '1.5rem', 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border)',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Late Logins</div>
                <div style={{ 
                  fontSize: '2.25rem', 
                  fontWeight: '700', 
                  color: summary.lateCount > 0 ? 'var(--warning)' : 'var(--text)' 
                }}>
                  {summary.lateCount}
                </div>
              </div>

              <div 
                onClick={() => { setActivePopup('Work Hour'); setPopupData(summary.workedEmployees || []); }}
                style={{ 
                  padding: '1.5rem', 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border)',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Work Hours (Prev Day)</div>
                <div style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--secondary)' }}>
                  {summary.avgHoursYesterday}
                  <span style={{ fontSize: '1.25rem', fontWeight: '500', marginLeft: '0.25rem' }}>h</span>
                </div>
              </div>
            </div>

            {/* Detail Popup Modal */}
            {activePopup && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '1.5rem'
              }} onClick={() => setActivePopup(null)}>
                <div style={{
                  width: '100%',
                  maxWidth: '750px',
                  maxHeight: '85vh',
                  background: 'rgba(15, 23, 42, 0.98)',
                  border: '1px solid var(--border-hover)',
                  borderRadius: '24px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255,255,255,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  animation: 'scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }} onClick={e => e.stopPropagation()}>
                  <header style={{
                    padding: '1.75rem 2rem',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.01)'
                  }}>
                    <div>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.25rem' }}>
                        {activePopup === 'Present' ? 'Present Employees' : activePopup === 'Late Login' ? 'Late Logins' : 'Work Analysis'}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Records found for {selectedDate}</p>
                    </div>
                    <button onClick={() => setActivePopup(null)} style={{ 
                      background: 'rgba(255,255,255,0.05)', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '12px',
                      color: 'var(--text-muted)', 
                      cursor: 'pointer', 
                      padding: '0.6rem',
                      display: 'flex',
                      transition: 'all 0.2s'
                    }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </header>
                  <div style={{ padding: '0', overflowY: 'auto', flex: 1 }}>
                    {popupData.length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '4rem 2rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>Empty</div>
                        <p style={{ fontWeight: 600 }}>No specific records match this filter for the selected date.</p>
                      </div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', textAlign: 'left' }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(15, 23, 42, 1)' }}>
                          <tr style={{ color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                            <th style={{ padding: '1rem 2rem', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Employee</th>
                            <th style={{ padding: '1rem 1rem', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Status</th>
                            <th style={{ padding: '1rem 1rem', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Roster Shift</th>
                            <th style={{ padding: '1rem 1rem', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Actual Times</th>
                            <th style={{ padding: '1rem 2rem', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'right' }}>Worked</th>
                          </tr>
                        </thead>
                        <tbody>
                          {popupData.map((emp, i) => (
                            <tr key={i} style={{ 
                              background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                              transition: 'background 0.2s'
                            }} className="hover-row">
                              <td style={{ padding: '1rem 2rem' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>{emp.userName}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: {emp.userId || '—'}</div>
                              </td>
                              <td style={{ padding: '1rem 1rem' }}>
                                <span style={{ 
                                  fontSize: '0.7rem', 
                                  fontWeight: 800, 
                                  textTransform: 'uppercase',
                                  padding: '0.2rem 0.6rem',
                                  borderRadius: '6px',
                                  background: emp.status === 'present' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                  color: emp.status === 'present' ? '#10b981' : '#f59e0b',
                                  border: `1px solid ${emp.status === 'present' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                                }}>
                                  {emp.status}
                                </span>
                              </td>
                              <td style={{ padding: '1rem 1rem' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600 }}>{emp.shiftStart && emp.shiftStart !== '—' ? `${emp.shiftStart} → ${emp.shiftEnd}` : 'No Roster'}</div>
                              </td>
                              <td style={{ padding: '1rem 1rem' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600 }}>{emp.loginIST} → {emp.logoutIST}</div>
                                {emp.isOvernightShift && <div style={{ fontSize: '0.65rem', color: 'var(--warning)', fontWeight: 700 }}>Overnight Shift</div>}
                              </td>
                              <td style={{ padding: '1rem 2rem', textAlign: 'right' }}>
                                <div style={{ color: 'var(--primary-hover)', fontWeight: 800, fontSize: '1rem' }}>{emp.workDuration}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  <footer style={{ padding: '1.25rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'right', background: 'rgba(255,255,255,0.01)' }}>
                    <button onClick={() => setActivePopup(null)} className="btn-secondary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.85rem' }}>Close</button>
                  </footer>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Please select a date to view insights.
          </div>
        )}
      </div>
    </section>
  );
}
