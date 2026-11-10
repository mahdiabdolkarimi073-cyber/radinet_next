import { NextRequest, NextResponse } from 'next/server';
import { extractAdminUser } from '@/lib/server-auth';
import {
  queryMergedSystemLogs,
  runEndToEndConnectivityCheck,
} from '@/lib/auth-logger';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = extractAdminUser(req);
  if (!admin) {
    return NextResponse.json(
      { message: 'دسترسی غیرمجاز؛ فقط مدیران دارای مجوز به لاگ سیستم و احراز هویت دسترسی دارند.' },
      { status: 403 },
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const data = await queryMergedSystemLogs(
      {
        requestId: searchParams.get('requestId') || undefined,
        operation: searchParams.get('operation') || undefined,
        level: searchParams.get('level') || undefined,
        status: searchParams.get('status') || undefined,
        statusCode: searchParams.get('statusCode') || undefined,
        backendReached: searchParams.get('backendReached') || undefined,
        source: searchParams.get('source') || undefined,
        fromDate: searchParams.get('fromDate') || undefined,
        toDate: searchParams.get('toDate') || undefined,
        search: searchParams.get('search') || undefined,
        page: Number(searchParams.get('page') || 1),
        limit: Number(searchParams.get('limit') || 25),
      },
      {
        authHeader: req.headers.get('authorization'),
        incomingHost: req.headers.get('host'),
      },
    );

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      {
        message:
          err instanceof Error ? err.message : 'خطا در دریافت لاگ‌های سیستم و احراز هویت',
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const admin = extractAdminUser(req);
  if (!admin) {
    return NextResponse.json(
      { message: 'دسترسی غیرمجاز؛ فقط مدیران دارای مجوز مجاز به اجرای تست اتصال هستند.' },
      { status: 403 },
    );
  }

  try {
    const result = await runEndToEndConnectivityCheck(req.headers.get('host'));
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        message: err instanceof Error ? err.message : 'خطا در اجرای تست اتصال',
      },
      { status: 500 },
    );
  }
}
