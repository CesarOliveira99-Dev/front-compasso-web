'use client';
import { useEffect, useState } from 'react';

export function pageMemoryKey(user: { id: string; tenantId: string; role: string }, area: string) {
  return `compasso:page:${user.id}:${user.tenantId}:${user.role}:${area}`;
}

export function recalledPage(key: string, allowed: readonly string[], fallback: string) {
  try {
    const saved = sessionStorage.getItem(key);
    return saved && allowed.includes(saved) ? saved : fallback;
  } catch { return fallback; }
}

export function rememberPage(key: string, page: string) {
  try { sessionStorage.setItem(key, page); } catch { /* Navigation works without browser storage. */ }
}

export function usePageMemory(key: string, allowed: readonly string[], fallback: string) {
  const [page, setPage] = useState(fallback);
  const [readyKey, setReadyKey] = useState('');
  const allowedKey = JSON.stringify(allowed);
  useEffect(() => {
    setPage(recalledPage(key, JSON.parse(allowedKey), fallback));
    setReadyKey(key);
  }, [key, allowedKey, fallback]);
  useEffect(() => {
    if (readyKey === key) rememberPage(key, page);
  }, [key, readyKey, page]);
  return [page, setPage] as const;
}
