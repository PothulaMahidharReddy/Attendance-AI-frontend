import React, { useState, useRef } from 'react';

const QUICK_PROMPTS = [
  { label: '👥 Present Today', query: 'Who was present today?' },
  { label: '🌙 Overnight Shifts', query: 'Show overnight shifts' },
  { label: '⏰ Late Logins', query: 'Who logged in late today?' },
  { label: '💼 Overtime', query: 'Who worked overtime?' },
  { label: '🔓 Active Sessions', query: 'Who has not logged out yet?' },
  { label: '📊 Overtime Graph', query: 'Show overtime per employee as a bar graph' },
  { label: '🥧 Status Breakdown', query: 'Show attendance status breakdown as a pie chart' },
  { label: '📈 Weekly Trend', query: 'Show daily attendance trend for last week as a line chart' },
];

export default function QueryBar({ onSubmit, loading }) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const submit = () => {
    if (!value.trim() || loading) return;
    onSubmit(value.trim());
  };

  return (
    <div className="query-container" style={{ width: '100%' }}>
      <div className="glass-panel" style={{
        padding: '0.4rem',
        borderRadius: 'var(--radius-xl)',
        boxShadow: focused ? '0 0 0 4px var(--primary-glow), var(--shadow-xl)' : 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0.25rem' }}>
          {/* Search icon / Loading spinner */}
          <div style={{ padding: '0 1.25rem', color: focused ? 'var(--primary)' : 'var(--text-dim)', transition: 'color 0.2s', flexShrink: 0 }}>
            {loading ? (
              <div style={{
                width: 22, height: 22,
                border: '3px solid rgba(255,255,255,0.1)',
                borderTopColor: 'var(--primary)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder='Ask about attendance, status, or specific employees...'
            autoComplete="off"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '1.25rem 0.5rem',
              fontFamily: 'var(--sans)',
              fontSize: '1.1rem',
              fontWeight: '400',
              color: 'var(--text)',
            }}
          />

          {value && !loading && (
            <button
              onClick={() => { setValue(''); inputRef.current?.focus(); }}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '50%',
                marginRight: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}

          <button
            onClick={submit}
            disabled={loading || !value.trim()}
            className="btn-primary"
            style={{
              height: '52px',
              padding: '0 1.25rem',
              borderRadius: 'var(--radius-lg)',
              opacity: (loading || !value.trim()) ? 0.6 : 1,
              transform: (loading || !value.trim()) ? 'none' : undefined,
              boxShadow: (loading || !value.trim()) ? 'none' : undefined,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginRight: '0.5rem'
            }}
          >
            <span style={{ fontSize: '1rem', fontWeight: 600 }}>Analyze</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>

          <div style={{ position: 'relative' }} title="Type any question → AI automatically creates the graph from your database">
            <button
              onClick={() => {
                if (!value.trim() || loading) return;
                const graphQuery = value.toLowerCase().includes('graph') || value.toLowerCase().includes('chart') || value.toLowerCase().includes('visual')
                  ? value 
                  : `${value} show as a graph`;
                onSubmit(graphQuery);
              }}
              disabled={loading || !value.trim()}
              style={{
                height: '52px',
                padding: '0 1.25rem',
                borderRadius: 'var(--radius-lg)',
                background: value.trim() && !loading
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: value.trim() && !loading ? 'white' : 'rgba(16, 185, 129, 0.5)',
                cursor: (loading || !value.trim()) ? 'not-allowed' : 'pointer',
                opacity: (loading || !value.trim()) ? 0.65 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: value.trim() && !loading ? '0 10px 15px -3px rgba(16, 185, 129, 0.25)' : 'none',
                transition: 'all 0.25s',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => { if (!loading && value.trim()) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 20px -3px rgba(16, 185, 129, 0.35)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = value.trim() && !loading ? '0 10px 15px -3px rgba(16, 185, 129, 0.25)' : 'none'; }}
            >
              {/* Pulsing dot when active */}
              {value.trim() && !loading && (
                <span style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.9)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              )}
              {/* Chart icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18M18 17l-3-3-4 4-5-5" />
              </svg>
              <span style={{ fontSize: '1rem', fontWeight: 600 }}>Graph It</span>
            </button>
          </div>
        </div>

        {/* Quick prompts section */}
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '0.75rem 1rem',
          display: 'flex',
          gap: '0.6rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', marginRight: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suggestions:</span>
          {QUICK_PROMPTS.map(p => (
            <QuickChip key={p.query} label={p.label} onClick={() => { setValue(p.query); onSubmit(p.query); }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickChip({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid var(--border)',
        color: 'var(--text-muted)',
        borderRadius: '100px',
        padding: '0.4rem 0.9rem',
        fontSize: '0.8rem',
        fontFamily: 'var(--sans)',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.borderColor = 'var(--primary)';
        e.currentTarget.style.color = 'var(--text)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.color = 'var(--text-muted)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {label}
    </button>
  );
}
