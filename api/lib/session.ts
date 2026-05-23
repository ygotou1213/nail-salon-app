import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'ns_admin_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 4;

type SessionPayload = {
  admin: true;
  exp: number;
};

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not configured');
  return secret;
}

function toBase64Url(value: string) {
  return Buffer.from(value).toString('base64url');
}

function fromBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function sign(payload: string) {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

function verifySignature(payload: string, signature: string) {
  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(actualBuffer, expectedBuffer);
}

function createSessionValue() {
  const payload: SessionPayload = {
    admin: true,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };
  const encoded = toBase64Url(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
}

function sameSitePolicy() {
  return process.env.CROSS_SITE_COOKIES === 'true' ? 'none' : 'lax';
}

function parseSessionValue(value: string | undefined) {
  if (!value) return null;
  const [payload, signature] = value.split('.');
  if (!payload || !signature || !verifySignature(payload, signature)) return null;
  try {
    const parsed = JSON.parse(fromBase64Url(payload)) as SessionPayload;
    if (parsed.admin !== true || Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function setAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || sameSitePolicy() === 'none',
    sameSite: sameSitePolicy(),
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || sameSitePolicy() === 'none',
    sameSite: sameSitePolicy(),
    path: '/',
    maxAge: 0,
  });
}

export async function getAdminSession({ refresh = true } = {}) {
  const cookieStore = await cookies();
  const session = parseSessionValue(cookieStore.get(COOKIE_NAME)?.value);
  if (session && refresh) await setAdminSession();
  return session;
}
