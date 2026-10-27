import { NextResponse } from 'next/server';
import { updateLegalDocumentAdmin } from '@/lib/legal-storage';
import type { LegalDocumentType } from '@/lib/legal-data';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const validTypes: LegalDocumentType[] = ['terms', 'privacy', 'data_processing'];
    if (!validTypes.includes(type as LegalDocumentType)) {
      return NextResponse.json({ error: 'نوع سند حقوقی نامعتبر است.' }, { status: 400 });
    }

    const body = await request.json();
    const updated = await updateLegalDocumentAdmin(
      type as LegalDocumentType,
      body,
      body.actor || 'مدیر سیستم'
    );

    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  return PATCH(request, { params });
}
