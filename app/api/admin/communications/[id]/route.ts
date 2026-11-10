import { NextRequest, NextResponse } from 'next/server';
import { resolveBackendApiUrlForRequest } from '@/lib/auth-client';
import { extractAdminOrSupportUser } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const actor = extractAdminOrSupportUser(req);
  if (!actor) {
    return NextResponse.json(
      { message: 'دسترسی غیرمجاز؛ فقط مدیر یا نقش‌های مجاز مجاز به مدیریت مکالمات هستند.' },
      { status: 403 },
    );
  }

  const backendUrl = resolveBackendApiUrlForRequest(req.headers.get('host'));
  const authHeader = req.headers.get('authorization') || '';
  const id = encodeURIComponent(context.params.id || '');

  try {
    const body = await req.json();
    const res = await fetch(`${backendUrl}/admin/communications/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در به‌روزرسانی وضعیت مکالمه' },
      { status: 502 },
    );
  }
}
