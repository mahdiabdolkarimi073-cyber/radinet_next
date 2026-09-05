import { NextResponse } from 'next/server';
const backendUrl = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000/api';
export async function POST(req: Request) {
  try {
    const authorization = req.headers.get('authorization');
    const body = await req.json();
    const response = await fetch(`${backendUrl}/admin/notifications/send`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(authorization ? { Authorization: authorization } : {}) }, body: JSON.stringify(body), cache: 'no-store' });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch { return NextResponse.json({ error: 'اتصال به سرور برقرار نیست.' }, { status: 503 }); }
}
