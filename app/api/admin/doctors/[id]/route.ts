import { NextResponse } from 'next/server';
import { BACKEND_URL as backendUrl } from '@/lib/auth-client';
import { listRadiologistDoctorsServer } from '@/lib/tele-report-storage';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function getDbPath(): string {
  const localData = path.join(process.cwd(), 'data', 'radinet_db.json');
  if (fs.existsSync(localData)) return localData;
  const frontendData = path.join(process.cwd(), 'frontend', 'data', 'radinet_db.json');
  if (fs.existsSync(frontendData)) return frontendData;
  if (fs.existsSync(path.join(process.cwd(), 'frontend'))) {
    return frontendData;
  }
  return localData;
}

export async function GET(req: Request) {
  const { pathname } = new URL(req.url);
  const id = decodeURIComponent(pathname.split('/').pop() || '');

  try {
    const authorization = req.headers.get('authorization');
    const response = await fetch(`${backendUrl}/admin/doctors/${id}`, {
      headers: authorization ? { Authorization: authorization } : {},
      cache: 'no-store',
    });
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }
  } catch {
    // Proceed to local fallback
  }

  try {
    const doctors = await listRadiologistDoctorsServer();
    const doc = doctors.find((d) => d.id === id || d.userId === id || d.id === `doc-${id}`);
    if (!doc) {
      return NextResponse.json({ error: 'پزشک مورد نظر یافت نشد.' }, { status: 404 });
    }
    return NextResponse.json({
      doctor: doc,
      stats: doc.stats || { totalReports: 0, signedReports: 0, completedReports: 0, avgResponseHours: null },
      recentReports: [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'خطا در دریافت اطلاعات پزشک' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { pathname } = new URL(req.url);
  const id = decodeURIComponent(pathname.split('/').pop() || '');
  const body = await req.json().catch(() => ({}));

  let backendData: any = null;
  try {
    const authorization = req.headers.get('authorization');
    let endpoint = `${backendUrl}/admin/doctors/${id}`;
    if (body.action === 'approve') endpoint += '/approve';
    else if (body.action === 'reject') endpoint += '/reject';

    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify(body.action ? {} : body),
      cache: 'no-store',
    });
    if (response.ok) {
      backendData = await response.json();
    }
  } catch {
    // Proceed to local database update
  }

  try {
    const dbFile = getDbPath();
    if (fs.existsSync(dbFile)) {
      const db = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
      db.doctorProfiles = db.doctorProfiles || [];
      const idx = db.doctorProfiles.findIndex((p: any) => p.id === id || p.userId === id || p.id === `doc-${id}`);

      if (idx !== -1) {
        if (body.action === 'approve') {
          db.doctorProfiles[idx].collaborationStatus = 'approved';
          db.doctorProfiles[idx].isActive = true;
        } else if (body.action === 'reject') {
          db.doctorProfiles[idx].collaborationStatus = 'rejected';
          db.doctorProfiles[idx].isActive = false;
        } else {
          db.doctorProfiles[idx] = {
            ...db.doctorProfiles[idx],
            ...body,
            updatedAt: new Date().toISOString(),
          };
          // Also update user record if fullName/email provided
          if (body.fullName || body.email) {
            const userIdx = (db.users || []).findIndex((u: any) => u.id === db.doctorProfiles[idx].userId);
            if (userIdx !== -1) {
              if (body.fullName) db.users[userIdx].fullName = body.fullName;
              if (body.email) db.users[userIdx].email = body.email;
            }
          }
        }
        fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf-8');
        return NextResponse.json(backendData || { ok: true, doctor: db.doctorProfiles[idx] });
      }
    }
    if (backendData) return NextResponse.json(backendData);
    return NextResponse.json({ ok: true, message: 'اطلاعات پزشک به‌روزرسانی شد.' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'ویرایش مشخصات پزشک ناموفق بود.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { pathname } = new URL(req.url);
  const id = decodeURIComponent(pathname.split('/').pop() || '');

  let backendDeleted = false;
  try {
    const authorization = req.headers.get('authorization');
    const response = await fetch(`${backendUrl}/admin/doctors/${id}`, {
      method: 'DELETE',
      headers: authorization ? { Authorization: authorization } : {},
    });
    if (response.ok) {
      backendDeleted = true;
    }
  } catch {
    // Backend offline, fallback to local database
  }

  try {
    const dbFile = getDbPath();
    if (fs.existsSync(dbFile)) {
      const db = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
      const profile = (db.doctorProfiles || []).find((p: any) => p.id === id || p.userId === id || p.id === `doc-${id}`);
      const targetUserId = profile?.userId || id;
      const targetDocId = profile?.id || id;

      // Safe relation management: unassign without deleting patient requests
      for (const r of db.teleReportRequests || []) {
        if (r.assignedDoctorId === targetUserId || r.assignedDoctorId === targetDocId) {
          r.assignedDoctorId = null;
          r.assignedDoctorName = null;
          if (r.status === 'assigned') {
            r.status = 'new';
          }
        }
      }

      // Safe relation management: keep medical report contents intact without doctor link
      for (const rep of db.radiologyReports || []) {
        if (rep.authorId === targetUserId || rep.authorId === targetDocId) {
          rep.authorId = null;
        }
      }

      // Remove from profiles and users
      db.doctorProfiles = (db.doctorProfiles || []).filter((p: any) => p.id !== id && p.userId !== id && p.id !== targetDocId);
      db.users = (db.users || []).filter((u: any) => u.id !== targetUserId && u.id !== id);

      fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf-8');
      return NextResponse.json({ ok: true, message: 'پزشک رادیولوژیست با موفقیت از سیستم حذف شد.' });
    }
    return NextResponse.json({ ok: true, message: 'عملیات حذف انجام شد.' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'حذف پزشک ناموفق بود.' }, { status: 500 });
  }
}

