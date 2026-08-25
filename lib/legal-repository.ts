import type { LegalDocument, LegalDocumentType } from '@/lib/legal-data';
import { fallbackLegalDocument } from '@/lib/legal-data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function fetchJson<T>(path: string, params?: string): Promise<T | null> {
  if (!supabaseUrl || !supabaseKey) return null;
  const url = `${supabaseUrl}/rest/v1/${path}${params ? `?${params}` : ''}`;
  const res = await fetch(url, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

export async function getLegalDocument(documentType: LegalDocumentType): Promise<LegalDocument> {
  const rows = await fetchJson<LegalDocument[]>(
    'legal_documents',
    `document_type=eq.${documentType}&is_active=eq.true&limit=1`,
  );
  if (Array.isArray(rows) && rows[0]) return rows[0];
  return { ...fallbackLegalDocument, document_type: documentType };
}

export async function recordLegalView(documentType: LegalDocumentType): Promise<void> {
  if (!supabaseUrl || !supabaseKey) return;
  await fetch(`${supabaseUrl}/rest/v1/legal_view_logs`, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      document_type: documentType,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    }),
  }).catch(() => {});
}
