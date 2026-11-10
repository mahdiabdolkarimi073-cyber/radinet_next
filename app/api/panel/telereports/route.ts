import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/auth-client';
import { extractRequestUser } from '@/lib/server-auth';
import { listUserPanelTelereportsServer } from '@/lib/tele-report-storage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const user = extractRequestUser(req);

  let backendItems: any[] = [];
  try {
    if (auth) {
      const res = await fetch(`${BACKEND_URL}/panel/telereports`, {
        headers: { Authorization: auth },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (Array.isArray(data?.items)) {
          backendItems = data.items;
        }
      }
    }
  } catch {
    // Backend unreachable, fallback to local storage
  }

  try {
    const storageItems = await listUserPanelTelereportsServer({
      userId: user?.userId,
      phone: (user as any)?.phone || user?.email,
      email: user?.email,
    });

    // Merge by id / requestNumber (storage items prioritized for immediate local additions)
    const combinedMap = new Map<string, any>();
    for (const item of storageItems) {
      combinedMap.set(item.id, item);
      combinedMap.set(item.requestNumber, item);
    }
    for (const item of backendItems) {
      if (!combinedMap.has(item.id) && !combinedMap.has(item.requestNumber)) {
        combinedMap.set(item.id, item);
      }
    }

    const items = Array.from(new Set(combinedMap.values())).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    return NextResponse.json({ items });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در دریافت درخواست‌های تله‌ریپورت' },
      { status: 500 },
    );
  }
}
