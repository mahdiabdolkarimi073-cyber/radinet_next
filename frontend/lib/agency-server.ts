import { createClient } from '@supabase/supabase-js';
import { getMe } from '@/lib/auth-client';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

export function getSupabaseAdmin() {
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

export async function getAgencyId(req: Request): Promise<string | null> {
  const auth = req.headers.get('authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null;
  if (!token) return null;
  const user = await getMe(token);
  if (!user || user.role !== 'RADIANT_AGENCY') return null;
  return user.id;
}
