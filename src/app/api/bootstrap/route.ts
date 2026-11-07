import { backend } from '@/modules/bff/infrastructure/backend-client';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const user = await backend('auth/me');
    if (!user.ok) return NextResponse.json({ message: 'Entre para continuar.' }, { status: 401 });
    const actor=await user.json();
    const paths = ['settings', ...(actor.role==='employee'?[]:['insights/dashboard']), 'catalog', 'appointments', 'notifications'];
    const responses = await Promise.all(paths.map((path) => backend(path)));
    if (responses.some((r) => !r.ok))
      return NextResponse.json(
        { message: 'Não foi possível carregar seu espaço.' },
        { status: 503 },
      );
    const values = await Promise.all(
      responses.map((r) => r.json()),
    );
    const [settings,dashboard,catalog,appointments,notifications] = actor.role==='employee'?[values[0],{},values[1],values[2],values[3]]:values;
    return NextResponse.json({
      user: actor,
      settings,
      dashboard,
      catalog,
      appointments,
      notifications,
    });
  } catch {
    return NextResponse.json({ message: 'O servidor está indisponível.' }, { status: 503 });
  }
}
