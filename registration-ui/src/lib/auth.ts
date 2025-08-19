// registration-ui/src/lib/auth.ts
import 'server-only';
import { cookies } from 'next/headers';
import { API_ENDPOINTS, TOKENS } from './constants';

export type Me = { id: string; name: string };

function apiUrl(path: string) {
  const base = process.env.API_URL || process.env.NEXT_PUBLIC_API_BASE || '';
  if (!base) throw new Error('API base URL missing. Set API_URL in .env.local');
  return new URL(path, base).toString();
}

export async function getMe(): Promise<Me | null> {
  const jar = await cookies();
  const token = jar.get(TOKENS.ACCESS)?.value;
  if (!token) return null;

  const url = apiUrl(API_ENDPOINTS.PROFILE_ME);

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      // 401 = invalid/expired token; anything else we’ll just treat as unauthed for now
      const body = await res.text();
      console.error('[getMe] FAIL', { status: res.status, body: body.slice(0, 200) });
      return null;
    }

    const json = await res.json();

    if (json && typeof json.id === 'string' && typeof json.name === 'string') {
      return { id: json.id, name: json.name };
    }

    console.error('[getMe] Unexpected payload shape', json);
    return null;
  } catch (e) {
    console.error('[getMe] ERROR', e);
    return null;
  }
}
