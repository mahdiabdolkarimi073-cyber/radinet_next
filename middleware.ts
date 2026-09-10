import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!path.startsWith('/support-panel') && !path.startsWith('/user-panel')) return NextResponse.next();
  const token = request.cookies.get('radinet_auth_token')?.value;
  if (!token) return NextResponse.redirect(new URL('/auth', request.url));
  return NextResponse.next();
}

export const config = { matcher: ['/support-panel/:path*', '/user-panel/:path*'] };
