import { cookies } from 'next/headers';
import 'server-only';
const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:4000/v1';
export async function backend(path: string, init?: RequestInit): Promise<Response> {
  const token = (await cookies()).get('compasso_session')?.value;
  return fetch(`${backendUrl}/${path}`, {
    ...init,
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
}
