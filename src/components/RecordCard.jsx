import React, { useState } from 'react';

const STATUS_CONFIG = {
  present: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: '●' },
  absent: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: '●' },
  late: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: '●' },
  default: { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', icon: '●' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] ?? STATUS_CONFIG.default;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      background: cfg.bg,
      color: cfg.color,
      border: `1px solid ${cfg.color}30`,
      borderRadius: '100px',
      padding: '0.2rem 0.8rem',
      fontSize: '0.75rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.04em'
    }}>
      <span style={{ fontSize: '0.6rem', transform: 'scale(1.2)' }}>{cfg.icon}</span>
      {status || 'Unknown'}
    </span>
  );
}

function FlagBadge({ icon, label, color }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      background: 'rgba(255, 255, 255, 0.03)',
      color: color,
      border: `1px solid ${color}40`,
      borderRadius: '100px',
      padding: '0.2rem 0.8rem',
      fontSize: '0.75rem',
      fontWeight: 600,
    }}>
      <span style={{ fontSize: '0.9rem' }}>{icon}</span> {label}
    </span>
  );
}

function Stat({ label, value, sub, accent, icon }) {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.02)',
      borderRadius: 'var(--radius-md)',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.4rem',
      border: '1px solid var(--border)',
      transition: 'all 0.2s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
        e.currentTarget.style.borderColor = accent ? `${accent}40` : 'var(--border-hover)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        {icon && <span style={{ color: accent || 'var(--text-dim)', opacity: 0.8 }}>{icon}</span>}
        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: accent || 'var(--text)', fontFamily: 'var(--display)' }}>{value}</div>
      {sub && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{sub}</span>}
    </div>
  );
}

function BreakRow({ b, i }) {
  const dur = b.startTime && b.endTime
    ? Math.round((new Date(b.endTime) - new Date(b.startTime)) / 60000)
    : null;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.6rem 1rem',
      background: i % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
      borderRadius: 'var(--radius-sm)',
      fontSize: '0.85rem',
      border: '1px solid transparent',
      transition: 'all 0.2s'
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
    >
      <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--mono)', fontSize: '0.75rem', minWidth: 24, fontWeight: 600 }}>{String(i + 1).padStart(2, '0')}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
        <span style={{ color: 'var(--primary)', fontFamily: 'var(--mono)', fontWeight: 500 }}>{b.startTimeIST || '—'}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        <span style={{ color: b.endTimeIST && b.endTimeIST !== 'Not Recorded' ? 'var(--primary)' : 'var(--warning)', fontFamily: 'var(--mono)', fontWeight: 500 }}>
          {b.endTimeIST && b.endTimeIST !== 'Not Recorded' ? b.endTimeIST : 'Session Active'}
        </span>
      </div>
      {dur != null && (
        <span style={{
          background: 'rgba(99, 102, 241, 0.1)',
          color: 'var(--primary)',
          padding: '0.1rem 0.6rem',
          borderRadius: '100px',
          fontSize: '0.75rem',
          fontFamily: 'var(--mono)',
          fontWeight: 700
        }}>{dur} MIN</span>
      )}
    </div>
  );
}

export default function RecordCard({ record, index }) {
  const [showBreaks, setShowBreaks] = useState(false);

  const {
    userName, dateIST, loginIST, logoutIST, lastActivityIST,
    workDuration, totalWorkedMinutes, overtimeMinutes,
    breakCount, totalBreakMinutes, breaks = [],
    status, isOvernightShift, autoClosed, reason,
    logout, shiftStart, shiftEnd,
  } = record;

  const hasLogout = logout && logoutIST !== 'Not Recorded';

  return (
    <div className="glass-panel" style={{
      animation: 'slideUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
      animationDelay: `${index * 50}ms`,
      opacity: 0,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* ── Card Header ── */}
      <div style={{
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap',
        gap: '1rem',
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.02), transparent)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Avatar */}
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${stringToColor(userName)}, ${stringToColor(userName + 'x')})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1.1rem',
            flexShrink: 0,
            boxShadow: '0 8px 16px -4px rgba(0,0,0,0.3)',
          }}>
            {initials(userName)}
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>{userName || 'Unknown User'}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 500 }}>{dateIST}</span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-dim)' }} />
              {status && <StatusBadge status={status} />}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          {isOvernightShift && <FlagBadge icon="🌙" label="Night" color="#a855f7" />}
          {autoClosed && <FlagBadge icon="⚡" label="Auto" color="#f97316" />}
          {workDuration && (
            <div style={{
              background: 'var(--primary)',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 4px 12px var(--primary-glow)'
            }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.9 }}>Duration</span>
              <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '1.1rem' }}>{workDuration}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '1rem',
        padding: '1.5rem'
      }}>
        {shiftStart && shiftStart !== '—' && (
          <Stat
            label="Shift Start"
            value={shiftStart}
            accent="var(--secondary)"
            icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>}
          />
        )}
        {shiftEnd && shiftEnd !== '—' && (
          <Stat
            label="Shift End"
            value={shiftEnd}
            accent="var(--secondary)"
            icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>}
          />
        )}
        <Stat
          label="Check In"
          value={loginIST}
          accent="var(--primary)"
          icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" /></svg>}
        />
        <Stat
          label="Check Out"
          value={logoutIST}
          accent={hasLogout ? 'var(--success)' : 'var(--warning)'}
          sub={!hasLogout ? 'Session in progress' : undefined}
          icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>}
        />
        {overtimeMinutes > 0 && (
          <Stat label="Overtime" value={`${overtimeMinutes}m`} accent="#a855f7" icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m11.5 8 3 3-3 3M16 11H3M21 11c0 2.209-1.791 4-4 4" /></svg>} />
        )}
        {breakCount > 0 && (
          <Stat label="Total Breaks" value={breakCount} sub={`${totalBreakMinutes}m total downtime`} icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>} />
        )}
      </div>

      {/* ── Breaks Section ── */}
      {breakCount > 0 && (
        <div style={{ borderTop: '1px solid var(--border)', margin: '0 1.5rem' }}>
          <button
            onClick={() => setShowBreaks(o => !o)}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 0',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              Detailed Break History ({breakCount})
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ transform: showBreaks ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {showBreaks && (
            <div style={{ paddingBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {breaks.map((b, i) => <BreakRow key={i} b={b} i={i} />)}
            </div>
          )}
        </div>
      )}

      {/* ── Footer Info ── */}
      {(reason || (lastActivityIST && lastActivityIST !== 'N/A')) && (
        <div style={{
          marginTop: 'auto',
          borderTop: '1px solid var(--border)',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0,0,0,0.2)',
        }}>
          {lastActivityIST && lastActivityIST !== 'N/A' && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
              Last Activity: <strong style={{ color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>{lastActivityIST}</strong>
            </span>
          )}
          {reason && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 500, fontStyle: 'italic' }}>
              {reason}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Helpers
function initials(name = '') {
  return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';
}

function stringToColor(str = '') {
  let hash = 0;
  for (let c of str) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
  return colors[Math.abs(hash) % colors.length];
}
