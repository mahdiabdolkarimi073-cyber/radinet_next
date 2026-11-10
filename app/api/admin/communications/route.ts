import { NextRequest, NextResponse } from 'next/server';
import { resolveBackendApiUrlForRequest } from '@/lib/auth-client';
import { extractAdminOrSupportUser } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const actor = extractAdminOrSupportUser(req);
  if (!actor) {
    return NextResponse.json(
      { message: 'دسترسی غیرمجاز؛ فقط مدیر یا نقش‌های مجاز به بخش ارتباطات پزشک و بیمار دسترسی دارند.' },
      { status: 403 },
    );
  }

  const backendUrl = resolveBackendApiUrlForRequest(req.headers.get('host'));
  const authHeader = req.headers.get('authorization') || '';
  const search = req.nextUrl.search;

  try {
    const res = await fetch(`${backendUrl}/admin/communications${search}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در ارتباط با سرویس مکالمات بک‌اند' },
      { status: 502 },
    );
  }
}
