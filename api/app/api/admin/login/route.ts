import { NextResponse } from 'next/server';
import { corsJsonError, corsPreflight, jsonOk, withCors } from '@/lib/responses';
import { setAdminSession } from '@/lib/session';

export const runtime = 'nodejs';

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}

export async function POST(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return corsJsonError('ADMIN_PASSWORD is not configured', request, 500);

  const body = await request.json().catch(() => ({}));
  if (body?.password !== adminPassword) {
    return corsJsonError('Invalid password', request, 401);
  }

  await setAdminSession();
  return withCors(NextResponse.json({ authenticated: true }), request);
}
