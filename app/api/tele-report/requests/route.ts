import { NextRequest, NextResponse } from 'next/server';
import { createTeleReportRequestServer } from '@/lib/tele-report-storage';
import { extractRequestUser } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = extractRequestUser(req);
    const contentType = req.headers.get('content-type') || '';

    let payload: any = {};
    let attachments: Array<{ originalName: string; mimeType: string; size: number }> = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        if (key === 'files' && typeof value === 'object' && 'name' in value) {
          const fileObj = value as File;
          attachments.push({
            originalName: fileObj.name || 'image.dcm',
            mimeType: fileObj.type || 'application/octet-stream',
            size: fileObj.size || 0,
          });
        } else if (typeof value === 'string') {
          payload[key] = value;
        }
      });

      if (typeof payload.aiAnalysisResult === 'string' && payload.aiAnalysisResult.trim()) {
        try {
          payload.aiAnalysisResult = JSON.parse(payload.aiAnalysisResult);
        } catch {
          payload.aiAnalysisResult = null;
        }
      }
    } else {
      payload = await req.json();
      if (Array.isArray(payload.attachments)) {
        attachments = payload.attachments;
      }
    }

    const created = await createTeleReportRequestServer({
      userId: user?.userId || payload.userId || null,
      country: payload.country || 'IR',
      language: payload.language || 'fa',
      patientFirstName: payload.patientFirstName || '',
      patientLastName: payload.patientLastName || '',
      nationalId: payload.nationalId || null,
      passportNumber: payload.passportNumber || null,
      phone: payload.phone || '',
      city: payload.city || '',
      age: payload.age !== undefined && payload.age !== '' ? Number(payload.age) : null,
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
      attachments,
    });

    // Also forward to backend if available
    try {
      const { BACKEND_URL } = await import('@/lib/auth-client');
      const authHeader = req.headers.get('authorization');
      await fetch(`${BACKEND_URL}/tele-report/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify({
          ...payload,
          requestNumber: created.requestNumber,
          id: created.id,
        }),
      });
    } catch {
      // Backend optional
    }

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'ثبت درخواست تله‌ریپورت ناموفق بود.' },
      { status: 400 },
    );
  }
}
