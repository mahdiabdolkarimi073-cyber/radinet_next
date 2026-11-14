import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/auth-client';
import { createTeleReportRequestServer } from '@/lib/tele-report-storage';
import { extractRequestUser, extractTokenFromRequest } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

function generateRequestNumber(): string {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TR-${y}${m}${d}-${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    const user = extractRequestUser(req);
    const token = extractTokenFromRequest(req);
    const authHeader = token ? `Bearer ${token}` : undefined;
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const outgoing = new FormData();
      let hasRequestNumber = false;
      let hasUserId = false;

      formData.forEach((value, key) => {
        if (key === 'requestNumber' && typeof value === 'string' && value.trim()) {
          hasRequestNumber = true;
        }
        if (key === 'userId' && typeof value === 'string' && value.trim()) {
          hasUserId = true;
        }
        if (key === 'age' && typeof value === 'string') {
          const normalizedAge = value
            .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
            .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
            .trim();
          outgoing.append(key, normalizedAge);
          return;
        }
        outgoing.append(key, value);
      });

      if (!hasRequestNumber) {
        outgoing.append('requestNumber', generateRequestNumber());
      }
      if (!hasUserId && user?.userId) {
        outgoing.append('userId', user.userId);
      }

      const res = await fetch(`${BACKEND_URL}/tele-report/requests`, {
        method: 'POST',
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: outgoing,
        cache: 'no-store',
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = Array.isArray(data?.message) ? data.message.join('، ') : data?.message;
        return NextResponse.json(
          { message: msg || 'ثبت درخواست تله‌ریپورت در دیتابیس ناموفق بود.' },
          { status: res.status || 400 },
        );
      }

      return NextResponse.json(data, { status: 201 });
    }

    const payload = await req.json();
    const created = await createTeleReportRequestServer(
      {
        userId: user?.userId || payload.userId || null,
        country: payload.country || 'IR',
        language: payload.language || 'fa',
        patientFirstName: payload.patientFirstName || '',
        patientLastName: payload.patientLastName || '',
        nationalId: payload.nationalId || null,
        passportNumber: payload.passportNumber || null,
        phone: payload.phone || '',
        city: payload.city || '',
        age: payload.age ?? null,
        gender: payload.gender || '',
        clinicalHistory: payload.clinicalHistory || '',
        symptoms: payload.symptoms || '',
        imagingType: payload.imagingType || '',
        imagingArea: payload.imagingArea || '',
        studyDate: payload.studyDate || null,
        pacsUrl: payload.pacsUrl || null,
        cloudUrl: payload.cloudUrl || null,
        idempotencyKey: payload.idempotencyKey || null,
        aiAnalysisResult: payload.aiAnalysisResult || null,
        aiConfirmedAt: payload.aiConfirmedAt || null,
        attachments: Array.isArray(payload.attachments) ? payload.attachments : [],
      },
      authHeader,
    );

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'ثبت درخواست تله‌ریپورت ناموفق بود.' },
      { status: 400 },
    );
  }
}
