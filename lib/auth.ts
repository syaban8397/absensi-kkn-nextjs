import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import crypto from 'crypto';
import { query } from '@/lib/db';
import type { User } from '@/lib/types';

const COOKIE_NAME = process.env.AUTH_COOKIE || 'absensi_kkn_session';

type SessionPayload = {
  userId: number;
  expiresAt: number;
};

function secret(): string {
  const value = process.env.AUTH_SECRET || 'dev-secret-change-me-minimum-32-characters';
  return value;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
}

function makeToken(payload: SessionPayload): string {
  const encoded = b64url(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
}

function readToken(token?: string): SessionPayload | null {
  if (!token || !token.includes('.')) return null;

  const [encoded, signature] = token.split('.');
  const expected = sign(encoded);

  if (signature.length !== expected.length) return null;

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
    if (!payload.userId || !payload.expiresAt || Date.now() > payload.expiresAt) return null;
    return payload;
  } catch {
    return null;
  }
}

export function setLoginCookie(userId: number): void {
  const maxAge = 60 * 60 * 24; // 1 hari
  const token = makeToken({
    userId,
    expiresAt: Date.now() + maxAge * 1000
  });

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge
  });
}

export function clearLoginCookie(): void {
  cookies().delete(COOKIE_NAME);
}

export function getSessionUserId(): number | null {
  const token = cookies().get(COOKIE_NAME)?.value;
  const payload = readToken(token);
  return payload?.userId ?? null;
}

export async function getCurrentUser(): Promise<User | null> {
  const userId = getSessionUserId();
  if (!userId) return null;

  const rows = await query<User>('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
  return rows[0] ?? null;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

export async function requirePeserta(): Promise<User> {
  const user = await requireUser();
  if (user.role !== 'peserta') redirect('/admin/dashboard');
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== 'admin') redirect('/dashboard');
  return user;
}

export function userInitials(user: Pick<User, 'name'>): string {
  const words = user.name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return (words.map((word) => word[0]).join('') || 'K').toUpperCase();
}

export function userStructureLabel(user: Pick<User, 'role' | 'division' | 'position'>): string {
  const parts = [user.division, user.position].filter(Boolean);
  return parts.length ? parts.join(' • ') : user.role.charAt(0).toUpperCase() + user.role.slice(1);
}
