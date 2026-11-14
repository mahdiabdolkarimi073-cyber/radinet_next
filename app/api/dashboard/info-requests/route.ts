import { NextRequest, NextResponse } from 'next/server';
import { extractDoctorUser, getAuthorizationHeader } from '@/lib/server-auth';
import {
  createDoctorInfoRequestServer,
  listDoctorInfoRequestsServer,
} from '@/lib/tele-report-storage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const doctor = extractDoctorUser(req);
  if (!doctor) {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
  }

  try {
    const auth = getAuthorizationHeader(req, 'doctor');
    const { searchParams } = new URL(req.url);
    const data = await listDoctorInfoRequestsServer(
      {
        doctorUserId: doctor.userId,
        status: searchParams.get('status') || undefined,
        search: searchParams.get('search') || undefined,
        page: Number(searchParams.get('page') || 1),
        limit: Number(searchParams.get('limit') || 10),
      },
      auth,
    );

    const mappedItems = (data.items || []).map((item) => ({
      ...item,
      title: item.title || item.subject || '',
      body: item.body || item.message || '',
      respondedAt: item.respondedAt || (item.response ? item.updatedAt : null),
      request: item.request
        ? {
            id: item.request.id,
            requestNumber: item.request.requestNumber,
            patientFirstName: item.request.patientFirstName,
            patientLastName: item.request.patientLastName,
            imagingType: item.request.imagingType,
            imagingArea: item.request.imagingArea,
          }
        : null,
    }));

    return NextResponse.json({
      items: mappedItems,
      total: data.total,
      page: data.page,
      limit: data.limit,
      pages: data.pages,
      statusLabels: {
        open: 'باز',
        answered: 'پاسخ داده شده',
        closed: 'بسته شده',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'خطا در دریافت درخواست‌های اطلاعات تکمیلی' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const doctor = extractDoctorUser(req);
  if (!doctor) {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
  }

  try {
    const auth = getAuthorizationHeader(req, 'doctor');
    const body = await req.json();
    const created = await createDoctorInfoRequestServer(
      {
        requestId: String(body?.requestId || '').trim(),
        authorId: doctor.userId,
        authorName: doctor.fullName || 'پزشک رادیولوژیست',
        subject: String(body?.title || body?.subject || 'درخواست اطلاعات تکمیلی بالینی').trim(),
        message: String(body?.body || body?.message || '').trim(),
      },
      auth,
    );
    return NextResponse.json(
      {
        ...created,
        title: created.title || created.subject || '',
        body: created.body || created.message || '',
      },
      { status: 201 },
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'خطا در ثبت درخواست اطلاعات تکمیلی' },
      { status: 400 },
    );
  }
}
