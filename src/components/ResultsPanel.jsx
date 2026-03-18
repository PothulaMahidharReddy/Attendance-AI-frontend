import React, { useState } from 'react';
import RecordCard from './RecordCard';
import AutoGraph from './AutoGraph';
import { generateAttendancePDF } from '../utils/generatePDF';

function EmptyState() {
  return (
    <div className="glass-panel" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '6rem 2rem', gap: '1.5rem', textAlign: 'center',
      borderStyle: 'dashed', background: 'transparent'
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: '24px',
        background: 'rgba(99, 102, 241, 0.05)',
        border: '1px solid rgba(99, 102, 241, 0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2.5rem',
        boxShadow: '0 0 20px rgba(99, 102, 241, 0.05)'
      }}>🕵️‍♂️</div>
      <div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>Awaiting Inquiry</h3>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: 460, lineHeight: 1.6, margin: '0 auto' }}>
          Type a natural language request. Our AI engine will translate your intent into a precise database query.
        </p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center', marginTop: '0.5rem' }}>
        {['"Who was late today?"', '"Total overtime this week"', '"Active sessions"'].map(e => (
          <span key={e} style={{
            fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500,
            background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.15)',
            borderRadius: '100px', padding: '0.3rem 0.9rem',
          }}>{e}</span>
        ))}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ padding: '0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {[1, 2, 3].map(i => (
        <div key={i} className="glass-panel loading-shimmer" style={{
          height: 140,
          borderRadius: 'var(--radius-lg)',
          opacity: 1 - (i * 0.2)
        }} />
      ))}
      <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
        <div style={{ width: 18, height: 18, border: '3px solid rgba(99, 102, 241, 0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        AI Engine is synthesizing your request...
      </div>
    </div>
  );
}

function ErrorState({ message, apiUrl }) {
  return (
    <div className="glass-panel" style={{
      margin: '0',
      background: 'rgba(239, 68, 68, 0.05)',
      borderColor: 'rgba(239, 68, 68, 0.2)',
      padding: '1.5rem 2rem', 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        </div>
        <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '1.1rem' }}>Inquiry Failed</span>
      </div>
      <div style={{
        fontFamily: 'var(--mono)',
        fontSize: '0.85rem',
        color: '#fca5a5',
        marginBottom: '1rem',
        padding: '1rem',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: 'var(--radius-sm)',
        wordBreak: 'break-all'
      }}>{message}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 500 }}>
        Ensure the backend service is running at: <code style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{apiUrl}</code>
      </div>
    </div>
  );
}

function AiBanner({ explanation, mongoFilter }) {
  const [showFilter, setShowFilter] = useState(false);
  return (
    <div className="glass-panel" style={{
      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(16, 185, 129, 0.05))',
      borderColor: 'rgba(99, 102, 241, 0.2)',
      padding: '1.25rem 1.75rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1.25rem',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
        background: 'linear-gradient(135deg, var(--primary), #4f46e5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px var(--primary-glow)',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--primary)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: 800,
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          AI Analysis Intelligence
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor' }} />
          <span style={{ opacity: 0.8 }}>Groq Llama-3.3-70b</span>
        </div>
        <div style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6, fontWeight: 500 }}>{explanation}</div>

        {mongoFilter && (
          <div style={{ marginTop: '1rem' }}>
            <button
              onClick={() => setShowFilter(o => !o)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: 'var(--sans)',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: showFilter ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}><path d="M9 18l6-6-6-6" /></svg>
              {showFilter ? 'Collapse' : 'Inspect'} MongoDB Logic
            </button>
            {showFilter && (
              <div style={{
                marginTop: '0.75rem',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                fontFamily: 'var(--mono)',
                fontSize: '0.85rem',
                color: 'var(--text-dim)',
                lineHeight: 1.6,
                animation: 'fadeIn 0.3s ease-out'
              }}>
                <div style={{ marginBottom: '0.5rem', opacity: 0.5, fontSize: '0.7rem', textTransform: 'uppercase' }}>Generated Pipeline</div>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>db.biometricdatas.find(</span>
                <div style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', color: '#e2e8f0' }}>{mongoFilter}</div>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>)</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultsHeader({ query, count, onDownload, isDownloading }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem',
      padding: '0.5rem 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ fontSize: '1rem', color: 'var(--text-dim)', fontWeight: 500 }}>
          Analysis for <span style={{ color: 'var(--text)', fontWeight: 700 }}>"{query}"</span>
        </div>
        
        <button
          onClick={onDownload}
          disabled={isDownloading}
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#f59e0b',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: isDownloading ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { if (!isDownloading) { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {isDownloading ? 'Generating...' : 'Download PDF Report'}
        </button>
      </div>

      <div className={`badge ${count > 0 ? 'badge-success' : ''}`} style={{
        padding: '0.6rem 1.25rem',
        fontSize: '0.9rem',
        boxShadow: count > 0 ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'none'
      }}>
        <span style={{ fontFamily: 'var(--display)', fontWeight: 700 }}>{count}</span>
        <span style={{ opacity: 0.8, textTransform: 'uppercase', fontSize: '0.75rem', marginLeft: '0.4rem', letterSpacing: '0.05em' }}>Matched Records</span>
      </div>
    </div>
  );
}

export default function ResultsPanel({ queryState, apiUrl }) {
  const { loading, records, count, lastQuery, explanation, mongoFilter, visualization, error } = queryState;
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await generateAttendancePDF({ records, lastQuery, explanation, count });
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Check console for details.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} apiUrl={apiUrl} />;
  if (records === null) return <EmptyState />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {explanation && <AiBanner explanation={explanation} mongoFilter={mongoFilter} />}
      {visualization && <AutoGraph visualization={visualization} records={records} />}
      
      <ResultsHeader 
        query={lastQuery} 
        count={count} 
        onDownload={handleDownload}
        isDownloading={downloading}
      />
      <div className="record-grid">
        {records.length > 0
          ? records.map((rec, i) => <RecordCard key={rec.id || i} record={rec} index={i} />)
          : (
            <div className="glass-panel" style={{
              gridColumn: '1 / -1',
              padding: '4rem',
              textAlign: 'center',
              background: 'transparent',
              borderStyle: 'dashed'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔦</div>
              <h4 style={{ color: 'var(--text)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>No data matches found</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Try broadening your search or checking for different date ranges.</p>
            </div>
          )
        }
      </div>
    </div>
  );
}
