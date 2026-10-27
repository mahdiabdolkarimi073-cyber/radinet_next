import { NextResponse } from 'next/server';
import { postAuth } from '@/lib/auth-client';

export async function POST(req: Request) {
  const body = await req.json();
  const result = await postAuth('register', body);
  const response = NextResponse.json(result, { status: result.ok ? 200 : 400 });
  if (result.ok && result.token) {
    response.cookies.set('radinet_auth_token', result.token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });
  }
  return response;
}
