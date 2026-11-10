import { NextResponse } from 'next/server';
import { getSupabaseAdmin, getAgencyId } from '@/lib/agency-server';

export async function GET(req: Request) {
  const agencyId = await getAgencyId(req);
  if (!agencyId) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from('agency_messages').select('*').eq('agency_id', agencyId).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: 'خطا در دریافت داده' }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function POST(req: Request) {
  const agencyId = await getAgencyId(req);
  if (!agencyId) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
  const body = await req.json();
  if (!body.subject) return NextResponse.json({ error: 'موضوع الزامی است' }, { status: 400 });
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from('agency_messages').insert({
    agency_id: agencyId,
    subject: body.subject,
    body: body.body ?? '',
    type: body.type ?? 'request',
    status: 'pending',
  }).select().single();
  if (error) return NextResponse.json({ error: 'خطا در ارسال پیام' }, { status: 500 });
  return NextResponse.json(data);
}
