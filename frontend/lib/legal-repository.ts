// Client-safe legal repository (Zero Node.js / fs dependencies)
import type { LegalDocument, LegalDocumentType } from '@/lib/legal-data';
import { fallbackLegalDocument } from '@/lib/legal-data';

export async function getLegalDocument(documentType: LegalDocumentType): Promise<LegalDocument | null> {
  try {
    const res = await fetch(`/api/legal/${documentType}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.document_type) return data;
    }
  } catch (err) {
    console.error('Error fetching legal document in repository:', err);
  }
  return { ...fallbackLegalDocument, document_type: documentType };
}

export async function recordLegalView(documentType: LegalDocumentType): Promise<void> {
  try {
    await fetch('/api/legal/views', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        document_type: documentType,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      }),
    }).catch(() => {});
  } catch {
    // Silently handle
  }
}
