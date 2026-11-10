import { NextResponse } from 'next/server';
import { getSupabaseAdmin, getAgencyId } from '@/lib/agency-server';

export async function GET(req: Request) {
  const agencyId = await getAgencyId(req);
  if (!agencyId) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from('agency_doctors').select('*').eq('agency_id', agencyId).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: 'خطا در دریافت داده' }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function POST(req: Request) {
  const agencyId = await getAgencyId(req);
  if (!agencyId) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
  const body = await req.json();
  if (!body.full_name) return NextResponse.json({ error: 'نام پزشک الزامی است' }, { status: 400 });
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from('agency_doctors').insert({
    agency_id: agencyId,
    full_name: body.full_name,
    email: body.email ?? '',
    phone: body.phone ?? '',
    specialty: body.specialty ?? '',
    sub_specialty: body.sub_specialty ?? '',
    license_number: body.license_number ?? '',
    permissions: body.permissions ?? {},
    status: body.status ?? 'active',
  }).select().single();
  if (error) return NextResponse.json({ error: 'خطا در ثبت پزشک' }, { status: 500 });
  return NextResponse.json(data);
}
