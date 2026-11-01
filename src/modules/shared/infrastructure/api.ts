export async function api<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(`/api/${path}`, {
    method,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      typeof data.message === 'string'
        ? data.message
        : 'Não foi possível concluir. Tente novamente.',
    );
  return data as T;
}
