import { backend } from '@/modules/bff/infrastructure/backend-client';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
const allowed =
  /^(auth\/(login|register|me|logout)|catalog(?:\/[\w-]+)?|customers(?:\/(?:profile|addresses)(?:\/[\w-]+\/default)?)?|appointments(?:\/[\w-]+)?|orders(?:\/[\w-]+)?|discounts\/(coupons|promotions)(?:\/[\w-]+)?|triage(?:\/[\w-]+)?|feedback(?:\/[\w-]+)?|loyalty|settings|notifications(?:\/[\w-]+)?|insights\/(dashboard|wallet|report))$/;
async function handle(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const path = (await context.params).path.join('/');
  if (!allowed.test(path))
    return NextResponse.json({ message: 'Rota não encontrada.' }, { status: 404 });
  if (request.method !== 'GET') {
    const origin = request.headers.get('origin');
    if (origin && new URL(origin).host !== request.headers.get('host'))
      return NextResponse.json({ message: 'Origem inválida.' }, { status: 403 });
  }
  try {
    const response = await backend(`${path}${request.nextUrl.search}`, {
      method: request.method,
      body: request.method === 'GET' ? undefined : await request.text(),
    });
    const data = await response.json();
    if ((path === 'auth/login' || path === 'auth/register') && response.ok) {
      const { token, ...result } = data;
      (await cookies()).set('compasso_session', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 86400,
      });
      return NextResponse.json(result);
    }
    if (path === 'auth/logout' || response.status === 401)
      (await cookies()).delete('compasso_session');
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: 'Não conseguimos acessar o servidor. Tente novamente em instantes.' },
      { status: 503 },
    );
  }
}
export const GET = handle;
export const POST = handle;
export const PATCH = handle;
