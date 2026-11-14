import { NextRequest, NextResponse } from 'next/server';
import { getDoctorPatientFileServer } from '@/lib/tele-report-storage';
import { getAuthorizationHeader } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const resolved = await Promise.resolve(context.params);
    const id = decodeURIComponent(resolved.id);
    const auth = getAuthorizationHeader(req, 'doctor');
    const file = await getDoctorPatientFileServer(id, auth);
    if (!file) {
      return NextResponse.json({ message: 'پرونده بیمار یافت نشد.' }, { status: 404 });
    }
    return NextResponse.json(file);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در دریافت پرونده بیمار' },
      { status: 500 },
    );
  }
}
