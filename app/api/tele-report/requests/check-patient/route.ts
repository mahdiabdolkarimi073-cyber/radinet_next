import { NextRequest, NextResponse } from 'next/server';
import { checkPatientExistsServer } from '@/lib/tele-report-storage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const result = await checkPatientExistsServer({
      nationalId: searchParams.get('nationalId') || undefined,
      passportNumber: searchParams.get('passportNumber') || undefined,
      phone: searchParams.get('phone') || undefined,
    });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ exists: false, error: err?.message }, { status: 200 });
  }
}
