/**
 * hooks/useQuery.js
 * Manages the attendance query state: loading, records, error,
 * plus AI explanation and raw MongoDB filter from backend.
 */

import { useState, useCallback } from 'react';
import { queryAttendance } from '../utils/api';

export function useQuery(baseUrl) {
  const [state, setState] = useState({
    loading: false,
    records: null,   // null = not yet queried
    answer: '',
    count: 0,
    error: null,
    lastQuery: '',
    explanation: '',     // Groq AI's plain-English explanation of what it queried
    mongoFilter: '',     // Raw MongoDB filter string (for debug display)
    visualization: null, // AI-suggested visualization metadata
  });

  const run = useCallback(async (query) => {
    if (!query.trim()) return;
    setState(s => ({
      ...s,
      loading: true,
      error: null,
      lastQuery: query,
      explanation: '',
      mongoFilter: '',
      visualization: null,
    }));

    try {
      const data = await queryAttendance(baseUrl, query);
      setState(s => ({
        ...s,
        loading: false,
        records: data.records ?? [],
        answer: data.answer ?? '',
        count: data.count ?? 0,
        explanation: data.explanation ?? '',
        mongoFilter: data.mongoFilter ?? '',
        visualization: data.visualization ?? null,
      }));
    } catch (err) {
      setState(s => ({
        ...s,
        loading: false,
        records: [],
        error: err.message,
      }));
    }
  }, [baseUrl]);

  return { ...state, run };
}