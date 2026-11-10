import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (
    !path.startsWith('/support-panel') &&
    !path.startsWith('/user-panel') &&
    !path.startsWith('/org') &&
    !path.startsWith('/agency')
  ) {
    return NextResponse.next();
  }
  // Client-side layout shells (SupportShell, UserPanelShell, OrgShell, AgencyShell)
  // verify localStorage/cookie token and role via useAuth().
  return NextResponse.next();
}

export const config = { matcher: ['/support-panel/:path*', '/user-panel/:path*', '/org/:path*', '/agency/:path*'] };
