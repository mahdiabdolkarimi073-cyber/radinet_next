import { NextResponse } from 'next/server';
import { BACKEND_URL as backendUrl } from '@/lib/auth-client';

import fs from 'fs';
import path from 'path';

function getLocalUsersDb(): any[] {
  try {
    const filePath = path.join(process.cwd(), 'data', 'radinet_db.json');
    const altPath = path.join(process.cwd(), 'frontend', 'data', 'radinet_db.json');
    const target = fs.existsSync(filePath) ? filePath : altPath;
    if (fs.existsSync(target)) {
      const parsed = JSON.parse(fs.readFileSync(target, 'utf-8'));
      return parsed.users || [];
    }
  } catch {
    // ignore
  }
  return [];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roleFilter = searchParams.get('role');
  const searchFilter = searchParams.get('search')?.toLowerCase();
  const statusFilter = searchParams.get('status');

  try {
    const authorization = req.headers.get('authorization');
    const qs = searchParams.toString();
    const response = await fetch(`${backendUrl}/admin/users${qs ? `?${qs}` : ''}`, {
      headers: authorization ? { Authorization: authorization } : {},
      cache: 'no-store',
    });
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: 200 });
    }
  } catch {
    // Backend offline, fallback to local users
  }

  try {
    let users = getLocalUsersDb().map((u: any) => ({
      id: u.id,
      fullName: u.fullName || u.email?.split('@')[0] || 'کاربر رادینت',
      email: u.email,
      role: u.role === 'doctor' ? 'radiologist' : u.role,
      status: u.status || 'active',
      country: u.country || 'IR',
      createdAt: u.createdAt || new Date().toISOString(),
      updatedAt: u.updatedAt || new Date().toISOString(),
      _count: {
        reports: u.role === 'radiologist' || u.role === 'doctor' ? 5 : 0,
        infoRequests: 0,
        shopOrders: 0,
        teleReportRequests: 0,
        tickets: 0,
      },
    }));

    if (roleFilter && roleFilter !== 'all') {
      users = users.filter((u: any) => {
        if (roleFilter === 'radiologist') {
          return u.role === 'radiologist' || u.role === 'doctor';
        }
        return u.role === roleFilter;
      });
    }

    if (statusFilter && statusFilter !== 'all') {
      users = users.filter((u: any) => u.status === statusFilter);
    }

    if (searchFilter) {
      users = users.filter((u: any) =>
        u.fullName.toLowerCase().includes(searchFilter) ||
        u.email.toLowerCase().includes(searchFilter)
      );
    }

    return NextResponse.json({
      items: users,
      total: users.length,
      page: 1,
      limit: 10,
      pages: Math.max(Math.ceil(users.length / 10), 1),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'دریافت کاربران ناموفق بود.' }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    const authorization = req.headers.get('authorization');
    const body = await req.json();

    // 1. Sync to local database
    let createdUser: any = null;
    try {
      const filePath = path.join(process.cwd(), 'data', 'radinet_db.json');
      const altPath = path.join(process.cwd(), 'frontend', 'data', 'radinet_db.json');
      const target = fs.existsSync(filePath) ? filePath : altPath;
      if (fs.existsSync(target)) {
        const parsed = JSON.parse(fs.readFileSync(target, 'utf-8'));
        parsed.users = parsed.users || [];
        const newId = `usr-${Date.now()}`;
        createdUser = {
          id: newId,
          fullName: body.fullName?.trim() || body.name?.trim() || 'کاربر جدید',
          email: body.email?.trim()?.toLowerCase() || '',
          role: body.role === 'doctor' ? 'radiologist' : body.role,
          status: body.status || 'active',
          country: body.country || 'IR',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        parsed.users.unshift(createdUser);

        if (body.role === 'radiologist' || body.role === 'doctor') {
          parsed.doctorProfiles = parsed.doctorProfiles || [];
          parsed.doctorProfiles.push({
            id: `doc-${newId}`,
            userId: newId,
            fullName: createdUser.fullName,
            email: createdUser.email,
            specialty: body.specialty?.trim() || 'متخصص رادیولوژی و تله‌ریپورت',
            subSpecialty: body.subSpecialty?.trim() || 'تله‌رادیولوژی بالینی',
            licenseNumber: body.licenseNumber?.trim() || '',
            workplace: body.workplace?.trim() || 'مرکز تله‌رادیولوژی رادینت',
            experienceYears: Number(body.experienceYears || 5),
            maxDailyReports: Number(body.maxDailyReports || 20),
            tariff: Number(body.tariff || 950000),
            isActive: true,
            collaborationStatus: 'approved',
            biography: body.biography?.trim() || '',
            education: body.education?.trim() || '',
            certifications: body.certifications?.trim() || '',
            languages: body.languages?.trim() || 'فارسی',
            createdAt: createdUser.createdAt,
            updatedAt: createdUser.updatedAt,
          });
        }
        fs.writeFileSync(target, JSON.stringify(parsed, null, 2), 'utf-8');
      }
    } catch {
      // ignore
    }

    // 2. Sync to NestJS backend if reachable
    try {
      const response = await fetch(`${backendUrl}/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authorization ? { Authorization: authorization } : {}),
        },
        body: JSON.stringify(body),
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
      }
    } catch {
      // Backend offline, fallback to local createdUser
    }

    if (createdUser) {
      return NextResponse.json(createdUser, { status: 201 });
    }
    return NextResponse.json({ error: 'ثبت کاربر ناموفق بود.' }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'خطا در ثبت کاربر' }, { status: 500 });
  }
}
