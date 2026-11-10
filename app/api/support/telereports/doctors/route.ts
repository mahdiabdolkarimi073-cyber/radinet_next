import { NextRequest, NextResponse } from 'next/server';
import { extractAdminOrSupportUser } from '@/lib/server-auth';
import { listRadiologistDoctorsServer } from '@/lib/tele-report-storage';
import { BACKEND_URL as backendUrl } from '@/lib/auth-client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const actor = extractAdminOrSupportUser(req);
  // Allow authenticated users or support/admin staff
  const map = new Map<string, any>();

  try {
    const authorization = req.headers.get('authorization');
    const response = await fetch(`${backendUrl}/support/telereports/doctors`, {
      headers: authorization ? { Authorization: authorization } : {},
      cache: 'no-store',
    });
    if (response.ok) {
      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      for (const d of list) {
        const id = d.id || d.userId;
        map.set(id, {
          id,
          userId: d.userId || id,
          fullName: d.fullName,
          specialty: d.specialty || 'متخصص رادیولوژی',
        });
      }
    }
  } catch {
    // backend offline
  }

  try {
    const localDoctors = await listRadiologistDoctorsServer();
    for (const d of localDoctors) {
      const id = d.userId || d.id;
      if (!map.has(id)) {
        map.set(id, {
          id,
          userId: d.userId || id,
          fullName: d.fullName,
          specialty: d.specialty || 'متخصص رادیولوژی',
        });
      }
    }
  } catch {
    // ignore
  }

  return NextResponse.json(Array.from(map.values()));
}

