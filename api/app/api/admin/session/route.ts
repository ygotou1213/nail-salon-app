import { NextResponse } from 'next/server';
import { corsPreflight, withCors } from '@/lib/responses';
import { getAdminSession } from '@/lib/session';

export const runtime = 'nodejs';

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}

export async function GET(request: Request) {
  const session = await getAdminSession();
  return withCors(NextResponse.json({ authenticated: !!session }), request);
}
