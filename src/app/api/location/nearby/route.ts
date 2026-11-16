import { NextResponse } from 'next/server';
import { boundedBody, BodyTooLarge } from '@/modules/bff/infrastructure/bounded-body';

export const dynamic = 'force-dynamic';
let windowStart = 0, lookups = 0;
const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
export function GET() { return reply({ enabled: !!process.env.GOOGLE_GEOCODING_API_KEY }); }
export async function POST(request: Request) {
  const key = process.env.GOOGLE_GEOCODING_API_KEY;
  if (!key) return reply({ message: 'A localização automática ainda não foi ativada. Busque pelo nome da cidade.' }, 503);
  if (request.headers.get('origin') !== new URL(request.url).origin) return reply({ message: 'Origem inválida.' }, 403);
  let latitude: number, longitude: number;
  try {
    const body = JSON.parse(new TextDecoder().decode(await boundedBody(request, 200)));
    latitude = body.latitude; longitude = body.longitude;
    if (typeof latitude !== 'number' || !Number.isFinite(latitude) || Math.abs(latitude) > 90 ||
      typeof longitude !== 'number' || !Number.isFinite(longitude) || Math.abs(longitude) > 180) throw new Error();
  } catch (error) { return reply({ message: 'Localização inválida.' }, error instanceof BodyTooLarge ? 413 : 400); }
  // Bound paid lookups per process; the provider's project quota remains the global budget control.
  if (Date.now() - windowStart >= 60000) { windowStart = Date.now(); lookups = 0; }
  if (lookups >= 20) return reply({ message: 'Aguarde um instante ou busque pelo nome da cidade.' }, 429);
  lookups++;
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.search = new URLSearchParams({ latlng: `${latitude.toFixed(2)},${longitude.toFixed(2)}`, key,
      language: 'pt-BR', result_type: 'administrative_area_level_2|locality' }).toString();
    const response = await fetch(url, { signal: AbortSignal.timeout(5000), cache: 'no-store' });
    if (!response.ok) throw new Error();
    const data = await response.json();
    if (data.status !== 'OK' || !Array.isArray(data.results)) throw new Error();
    const components = data.results.flatMap((result: { address_components?: unknown[] }) => result.address_components || []);
    const component = (type: string) => components.find((value: { types?: string[] }) => Array.isArray(value.types) && value.types.includes(type));
    const city = component('administrative_area_level_2')?.long_name || component('locality')?.long_name;
    const state = component('administrative_area_level_1')?.short_name;
    if (typeof city !== 'string' || !city.trim() || city.length > 100 || typeof state !== 'string' || !/^[A-Z]{2}$/.test(state) || component('country')?.short_name !== 'BR')
      return reply({ message: 'Não identificamos uma cidade brasileira. Você pode buscar qualquer cidade manualmente.' }, 404);
    return reply({ city, state });
  } catch { return reply({ message: 'Não foi possível identificar sua região. Busque pelo nome da cidade.' }, 503); }
}
