import { NextResponse } from 'next/server';
import { BACKEND_URL as backendUrl } from '@/lib/auth-client';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authorization = req.headers.get('authorization');
    const response = await fetch(`${backendUrl}/admin/ai-tariff/ai-status`, {
      headers: authorization ? { Authorization: authorization } : {},
      cache: 'no-store',
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      {
        enabled: true,
        aiAnalysisEnabled: true,
        aiPricingEnabled: true,
        suggestedPrice: 950000,
        currency: 'IRR',
      },
      { status: 200 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const authorization = req.headers.get('authorization');
    const body = await req.json();
    const response = await fetch(`${backendUrl}/admin/ai-tariff/ai-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: 'اتصال به سرور برقرار نیست.' }, { status: 503 });
  }
}
