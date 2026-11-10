import { NextRequest, NextResponse } from 'next/server';
import { extractAdminOrSupportUser, getAuthorizationHeader } from '@/lib/server-auth';
import { listRadiologistDoctorsServer } from '@/lib/tele-report-storage';
import { BACKEND_URL as backendUrl } from '@/lib/auth-client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const actor = extractAdminOrSupportUser(req);
  // Allow authenticated users or support/admin staff
  const map = new Map<string, any>();
  const seenEmails = new Set<string>();

  try {
    const authHeader = getAuthorizationHeader(req, 'support_expert');
    const response = await fetch(`${backendUrl}/support/telereports/doctors`, {
      headers: { Authorization: authHeader },
      cache: 'no-store',
    });
    if (response.ok) {
      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      for (const d of list) {
        const id = d.userId || d.id;
        const email = (d.email || d.user?.email || '').trim().toLowerCase();
        map.set(id, {
          id: d.id || id,
          userId: d.userId || id,
          fullName: d.fullName,
          email: d.email || d.user?.email || '',
          specialty: d.specialty || 'متخصص رادیولوژی و تله‌ریپورت',
        });
        if (email) seenEmails.add(email);
      }
    }
  } catch {
    // backend offline
  }

  try {
    const localDoctors = await listRadiologistDoctorsServer();
    for (const d of localDoctors) {
      const id = d.userId || d.id;
      const email = (d.email || '').trim().toLowerCase();
      if (!map.has(id) && (!email || !seenEmails.has(email))) {
        map.set(id, {
          id: d.id || id,
          userId: d.userId || id,
          fullName: d.fullName,
          email: d.email || '',
          specialty: d.specialty || 'متخصص رادیولوژی و تله‌ریپورت',
        });
        if (email) seenEmails.add(email);
      }
    }
  } catch {
    // ignore
  }

  return NextResponse.json(Array.from(map.values()));
}

