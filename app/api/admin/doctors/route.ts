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
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status') || 'all';
  const searchFilter = searchParams.get('search')?.toLowerCase()?.trim() || '';
  const page = Math.max(Number(searchParams.get('page')) || 1, 1);
  const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 10, 1), 100);

  let backendItems: any[] = [];
  try {
    const authorization = req.headers.get('authorization');
    const qs = searchParams.toString();
    const response = await fetch(`${backendUrl}/admin/doctors${qs ? `?${qs}` : ''}`, {
      headers: authorization ? { Authorization: authorization } : {},
      cache: 'no-store',
    });
    if (response.ok) {
      const data = await response.json();
      const raw = Array.isArray(data) ? data : data?.items ?? [];
      backendItems = raw;
    }
  } catch {
    // Backend offline, fallback to local database
  }

  try {
    const localDoctors = await listRadiologistDoctorsServer();
    const map = new Map<string, any>();

    for (const d of localDoctors) {
      const id = d.id || `doc-${d.userId}`;
      map.set(d.userId, {
        id,
        userId: d.userId,
        fullName: d.fullName || 'پزشک رادیولوژیست',
        email: d.email || '',
        specialty: d.specialty || 'متخصص رادیولوژی و تله‌ریپورت',
        subSpecialty: d.subSpecialty || null,
        licenseNumber: d.licenseNumber || null,
        workplace: d.workplace || 'مرکز تله‌رادیولوژی رادینت',
        experienceYears: d.experienceYears ?? 5,
        maxDailyReports: d.maxDailyReports ?? 20,
        tariff: d.tariff ?? 950000,
        isActive: d.isActive !== false,
        collaborationStatus: d.collaborationStatus || 'approved',
        biography: d.biography || '',
        education: d.education || '',
        certifications: d.certifications || '',
        languages: d.languages || 'فارسی',
        avatarUrl: d.avatarUrl || null,
        createdAt: d.createdAt || new Date().toISOString(),
        updatedAt: d.updatedAt || new Date().toISOString(),
        user: d.user || {
          id: d.userId,
          role: 'radiologist',
          status: 'active',
          country: 'IR',
        },
        stats: d.stats || {
          totalReports: 0,
          signedReports: 0,
          completedReports: 0,
          avgResponseHours: null,
        },
      });
    }

    for (const d of backendItems) {
      const uid = d.userId || d.user?.id || d.id;
      if (uid && !map.has(uid)) {
        map.set(uid, {
          id: d.id || `doc-${uid}`,
          userId: uid,
          fullName: d.fullName || d.user?.fullName || d.email || 'پزشک رادیولوژیست',
          email: d.email || d.user?.email || '',
          specialty: d.specialty || d.doctorProfile?.specialty || 'متخصص رادیولوژی و تله‌ریپورت',
          subSpecialty: d.subSpecialty || d.doctorProfile?.subSpecialty || null,
          licenseNumber: d.licenseNumber || d.doctorProfile?.licenseNumber || null,
          workplace: d.workplace || d.doctorProfile?.workplace || 'مرکز تله‌رادیولوژی رادینت',
          experienceYears: d.experienceYears ?? d.doctorProfile?.experienceYears ?? 5,
          maxDailyReports: d.maxDailyReports ?? d.doctorProfile?.maxDailyReports ?? 20,
          tariff: d.tariff ?? d.doctorProfile?.tariff ?? 950000,
          isActive: d.isActive !== false,
          collaborationStatus: d.collaborationStatus || 'approved',
          biography: d.biography || '',
          education: d.education || '',
          certifications: d.certifications || '',
          languages: d.languages || 'فارسی',
          avatarUrl: d.avatarUrl || null,
          createdAt: d.createdAt || new Date().toISOString(),
          updatedAt: d.updatedAt || new Date().toISOString(),
          user: d.user || {
            id: uid,
            role: 'radiologist',
            status: 'active',
            country: 'IR',
          },
          stats: d.stats || {
            totalReports: 0,
            signedReports: 0,
            completedReports: 0,
            avgResponseHours: null,
          },
        });
      }
    }

    let items = Array.from(map.values());

    // Apply status filter
    if (statusFilter && statusFilter !== 'all') {
      items = items.filter((doc) => {
        if (statusFilter === 'active') return doc.isActive;
        if (statusFilter === 'inactive') return !doc.isActive;
        return doc.collaborationStatus === statusFilter;
      });
    }

    // Apply search filter
    if (searchFilter) {
      items = items.filter(
        (doc) =>
          doc.fullName.toLowerCase().includes(searchFilter) ||
          doc.specialty.toLowerCase().includes(searchFilter) ||
          (doc.subSpecialty && doc.subSpecialty.toLowerCase().includes(searchFilter)) ||
          (doc.licenseNumber && doc.licenseNumber.includes(searchFilter)) ||
          doc.email.toLowerCase().includes(searchFilter) ||
          doc.workplace.toLowerCase().includes(searchFilter),
      );
    }

    const total = items.length;
    const paged = items.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      items: paged,
      total,
      page,
      limit,
      pages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (err: any) {
    return NextResponse.json(
      { items: [], total: 0, page: 1, limit: 10, pages: 1, error: err?.message || 'خطا در دریافت لیست پزشکان' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const fullName = String(body.fullName || '').trim();
    if (!fullName) {
      return NextResponse.json({ error: 'نام و نام خانوادگی پزشک الزامی است.' }, { status: 400 });
    }

    const email = String(body.email || `doc_${Date.now()}@radinet.ir`).trim().toLowerCase();
    const specialty = String(body.specialty || 'متخصص رادیولوژی و تله‌ریپورت').trim();
    const subSpecialty = body.subSpecialty ? String(body.subSpecialty).trim() : null;
    const licenseNumber = body.licenseNumber ? String(body.licenseNumber).trim() : null;
    const workplace = String(body.workplace || 'مرکز تله‌رادیولوژی رادینت').trim();
    const experienceYears = Number(body.experienceYears) || 5;
    const maxDailyReports = Number(body.maxDailyReports) || 20;
    const tariff = Number(body.tariff) || 950000;
    const isActive = body.isActive !== false;
    const collaborationStatus = body.collaborationStatus || 'approved';
    const biography = String(body.biography || '').trim();
    const education = String(body.education || '').trim();
    const certifications = String(body.certifications || '').trim();
    const languages = String(body.languages || 'فارسی').trim();

    // Try backend first if configured
    try {
      const authorization = req.headers.get('authorization');
      const response = await fetch(`${backendUrl}/admin/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authorization ? { Authorization: authorization } : {}),
        },
        body: JSON.stringify({
          fullName,
          email,
          specialty,
          subSpecialty,
          licenseNumber,
          workplace,
          experienceYears,
          maxDailyReports,
          tariff,
          isActive,
          collaborationStatus,
          biography,
          education,
          certifications,
          languages,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const doc = data?.doctor || data;
        const uid = doc?.userId || doc?.user?.id || doc?.id;
        const did = doc?.id || `doc-${uid}`;
        try {
          const dbFile = getDbPath();
          if (fs.existsSync(dbFile)) {
            const db = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
            db.users = Array.isArray(db.users) ? db.users : [];
            db.doctorProfiles = Array.isArray(db.doctorProfiles) ? db.doctorProfiles : [];

            if (!db.users.some((u: any) => u.id === uid)) {
              db.users.push({
                id: uid,
                fullName: doc.fullName || fullName,
                email: doc.email || email,
                role: 'radiologist',
                status: 'active',
                country: 'IR',
                createdAt: doc.createdAt || new Date().toISOString(),
              });
            }
            if (!db.doctorProfiles.some((p: any) => p.id === did || p.userId === uid)) {
              db.doctorProfiles.push({
                id: did,
                userId: uid,
                fullName: doc.fullName || fullName,
                email: doc.email || email,
                specialty: doc.specialty || specialty,
                subSpecialty: doc.subSpecialty || subSpecialty,
                licenseNumber: doc.licenseNumber || licenseNumber,
                workplace: doc.workplace || workplace,
                experienceYears: doc.experienceYears ?? experienceYears,
                maxDailyReports: doc.maxDailyReports ?? maxDailyReports,
                tariff: doc.tariff ?? tariff,
                isActive: doc.isActive !== false,
                collaborationStatus: doc.collaborationStatus || 'approved',
                biography: doc.biography || biography,
                education: doc.education || education,
                certifications: doc.certifications || certifications,
                languages: doc.languages || languages,
                createdAt: doc.createdAt || new Date().toISOString(),
                updatedAt: doc.updatedAt || new Date().toISOString(),
              });
            }
            fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf-8');
          }
        } catch {
          // Ignore sync failure
        }
        return NextResponse.json(data, { status: 201 });
      }
    } catch {
      // Fallback to local DB
    }

    const dbFile = getDbPath();
    if (!fs.existsSync(dbFile)) {
      return NextResponse.json({ error: 'دیتابیس سیستم در دسترس نیست.' }, { status: 500 });
    }

    const db = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
    db.users = Array.isArray(db.users) ? db.users : [];
    db.doctorProfiles = Array.isArray(db.doctorProfiles) ? db.doctorProfiles : [];

    const userId = `usr-${Date.now()}`;
    const docId = `doc-${userId}`;
    const nowIso = new Date().toISOString();

    const newUser = {
      id: userId,
      fullName,
      email,
      role: 'radiologist',
      status: 'active',
      country: 'IR',
      createdAt: nowIso,
    };

    const newProfile = {
      id: docId,
      userId,
      fullName,
      email,
      specialty,
      subSpecialty,
      licenseNumber,
      workplace,
      experienceYears,
      maxDailyReports,
      tariff,
      isActive,
      collaborationStatus,
      biography,
      education,
      certifications,
      languages,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    db.users.push(newUser);
    db.doctorProfiles.push(newProfile);
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf-8');

    const createdItem = {
      ...newProfile,
      user: newUser,
      stats: {
        totalReports: 0,
        signedReports: 0,
        completedReports: 0,
        avgResponseHours: null,
      },
    };

    return NextResponse.json({ ok: true, doctor: createdItem }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'ثبت مشخصات پزشک ناموفق بود.' }, { status: 500 });
  }
}


