import { NextResponse } from 'next/server';
import { corsPreflight, withCors } from '@/lib/responses';

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}

export async function GET(request: Request) {
  return withCors(NextResponse.json({ ok: true }), request);
}
