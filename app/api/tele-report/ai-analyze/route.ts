import { NextRequest, NextResponse } from 'next/server';
import { runTeleReportAiAnalysisServer } from '@/lib/tele-report-storage';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await runTeleReportAiAnalysisServer({
      imagingType: body.imagingType || '',
      imagingArea: body.imagingArea || '',
      country: body.country || 'IR',
      language: body.language || 'fa',
      files: Array.isArray(body.files) ? body.files : [],
      pacsUrl: body.pacsUrl || '',
      cloudUrl: body.cloudUrl || '',
    });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در انجام تحلیل آزمایشی هوش مصنوعی' },
      { status: 400 },
    );
  }
}
