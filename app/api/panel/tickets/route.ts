import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/auth-client';
import { extractUserFromHeader } from '@/lib/server-auth';
import { createTicketServer, listUserTicketsServer } from '@/lib/support-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') ?? undefined;
  const user = extractUserFromHeader(authHeader);
  if (!user && !authHeader) {
    return NextResponse.json({ items: [] });
  }

  let backendItems: any[] = [];
  try {
    if (authHeader) {
      const res = await fetch(`${BACKEND_URL}/panel/tickets`, {
        headers: { Authorization: authHeader },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        backendItems = Array.isArray(data?.items) ? data.items : [];
      }
    }
  } catch {
    // Ignore backend connection errors, fallback to local storage
  }

  const localItems = await listUserTicketsServer(user?.id || user?.email);

  // Merge items by id and smart deduplication
  const mergedList: any[] = [];
  const seenIds = new Set<string>();
  const seenTrackingCodes = new Set<string>();

  // Process backend items first
  for (const item of backendItems) {
    if (!item?.id) continue;
    seenIds.add(item.id);
    if (item.trackingCode) seenTrackingCodes.add(item.trackingCode);
    mergedList.push({
      ...item,
      category: item.category || 'general',
      priority: item.priority || 'medium',
      status: item.status || 'open',
      _count: item._count || { replies: 0 },
    });
  }

  // Then merge local items, strictly avoiding duplicates
  for (const item of localItems) {
    if (!item?.id) continue;
    if (seenIds.has(item.id)) continue;
    if (item.trackingCode && seenTrackingCodes.has(item.trackingCode)) continue;

    // Check if an existing ticket in mergedList has the exact same subject within 2 minutes
    const itemTime = new Date(item.createdAt || 0).getTime();
    const isDuplicate = mergedList.some((existing) => {
      if (existing.subject?.trim() === item.subject?.trim()) {
        const existingTime = new Date(existing.createdAt || 0).getTime();
        return Math.abs(itemTime - existingTime) < 120000;
      }
      return false;
    });

    if (!isDuplicate) {
      seenIds.add(item.id);
      if (item.trackingCode) seenTrackingCodes.add(item.trackingCode);
      mergedList.push(item);
    }
  }

  mergedList.sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

  return NextResponse.json({ items: mergedList });
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') ?? undefined;
    const user = extractUserFromHeader(authHeader);
    const body = await request.json();

    const { subject, message, category, priority } = body || {};

    if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
      return NextResponse.json({ error: 'موضوع تیکت باید حداقل ۳ حرف باشد.' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'متن تیکت نمی‌تواند خالی باشد.' }, { status: 400 });
    }

    const userName = user?.fullName || 'کاربر بیمار';
    const userEmail = user?.email || 'patient@radinet.ir';
    const userPhone = user?.phone || '۰۹۱۲۰۰۰۰۰۰۰';
    const userId = user?.id || `usr-${Date.now()}`;

    // 1. Forward to backend first if token is available
    let backendTicket: any = null;
    try {
      if (authHeader) {
        const backendRes = await fetch(`${BACKEND_URL}/panel/tickets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
          body: JSON.stringify({
            subject: subject.trim(),
            message: message.trim(),
            category: category || 'general',
            priority: priority || 'medium',
          }),
        });
        if (backendRes.ok) {
          backendTicket = await backendRes.json();
        }
      }
    } catch {
      // Backend optional
    }

    // 2. Synchronize to local storage using the EXACT SAME id if backend generated one
    const localTicket = await createTicketServer({
      id: backendTicket?.id,
      tracking_code: backendTicket?.trackingCode,
      subject: subject.trim(),
      message: message.trim(),
      category: category || 'general',
      priority: priority || 'medium',
      user_name: userName,
      user_email: userEmail,
      user_phone: userPhone,
      user_id: userId,
    });

    const result = {
      id: backendTicket?.id || localTicket.id,
      trackingCode: localTicket.tracking_code,
      subject: localTicket.subject,
      message: localTicket.message,
      category: localTicket.category,
      priority: localTicket.priority,
      status: localTicket.status,
      createdAt: localTicket.created_at,
      updatedAt: localTicket.updated_at,
      _count: { replies: 0 },
    };

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
