import { NextResponse } from 'next/server';

function allowedOrigins() {
  return (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
}

export function corsHeaders(request: Request) {
  const origin = request.headers.get('origin') || '';
  const allowList = allowedOrigins();
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  };
  if (origin && allowList.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

export function withCors(response: NextResponse, request: Request) {
  for (const [key, value] of Object.entries(corsHeaders(request))) {
    response.headers.set(key, value);
  }
  return response;
}

export function corsPreflight(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}

export function jsonOk(body: unknown, request: Request) {
  return withCors(NextResponse.json(body), request);
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function corsJsonError(message: string, request: Request, status = 400) {
  return withCors(jsonError(message, status), request);
}

export function unauthorized(request: Request) {
  return corsJsonError('Unauthorized', request, 401);
}
