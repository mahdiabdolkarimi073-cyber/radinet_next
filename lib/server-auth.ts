import crypto from 'crypto';
import type { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET ?? 'radinet-dev-secret-change-me';

export type VerifiedServerUser = {
  userId: string;
  email: string;
  role: string;
  fullName?: string;
  organizationId?: string | null;
};

function base64UrlDecode(str: string): Buffer {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64');
}

export function verifyJwtTokenServer(rawToken: string): VerifiedServerUser | null {
  try {
    const parts = rawToken.trim().split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, sigB64] = parts;
    const data = `${headerB64}.${payloadB64}`;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(data)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const sigBuf = Buffer.from(sigB64);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payloadJson = base64UrlDecode(payloadB64).toString('utf-8');
    const payload = JSON.parse(payloadJson);

    if (typeof payload.exp === 'number') {
      const nowSec = Math.floor(Date.now() / 1000);
      if (nowSec >= payload.exp) return null;
    }

    const userId =
      typeof payload.sub === 'string' && payload.sub.trim()
        ? payload.sub.trim()
        : typeof payload.userId === 'string' && payload.userId.trim()
          ? payload.userId.trim()
          : typeof payload.id === 'string' && payload.id.trim()
            ? payload.id.trim()
            : '';
    if (!userId) return null;

    return {
      userId,
      email: typeof payload.email === 'string' ? payload.email : '',
      role: typeof payload.role === 'string' ? payload.role : 'user',
      fullName:
        typeof payload.fullName === 'string'
          ? payload.fullName
          : typeof payload.name === 'string'
            ? payload.name
            : undefined,
      organizationId: typeof payload.organizationId === 'string' ? payload.organizationId : null,
    };
  } catch {
    return null;
  }
}

export function parseJwtPayloadUnsafe(rawToken: string): VerifiedServerUser | null {
  try {
    const parts = rawToken.trim().split('.');
    if (parts.length !== 3) return null;
    const json = base64UrlDecode(parts[1]).toString('utf-8');
    const payload = JSON.parse(json);

    if (typeof payload.exp === 'number') {
      const nowSec = Math.floor(Date.now() / 1000);
      if (nowSec >= payload.exp) return null;
    }

    const userId =
      typeof payload.sub === 'string' && payload.sub.trim()
        ? payload.sub.trim()
        : typeof payload.userId === 'string' && payload.userId.trim()
          ? payload.userId.trim()
          : typeof payload.id === 'string' && payload.id.trim()
            ? payload.id.trim()
            : '';
    if (!userId) return null;

    return {
      userId,
      email: typeof payload.email === 'string' ? payload.email : '',
      role: typeof payload.role === 'string' ? payload.role : 'user',
      fullName:
        typeof payload.fullName === 'string'
          ? payload.fullName
          : typeof payload.name === 'string'
            ? payload.name
            : undefined,
      organizationId: typeof payload.organizationId === 'string' ? payload.organizationId : null,
    };
  } catch {
    return null;
  }
}

export function extractUserFromHeader(authHeader?: string | null): (VerifiedServerUser & { id: string; phone?: string }) | null {
  if (!authHeader) return null;
  const token = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : authHeader.trim();
  const user = verifyJwtTokenServer(token) || parseJwtPayloadUnsafe(token);
  if (!user) return null;
  return {
    ...user,
    id: user.userId,
    phone: '',
  };
}

export function extractRequestUser(req: NextRequest): VerifiedServerUser | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    const user = extractUserFromHeader(authHeader);
    if (user) return user;
  }

  const cookieToken =
    req.cookies.get('radinet_token')?.value || req.cookies.get('radinet_auth_token')?.value;
  if (cookieToken) {
    const decoded = decodeURIComponent(cookieToken);
    const verified = verifyJwtTokenServer(decoded) || parseJwtPayloadUnsafe(decoded);
    if (verified) return verified;
  }

  return null;
}

export function extractAdminUser(req: NextRequest): VerifiedServerUser | null {
  const user = extractRequestUser(req);
  if (!user) return null;
  const role = user.role.toLowerCase();
  if (role !== 'admin') return null;
  return user;
}

export function extractAdminOrSupportUser(req: NextRequest): VerifiedServerUser | null {
  const user = extractRequestUser(req);
  if (!user) return null;
  const role = user.role.toLowerCase();
  if (role !== 'admin' && !role.startsWith('support')) return null;
  return user;
}

export function extractDoctorUser(req: NextRequest): VerifiedServerUser | null {
  const user = extractRequestUser(req);
  if (!user) return null;
  const role = user.role.toLowerCase();
  if (role !== 'doctor' && role !== 'radiologist' && role !== 'admin') return null;
  return user;
}


