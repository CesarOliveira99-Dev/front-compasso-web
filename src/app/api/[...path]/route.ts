import {UploadGate} from '@/modules/bff/infrastructure/upload-gate';
const uploads=new UploadGate();
import {boundedBody,BodyTooLarge} from '@/modules/bff/infrastructure/bounded-body';
import { backend } from '@/modules/bff/infrastructure/backend-client';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
const allowed =
  /^(auth\/(login|register|me|logout|stores)|catalog(?:\/[\w-]+)?|customers(?:\/(?:profile|addresses)(?:\/[\w-]+\/default)?)?|appointments(?:\/[\w-]+)?|orders(?:\/[\w-]+)?|discounts\/(coupons|promotions)(?:\/[\w-]+)?|triage(?:\/[\w-]+)?|feedback(?:\/[\w-]+)?|loyalty|settings|notifications(?:\/[\w-]+)?|insights\/(dashboard|wallet|report))$/;
async function handle(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const path = (await context.params).path.join('/');
  const paymentsAllowed =
    /^(payments\/(status|recommendation|connect|subscribe|subscription\/refresh|orders\/[\w-]+))$/;
  const professionalsAllowed = /^professionals(?:\/[\w-]+)?$/;
  const googleAllowed = /^auth\/google(?:\/(?:config|challenge|link|complete))?$/;
  if (
    !/^auth\/(?:store\/[\w-]+|switch-store|last-visit(?:\/review)?|discovery|team(?:\/(?:invite|[\w-]+))?|invite\/(?:preview|register|accept)|password\/request|email\/request|account\/complete)$/.test(path) &&
    !allowed.test(path) &&
    !/^insights\/expenses\/[a-f0-9-]{36}$/.test(path) &&
    !paymentsAllowed.test(path) &&
    !professionalsAllowed.test(path) &&
    !googleAllowed.test(path) &&
    !/^media(?:\/[a-f0-9-]{36})?$/.test(path)
  )
    return NextResponse.json({ message: 'Rota não encontrada.' }, { status: 404 });
  if (request.method !== 'GET') {
    const origin = request.headers.get('origin');
    if (origin && new URL(origin).host !== request.headers.get('host'))
      return NextResponse.json({ message: 'Origem inválida.' }, { status: 403 });
  }
  try {
    if (path.startsWith('media/')) {
      const response = await backend(path,{headers:request.headers.get('range')?{Range:request.headers.get('range')!}:{}});
      if (!response.ok)
        return NextResponse.json(
          { message: 'Arquivo não encontrado.' },
          { status: response.status },
        );
      return new NextResponse(response.body, {
        status:response.status,
        headers: {
          'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
          ...(response.headers.get('content-range')?{'Content-Range':response.headers.get('content-range')!}:{}),
          ...(response.headers.get('content-length')?{'Content-Length':response.headers.get('content-length')!}:{}),
          'Accept-Ranges':'bytes',
          'X-Content-Type-Options': 'nosniff',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }
    if (path === 'media' && request.method === 'POST') {
      if (!(await cookies()).get('compasso_session'))
        return NextResponse.json({ message: 'Entre para continuar.' }, { status: 401 });
      const identity=await backend('auth/me');
      if(!identity.ok)return NextResponse.json({message:'Entre para continuar.'},{status:401});
      const actor=await identity.json();
      if(actor.role!=='admin')return NextResponse.json({message:'Acesso restrito.'},{status:403});
      const release=uploads.acquire(`${actor.tenantId}:${actor.id}`);
      if(!release)return NextResponse.json({message:'Aguarde o envio atual e tente novamente.'},{status:429,headers:{'Retry-After':'5'}});
      try {
      const upload = await boundedBody(request,12*1024*1024+65536);
      if (upload.byteLength > 12 * 1024 * 1024 + 65536)
        return NextResponse.json({ message: 'Arquivo muito grande.' }, { status: 413 });
      const response = await backend('media', {
        method: 'POST',
        body: upload as BodyInit,
        headers: { 'Content-Type': request.headers.get('content-type') || '' },
      });
      return NextResponse.json(await response.json(), { status: response.status });
      }finally{release();}
    }
    let body = request.method === 'GET' ? undefined : new TextDecoder().decode(await boundedBody(request,65536));
    if (path === 'auth/google/complete')
      body = JSON.stringify({
        ...JSON.parse(body || '{}'),
        enrollmentToken: (await cookies()).get('compasso_google_enrollment')?.value || '',
      });
    const response = await backend(`${path}${request.nextUrl.search}`, {
      method: request.method,
      body,
    });
    const data = await response.json();
    if (path === 'auth/google' && response.ok && data.status === 'onboarding_required') {
      const { enrollmentToken, ...result } = data;
      (await cookies()).set('compasso_google_enrollment', enrollmentToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 600,
      });
      return NextResponse.json(result);
    }
    if (
      (path === 'auth/login' ||
        path === 'auth/register' ||
        path === 'auth/google' ||
        path === 'auth/google/complete' || path === 'auth/invite/register' || path === 'auth/invite/accept' || path === 'auth/switch-store') &&
      response.ok &&
      typeof data.token === 'string'
    ) {
      const { token, ...result } = data;
      (await cookies()).delete('compasso_google_enrollment');
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
  } catch (error) {
    if(error instanceof BodyTooLarge)return NextResponse.json({message:'Arquivo ou requisição muito grande.'},{status:413});
    return NextResponse.json(
      { message: 'Não conseguimos acessar o servidor. Tente novamente em instantes.' },
      { status: 503 },
    );
  }
}
export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;
