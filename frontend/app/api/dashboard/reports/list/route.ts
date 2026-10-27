import { NextResponse } from 'next/server';

const backendUrl =
  process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000/api';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const authorization = req.headers.get('authorization');

  try {
    const response = await fetch(`${backendUrl}/dashboard/reports?${searchParams.toString()}`, {
      headers: authorization ? { Authorization: authorization } : {},
      cache: 'no-store',
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: 'اتصال به سرور برقرار نیست.' }, { status: 503 });
  }
}
