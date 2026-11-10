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
    const doc = doctors.find((d) => d.id === id || d.userId === id);
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
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }
  } catch {
    // Proceed to local database update
  }

  try {
    const dbFile = getDbPath();
    if (fs.existsSync(dbFile)) {
      const db = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
      db.doctorProfiles = db.doctorProfiles || [];
      const idx = db.doctorProfiles.findIndex((p: any) => p.id === id || p.userId === id);

      if (idx !== -1) {
        if (body.action === 'approve') {
          db.doctorProfiles[idx].collaborationStatus = 'approved';
        } else if (body.action === 'reject') {
          db.doctorProfiles[idx].collaborationStatus = 'rejected';
        } else {
          db.doctorProfiles[idx] = {
            ...db.doctorProfiles[idx],
            ...body,
            updatedAt: new Date().toISOString(),
          };
        }
        fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf-8');
        return NextResponse.json({ ok: true, doctor: db.doctorProfiles[idx] });
      }
    }
    return NextResponse.json({ ok: true, message: 'اطلاعات پزشک به‌روزرسانی شد.' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'ویرایش مشخصات پزشک ناموفق بود.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { pathname } = new URL(req.url);
  const id = decodeURIComponent(pathname.split('/').pop() || '');

  try {
    const authorization = req.headers.get('authorization');
    const response = await fetch(`${backendUrl}/admin/doctors/${id}`, {
      method: 'DELETE',
      headers: authorization ? { Authorization: authorization } : {},
    });
    if (response.ok) {
      const data = await response.json().catch(() => ({ ok: true }));
      return NextResponse.json(data);
    }
  } catch {
    // Backend offline, fallback to local database
  }

  try {
    const dbFile = getDbPath();
    if (fs.existsSync(dbFile)) {
      const db = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
      const profile = (db.doctorProfiles || []).find((p: any) => p.id === id || p.userId === id);
      const targetUserId = profile?.userId || id;

      db.doctorProfiles = (db.doctorProfiles || []).filter((p: any) => p.id !== id && p.userId !== id);
      db.users = (db.users || []).filter((u: any) => u.id !== targetUserId && u.id !== id);

      fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf-8');
      return NextResponse.json({ ok: true, message: 'پزشک رادیولوژیست با موفقیت از سیستم حذف شد.' });
    }
    return NextResponse.json({ ok: true, message: 'عملیات حذف انجام شد.' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'حذف پزشک ناموفق بود.' }, { status: 500 });
  }
}

