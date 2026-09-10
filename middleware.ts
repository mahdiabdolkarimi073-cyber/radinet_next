import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!path.startsWith('/support-panel') && !path.startsWith('/user-panel') && !path.startsWith('/org')) return NextResponse.next();
  const token = request.cookies.get('radinet_auth_token')?.value;
  if (!token) {
    // Also check localStorage-based auth — middleware can't read localStorage, but the
    // client-side layout will handle redirect. For SSR, just pass through.
    // The real auth check happens in the client layout component.
    if (path.startsWith('/org')) return NextResponse.next();
    return NextResponse.redirect(new URL('/auth', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/support-panel/:path*', '/user-panel/:path*'] };
