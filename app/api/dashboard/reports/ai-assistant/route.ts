import { NextRequest, NextResponse } from 'next/server';
import { doctorReportAiAssistantService } from '@/lib/doctor-report-ai-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await doctorReportAiAssistantService.getIntegrationStatus();
    return NextResponse.json(status);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در دریافت وضعیت دستیار هوش مصنوعی پزشک' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await doctorReportAiAssistantService.requestAssist({
      reportId: body.reportId || '',
      requestId: body.requestId || '',
      imagingType: body.imagingType || '',
      imagingArea: body.imagingArea || '',
      clinicalHistory: body.clinicalHistory,
      symptoms: body.symptoms,
      currentFindings: body.currentFindings,
    });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در فراخوانی سرویس دستیار هوش مصنوعی' },
      { status: 400 },
    );
  }
}
