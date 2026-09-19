import { NextResponse } from 'next/server';
import { getSupabaseAdmin, getAgencyId } from '@/lib/agency-server';

export async function GET(req: Request) {
  const agencyId = await getAgencyId(req);
  if (!agencyId) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from('agency_sub_centers').select('*').eq('agency_id', agencyId).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: 'خطا در دریافت داده' }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function POST(req: Request) {
  const agencyId = await getAgencyId(req);
  if (!agencyId) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
  const body = await req.json();
  if (!body.name) return NextResponse.json({ error: 'نام مرکز الزامی است' }, { status: 400 });
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from('agency_sub_centers').insert({
    agency_id: agencyId,
    name: body.name,
    address: body.address ?? '',
    phone: body.phone ?? '',
    email: body.email ?? '',
    manager_name: body.manager_name ?? '',
    city: body.city ?? '',
    province: body.province ?? '',
    status: body.status ?? 'active',
  }).select().single();
  if (error) return NextResponse.json({ error: 'خطا در ثبت مرکز' }, { status: 500 });
  return NextResponse.json(data);
}
