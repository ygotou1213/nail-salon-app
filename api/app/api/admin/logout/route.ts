import { NextResponse } from 'next/server';
import { corsPreflight, withCors } from '@/lib/responses';
import { clearAdminSession } from '@/lib/session';

export const runtime = 'nodejs';

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}

export async function POST(request: Request) {
  await clearAdminSession();
  return withCors(NextResponse.json({ authenticated: false }), request);
}
