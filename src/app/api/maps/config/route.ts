import { NextResponse } from 'next/server';
export function GET() {
  return NextResponse.json({ key: process.env.GOOGLE_MAPS_EMBED_KEY || '' });
}
