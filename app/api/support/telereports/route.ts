import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL as backendUrl } from '@/lib/auth-client';
import { getAuthorizationHeader } from '@/lib/server-auth';
import { listAdminTeleReportsServer } from '@/lib/tele-report-storage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    let backendItems: any[] = [];
    try {
      const authHeader = getAuthorizationHeader(req, 'support_expert');
      const qs = searchParams.toString();
      const bRes = await fetch(`${backendUrl}/support/telereports${qs ? `?${qs}` : ''}`, {
        headers: { Authorization: authHeader },
        cache: 'no-store',
      });
      if (bRes.ok) {
        const bData = await bRes.json();
        backendItems = Array.isArray(bData?.items) ? bData.items : Array.isArray(bData) ? bData : [];
      }
    } catch {
      // Backend offline, fallback to local
    }

    const localData = await listAdminTeleReportsServer({
      status,
      search,
      page: 1,
      limit: 100,
    });

    const map = new Map<string, any>();
    for (const item of backendItems) {
      const key = item.requestNumber || item.id;
      if (key) map.set(key, item);
    }

    for (const item of localData.items || []) {
      const key = item.requestNumber || item.id;
      if (key) {
        if (map.has(key)) {
          const backendItem = map.get(key);
          map.set(key, {
            ...item,
            ...backendItem,
            id: backendItem.id || item.id,
            localId: item.id,
          });
        } else {
          map.set(key, item);
        }
      }
    }

    let merged = Array.from(map.values());
    if (status && status !== 'all') {
      merged = merged.filter((r) => {
        if (status === 'new') return r.status === 'new' || r.status === 'pending_review';
        return r.status === status;
      });
    }

    merged.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return NextResponse.json(merged);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در دریافت درخواست‌های تله‌ریپورت' },
      { status: 500 },
    );
  }
}
