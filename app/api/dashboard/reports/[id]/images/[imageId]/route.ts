import { NextResponse } from 'next/server';

const backendUrl =
  process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000/api';

export async function POST(req: Request, { params }: { params: { id: string; imageId: string } }) {
  const authorization = req.headers.get('authorization');
  try {
    const response = await fetch(`${backendUrl}/dashboard/reports/${params.id}/images/${params.imageId}/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization ? { Authorization: authorization } : {}),
      },
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: 'اتصال به سرور برقرار نیست.' }, { status: 503 });
  }
}
