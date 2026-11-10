import { NextResponse } from 'next/server';
import { BACKEND_URL as backendUrl } from '@/lib/auth-client';
import { getAuthorizationHeader } from '@/lib/server-auth';
import { listAdminTeleReportsServer } from '@/lib/tele-report-storage';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || undefined;
  const search = searchParams.get('search') || undefined;
  const imagingType = searchParams.get('imagingType') || undefined;
  const page = Math.max(Number(searchParams.get('page')) || 1, 1);
  const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 20, 1), 100);

  let backendData: any = null;
  try {
    const authHeader = getAuthorizationHeader(req, 'admin');
    const qs = searchParams.toString();
    const response = await fetch(`${backendUrl}/admin/tele-reports${qs ? `?${qs}` : ''}`, {
      headers: { Authorization: authHeader },
      cache: 'no-store',
    });
    if (response.ok) {
      backendData = await response.json();
    }
  } catch {
    // Backend offline, proceed to local database
  }

  try {
    const localData = await listAdminTeleReportsServer({
      status,
      search,
      imagingType,
      page: 1,
      limit: 1000,
    });

    const backendItems = Array.isArray(backendData?.items)
      ? backendData.items
      : Array.isArray(backendData)
        ? backendData
        : [];

    const map = new Map<string, any>();

    // 1. Add backend items
    for (const item of backendItems) {
      const key = item.requestNumber || item.id;
      if (key) map.set(key, item);
    }

    // 2. Merge local items (patient submissions)
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

    if (imagingType && imagingType !== 'all') {
      merged = merged.filter((r) => r.imagingType === imagingType);
    }

    if (search?.trim()) {
      const q = search.trim().toLowerCase();
      merged = merged.filter(
        (r) =>
          (r.requestNumber || '').toLowerCase().includes(q) ||
          `${r.patientFirstName || ''} ${r.patientLastName || ''}`.toLowerCase().includes(q) ||
          (r.phone || '').toLowerCase().includes(q) ||
          (r.nationalId || '').toLowerCase().includes(q) ||
          (r.city || '').toLowerCase().includes(q),
      );
    }

    merged.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    const total = merged.length;
    const paged = merged.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      items: paged,
      total,
      page,
      limit,
      pages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (err: any) {
    return NextResponse.json(
      { items: [], total: 0, page: 1, limit: 20, pages: 1, error: err?.message || 'خطا در دریافت لیست' },
      { status: 500 },
    );
  }
}
