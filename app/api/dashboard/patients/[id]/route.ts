import { NextRequest, NextResponse } from 'next/server';
import { getDoctorPatientFileServer } from '@/lib/tele-report-storage';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  context: { params: { id: string } },
) {
  try {
    const id = decodeURIComponent(context.params.id);
    const file = await getDoctorPatientFileServer(id);
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
