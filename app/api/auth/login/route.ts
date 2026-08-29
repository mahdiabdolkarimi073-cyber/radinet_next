import { NextResponse } from 'next/server';
import { postAuth } from '@/lib/auth-client';

export async function POST(req: Request) {
  const body = await req.json();
  const result = await postAuth('login', body);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
