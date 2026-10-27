import { NextResponse } from 'next/server';
import { getPublishedLegalDocumentServer } from '@/lib/legal-storage';
import type { LegalDocumentType } from '@/lib/legal-data';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const validTypes: LegalDocumentType[] = ['terms', 'privacy', 'data_processing'];
    const documentType = validTypes.includes(type as LegalDocumentType)
      ? (type as LegalDocumentType)
      : 'terms';

    const doc = await getPublishedLegalDocumentServer(documentType);

    if (!doc || !doc.is_active) {
      return NextResponse.json(
        { error: 'این سند در حال حاضر در دسترس نیست یا در وضعیت پیش‌نویس قرار دارد.' },
        { status: 404 }
      );
    }

    return NextResponse.json(doc);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
