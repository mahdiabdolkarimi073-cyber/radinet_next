import { NextResponse } from 'next/server';
import { getSupabaseAdmin, getAgencyId } from '@/lib/agency-server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const agencyId = await getAgencyId(req);
  if (!agencyId) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from('agency_sub_centers').select('*').eq('id', params.id).eq('agency_id', agencyId).maybeSingle();
  if (error || !data) return NextResponse.json({ error: 'مرکز یافت نشد' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const agencyId = await getAgencyId(req);
  if (!agencyId) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
  const body = await req.json();
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from('agency_sub_centers').update({
    name: body.name,
    address: body.address,
    phone: body.phone,
    email: body.email,
    manager_name: body.manager_name,
    city: body.city,
    province: body.province,
    status: body.status,
    updated_at: new Date().toISOString(),
  }).eq('id', params.id).eq('agency_id', agencyId).select().single();
  if (error) return NextResponse.json({ error: 'خطا در ویرایش' }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const agencyId = await getAgencyId(req);
  if (!agencyId) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
  const sb = getSupabaseAdmin();
  const { error } = await sb.from('agency_sub_centers').delete().eq('id', params.id).eq('agency_id', agencyId);
  if (error) return NextResponse.json({ error: 'خطا در حذف' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
