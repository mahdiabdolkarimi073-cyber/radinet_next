import { NextResponse } from 'next/server';
import { getSupabaseAdmin, getAgencyId } from '@/lib/agency-server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const agencyId = await getAgencyId(req);
  if (!agencyId) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from('agency_doctors').select('*').eq('id', params.id).eq('agency_id', agencyId).maybeSingle();
  if (error || !data) return NextResponse.json({ error: 'پزشک یافت نشد' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const agencyId = await getAgencyId(req);
  if (!agencyId) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
  const body = await req.json();
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from('agency_doctors').update({
    full_name: body.full_name,
    email: body.email,
    phone: body.phone,
    specialty: body.specialty,
    sub_specialty: body.sub_specialty,
    license_number: body.license_number,
    permissions: body.permissions,
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
  const { error } = await sb.from('agency_doctors').delete().eq('id', params.id).eq('agency_id', agencyId);
  if (error) return NextResponse.json({ error: 'خطا در حذف' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
