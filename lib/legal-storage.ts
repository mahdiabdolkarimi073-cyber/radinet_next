import { BACKEND_URL as backendUrl } from './auth-client';
import type {
  LegalChangeLog,
  LegalDocument,
  LegalDocumentType,
  LegalDocumentVersion,
} from './legal-data';

function mapLegalDoc(doc: any): LegalDocument {
  return {
    id: doc.id,
    document_type: doc.documentType as LegalDocumentType,
    title: doc.title,
    content: doc.content,
    version_number: Number(doc.versionNumber ?? 1),
    effective_date: doc.effectiveDate || doc.createdAt || new Date().toISOString(),
    is_active: doc.isActive !== false,
    scheduled_publish_date: doc.scheduledPublishDate || null,
    last_updated: doc.lastUpdated || doc.updatedAt || doc.createdAt || new Date().toISOString(),
    created_at: doc.createdAt || new Date().toISOString(),
  };
}

export async function getLegalDocumentServer(type: LegalDocumentType): Promise<LegalDocument | null> {
  try {
    const res = await fetch(`${backendUrl}/legal/${encodeURIComponent(type)}`, { cache: 'no-store' });
    if (res.ok) {
      const doc = await res.json();
      if (!doc) return null;
      return mapLegalDoc(doc);
    }
  } catch (err) {
    console.error('Error fetching legal document from backend:', err);
  }
  return null;
}

export const getPublishedLegalDocumentServer = getLegalDocumentServer;

export async function getAllLegalDocumentsServer(): Promise<LegalDocument[]> {
  try {
    const res = await fetch(`${backendUrl}/legal`, { cache: 'no-store' });
    if (res.ok) {
      const list = await res.json();
      return (Array.isArray(list) ? list : []).map(mapLegalDoc);
    }
  } catch (err) {
    console.error('Error fetching all legal documents:', err);
  }
  return [];
}

export const getAllPublishedLegalDocumentsServer = getAllLegalDocumentsServer;

export async function getLegalDocumentVersionsServer(type: LegalDocumentType): Promise<LegalDocumentVersion[]> {
  try {
    const res = await fetch(`${backendUrl}/legal/versions/${encodeURIComponent(type)}`, { cache: 'no-store' });
    if (res.ok) {
      const list = await res.json();
      return (Array.isArray(list) ? list : []).map((v: any) => ({
        id: v.id,
        document_id: v.documentId,
        document_type: v.documentType,
        title: v.title,
        content: v.content,
        version_number: Number(v.versionNumber ?? 1),
        effective_date: v.effectiveDate,
        archived_at: v.archivedAt,
      }));
    }
  } catch (err) {
    console.error('Error fetching legal document versions:', err);
  }
  return [];
}

export async function getLegalChangeLogsServer(): Promise<LegalChangeLog[]> {
  try {
    const res = await fetch(`${backendUrl}/legal/logs/changes`, { cache: 'no-store' });
    if (res.ok) {
      const list = await res.json();
      return (Array.isArray(list) ? list : []).map((l: any) => ({
        id: l.id,
        document_id: l.documentId || null,
        document_type: (l.documentType as LegalDocumentType) || null,
        actor: l.actor,
        action: l.action,
        summary: l.summary || null,
        created_at: l.createdAt,
      }));
    }
  } catch (err) {
    console.error('Error fetching legal change logs:', err);
  }
  return [];
}

export async function getAllLegalDocumentsAdmin(auth?: string): Promise<{
  documents: LegalDocument[];
  versions: LegalDocumentVersion[];
  changeLogs: LegalChangeLog[];
}> {
  const types: LegalDocumentType[] = ['terms', 'privacy', 'data_processing'];
  const [documents, changeLogs, ...versionLists] = await Promise.all([
    getAllLegalDocumentsServer(),
    getLegalChangeLogsServer(),
    ...types.map((t) => getLegalDocumentVersionsServer(t)),
  ]);

  const versions = versionLists.flat().sort((a, b) => {
    return new Date(b.archived_at).getTime() - new Date(a.archived_at).getTime();
  });

  return { documents, versions, changeLogs };
}

export async function saveLegalDocumentServer(
  input: {
    document_type: LegalDocumentType;
    title: string;
    content: string;
    version_number?: number;
    effective_date?: string;
    is_active?: boolean;
    scheduled_publish_date?: string | null;
    change_summary?: string;
  },
  auth?: string,
): Promise<LegalDocument | null> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: auth } : {}),
    };
    const res = await fetch(`${backendUrl}/legal`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        documentType: input.document_type,
        title: input.title,
        content: input.content,
        versionNumber: input.version_number,
        effectiveDate: input.effective_date || undefined,
        isActive: input.is_active,
        scheduledPublishDate: input.scheduled_publish_date || undefined,
      }),
    });
    if (res.ok) {
      return mapLegalDoc(await res.json());
    }
  } catch (err) {
    console.error('Error saving legal document in backend:', err);
  }
  return null;
}

export async function updateLegalDocumentAdmin(
  type: LegalDocumentType,
  input: {
    title?: string;
    content?: string;
    version_number?: number;
    effective_date?: string;
    is_active?: boolean;
    scheduled_publish_date?: string | null;
    bump_version?: boolean;
    change_summary?: string;
  },
  _actor = 'مدیر سیستم',
  auth?: string,
): Promise<LegalDocument | null> {
  try {
    const existing = await getLegalDocumentServer(type);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: auth } : {}),
    };

    const nextVersion = input.bump_version
      ? (existing?.version_number || 1) + 1
      : (input.version_number ?? existing?.version_number ?? 1);

    if (existing?.id) {
      const payload: Record<string, unknown> = {
        versionNumber: nextVersion,
      };
      if (input.title !== undefined) payload.title = input.title;
      if (input.content !== undefined) payload.content = input.content;
      if (input.effective_date) payload.effectiveDate = input.effective_date;
      if (input.is_active !== undefined) payload.isActive = input.is_active;
      if (input.scheduled_publish_date) payload.scheduledPublishDate = input.scheduled_publish_date;

      const res = await fetch(`${backendUrl}/legal/${encodeURIComponent(existing.id)}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return mapLegalDoc(await res.json());
      }
    }

    return saveLegalDocumentServer(
      {
        document_type: type,
        title: input.title || '',
        content: input.content || '',
        version_number: nextVersion,
        effective_date: input.effective_date,
        is_active: input.is_active ?? true,
        scheduled_publish_date: input.scheduled_publish_date,
        change_summary: input.change_summary,
      },
      auth,
    );
  } catch (err) {
    console.error('Error updating legal document admin:', err);
    return null;
  }
}

export async function recordLegalConsentServer(input: {
  user_identifier: string;
  document_type: LegalDocumentType;
  document_version: number;
  ip_address?: string;
  user_agent?: string;
}): Promise<boolean> {
  try {
    const res = await fetch(`${backendUrl}/legal/consents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userIdentifier: input.user_identifier,
        documentType: input.document_type,
        documentVersion: input.document_version,
        ipAddress: input.ip_address,
        userAgent: input.user_agent,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function recordLegalViewLogServer(_input: {
  viewer_identifier?: string;
  document_type: LegalDocumentType;
  ip_address?: string;
  user_agent?: string;
}): Promise<boolean> {
  return true;
}
