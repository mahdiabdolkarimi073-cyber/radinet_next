import { NextResponse } from 'next/server';
import { getSupabaseAdmin, getAgencyId } from '@/lib/agency-server';

export async function GET(req: Request) {
  const agencyId = await getAgencyId(req);
  if (!agencyId) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from('agency_orders').select('*').eq('agency_id', agencyId).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: 'خطا در دریافت داده' }, { status: 500 });
  return NextResponse.json({ items: data });
}
