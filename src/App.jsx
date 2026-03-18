import React, { useState } from 'react';
import Header from './components/Header';
import ApiConfig from './components/ApiConfig';
import QueryBar from './components/QueryBar';
import ResultsPanel from './components/ResultsPanel';
import Dashboard from './components/Dashboard';
import { useStatus } from './hooks/useStatus';
import { useQuery } from './hooks/useQuery';

export default function App() {
  const [apiUrl, setApiUrl] = useState('http://localhost:8000');
  const [currentView, setCurrentView] = useState('home'); // 'home' or 'insights'
  const base = apiUrl.trim().replace(/\/$/, '');
  const status = useStatus(base);
  const queryState = useQuery(base);

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header 
        status={status} 
        apiUrl={apiUrl} 
        onApiChange={setApiUrl} 
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <main className="main-content" style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: '3rem 2rem',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem',
        animation: 'slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)'
      }}>
        {currentView === 'home' ? (
          <>
            <div className="hero-section" style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Attendance Intelligence
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                Query your attendance data with ease using our AI-powered retrieval system.
              </p>
            </div>

            <div style={{ padding: '0 1rem' }}>
              <div style={{ height: '1px', background: 'var(--border)', marginBottom: '2.5rem' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>AI Data Exploration</h3>
              <QueryBar onSubmit={queryState.run} loading={queryState.loading} />
            </div>
            
            <ResultsPanel queryState={queryState} apiUrl={base} />
          </>
        ) : (
          <div style={{ animation: 'slideUp 0.5s ease-out' }}>
            <div className="hero-section" style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Daily Insights
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                Automated attendance summaries and performance metrics.
              </p>
            </div>
            <Dashboard apiUrl={base} />
          </div>
        )}
      </main>

      <footer style={{
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-dim)',
        fontSize: '0.85rem',
        borderTop: '1px solid var(--border)',
        marginTop: '4rem'
      }}>
        &copy; {new Date().getFullYear()} AttendIQ. Professional Attendance Management System.
      </footer>
    </div>
  );
}
