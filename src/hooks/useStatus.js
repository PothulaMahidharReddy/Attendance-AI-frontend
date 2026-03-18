/**
 * hooks/useStatus.js
 * Polls the backend /status endpoint every 30 seconds.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchStatus } from '../utils/api';

export function useStatus(baseUrl) {
  const [status, setStatus] = useState({ state: 'loading', records: null });

  const check = useCallback(async () => {
    try {
      const data = await fetchStatus(baseUrl);
      setStatus({
        state:   data.status === 'connected' ? 'online' : 'error',
        records: data.total_records ?? null,
      });
    } catch {
      setStatus({ state: 'offline', records: null });
    }
  }, [baseUrl]);

  useEffect(() => {
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, [check]);

  return status;
}
