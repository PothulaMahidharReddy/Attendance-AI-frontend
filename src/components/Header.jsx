import React, { useState } from 'react';

export default function Header({ status, apiUrl, onApiChange, currentView, onViewChange }) {
  const [editingUrl, setEditingUrl] = useState(false);
  const [urlVal, setUrlVal] = useState(apiUrl);

  const isOnline = status.state === 'online';
  const label = isOnline
    ? `${status.records?.toLocaleString() ?? '0'} Records`
    : status.state === 'loading' ? 'Loading...' : 'System Offline';

  const commitUrl = () => {
    setEditingUrl(false);
    onApiChange(urlVal);
  };

  const navItemStyle = (isActive) => ({
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: isActive ? 'var(--text)' : 'var(--text-muted)',
    background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: isActive ? '1px solid var(--border-hover)' : '1px solid transparent',
  });

  return (
    <header className="glass-panel" style={{
      borderRadius: 0,
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0.75rem 2rem',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '48px',
      }}>
        {/* Branding & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => onViewChange('home')}>
            <div style={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, var(--primary), #4f46e5)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px -2px var(--primary-glow)',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>AttendIQ</h2>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div 
              style={navItemStyle(currentView === 'home')}
              onClick={() => onViewChange('home')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Home
            </div>
            <div 
              style={navItemStyle(currentView === 'insights')}
              onClick={() => onViewChange('insights')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
              </svg>
              Daily Insights
            </div>
          </nav>
        </div>

        {/* Right: Status & API */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div className={`badge ${isOnline ? 'badge-success' : 'badge-error'}`} style={{ padding: '0.35rem 0.75rem' }}>
            <div className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{label}</span>
          </div>

        {/* Right: API Config */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>API ENDPOINT</span>
          {editingUrl ? (
            <input
              autoFocus
              className="input-field"
              value={urlVal}
              onChange={e => setUrlVal(e.target.value)}
              onBlur={commitUrl}
              onKeyDown={e => e.key === 'Enter' && commitUrl()}
              style={{
                width: 240,
                padding: '0.4rem 0.75rem',
                fontSize: '0.8rem',
                fontFamily: 'var(--mono)'
              }}
            />
          ) : (
            <button
              onClick={() => setEditingUrl(true)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                fontFamily: 'var(--mono)',
                fontSize: '0.8rem',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.color = 'var(--text)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
            >
              <span>{apiUrl}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  </header>
);
}
