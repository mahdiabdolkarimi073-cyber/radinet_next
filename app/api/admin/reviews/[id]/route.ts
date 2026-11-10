import { NextRequest, NextResponse } from 'next/server';
import { resolveBackendApiUrlForRequest } from '@/lib/auth-client';
import { extractAdminUser } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const admin = extractAdminUser(req);
  if (!admin) {
    return NextResponse.json(
      { message: 'دسترسی غیرمجاز؛ فقط مدیر سیستم مجاز به تغییر وضعیت نظرات است.' },
      { status: 403 },
    );
  }

  const backendUrl = resolveBackendApiUrlForRequest(req.headers.get('host'));
  const authHeader = req.headers.get('authorization') || '';
  const id = encodeURIComponent(context.params.id || '');

  try {
    const body = await req.json();
    const res = await fetch(`${backendUrl}/admin/reviews/${id}`, {
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
      { message: err?.message || 'خطا در تغییر وضعیت نظر' },
      { status: 502 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const admin = extractAdminUser(req);
  if (!admin) {
    return NextResponse.json(
      { message: 'دسترسی غیرمجاز؛ فقط مدیر سیستم مجاز به حذف نظرات است.' },
      { status: 403 },
    );
  }

  const backendUrl = resolveBackendApiUrlForRequest(req.headers.get('host'));
  const authHeader = req.headers.get('authorization') || '';
  const id = encodeURIComponent(context.params.id || '');

  try {
    const res = await fetch(`${backendUrl}/admin/reviews/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در حذف نظر' },
      { status: 502 },
    );
  }
}
