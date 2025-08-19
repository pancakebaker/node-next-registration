// src/hooks/useNotice.ts
import { useState, useCallback } from 'react';
type Notice = { type: 'success' | 'error' | ''; message: string };

export function useNotice(initial: Notice = { type: '', message: '' }) {
  const [notice, setNotice] = useState<Notice>(initial);
  const clear = useCallback(() => setNotice({ type: '', message: '' }), []);
  const success = useCallback((message: string) => setNotice({ type: 'success', message }), []);
  const error = useCallback((message: string) => setNotice({ type: 'error', message }), []);
  return { notice, setNotice, clear, success, error };
}
