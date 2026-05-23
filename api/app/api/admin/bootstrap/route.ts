import { NextResponse } from 'next/server';
import { callGas } from '@/lib/gas';
import { corsJsonError, corsPreflight, withCors, unauthorized } from '@/lib/responses';
import { getAdminSession } from '@/lib/session';

export const runtime = 'nodejs';

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorized(request);

  try {
    const data = await callGas('getAll');
    return withCors(NextResponse.json(data), request);
  } catch (error) {
    return corsJsonError(error instanceof Error ? error.message : 'GAS request failed', request, 502);
  }
}
