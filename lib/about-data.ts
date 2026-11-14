import { BACKEND_URL as backendUrl } from './auth-client';

export type AboutContent = {
  id: string;
  key: string;
  title: string;
  body: string;
  isActive?: boolean;
  displayOrder: number;
};

export type AboutMedia = {
  id: string;
  kind: 'team' | 'office' | string;
  title: string;
  imageUrl: string;
  displayOrder: number;
  isActive?: boolean;
};

export type Certificate = {
  id: string;
  title: string;
  imageUrl: string;
  fileUrl?: string | null;
  description?: string;
  displayOrder: number;
  isActive?: boolean;
};

export type ConsultationRequest = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
};

export type AboutData = {
  content: AboutContent[];
  team: AboutMedia[];
  office: AboutMedia[];
  certificates: Certificate[];
  contactLink?: string;
};

export async function getAboutData(): Promise<AboutData> {
  try {
    const res = await fetch(`${backendUrl}/about`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return {
        content: data.content || [],
        team: data.team || [],
        office: data.office || [],
        certificates: data.certificates || [],
        contactLink: data.contactLink || '/contact',
      };
    }
  } catch (err) {
    console.error('Error fetching about data from backend:', err);
  }
  return {
    content: [],
    team: [],
    office: [],
    certificates: [],
    contactLink: '/contact',
  };
}

export async function getAllAboutContent(): Promise<AboutContent[]> {
  const data = await getAboutData();
  return data.content;
}

export async function updateAboutContent(
  keyOrId: string,
  data: Partial<AboutContent>,
  auth?: string,
): Promise<AboutContent | null> {
  try {
    const allContent = await getAllAboutContent();
    const existing = allContent.find((c) => c.id === keyOrId || c.key === keyOrId);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: auth } : {}),
    };

    if (existing?.id) {
      const payload: Record<string, unknown> = {};
      if (data.title !== undefined) payload.title = data.title;
      if (data.body !== undefined) payload.body = data.body;
      if (data.isActive !== undefined) payload.isActive = data.isActive;
      if (data.displayOrder !== undefined) payload.displayOrder = Number(data.displayOrder);
      const res = await fetch(`${backendUrl}/about/content/${encodeURIComponent(existing.id)}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      });
      if (res.ok) return res.json();
    } else {
      const res = await fetch(`${backendUrl}/about/content`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          key: data.key || keyOrId,
          title: data.title || '',
          body: data.body || '',
          isActive: data.isActive ?? true,
          displayOrder: data.displayOrder !== undefined ? Number(data.displayOrder) : 0,
        }),
      });
      if (res.ok) return res.json();
    }
  } catch (err) {
    console.error('Error updating about content:', err);
  }
  return null;
}

export async function getAllAboutMedia(): Promise<AboutMedia[]> {
  const data = await getAboutData();
  return [...data.team, ...data.office];
}

export async function addAboutMedia(data: Partial<AboutMedia>, auth?: string): Promise<AboutMedia | null> {
  try {
    const res = await fetch(`${backendUrl}/about/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify({
        kind: data.kind || 'team',
        title: data.title || '',
        imageUrl: data.imageUrl || '',
        displayOrder: data.displayOrder !== undefined ? Number(data.displayOrder) : 0,
        isActive: data.isActive ?? true,
      }),
    });
    if (res.ok) return res.json();
  } catch (err) {
    console.error('Error adding about media:', err);
  }
  return null;
}

export async function updateAboutMedia(id: string, data: Partial<AboutMedia>, auth?: string): Promise<AboutMedia | null> {
  try {
    const res = await fetch(`${backendUrl}/about/media/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(data),
    });
    if (res.ok) return res.json();
  } catch (err) {
    console.error('Error updating about media:', err);
  }
  return null;
}

export async function deleteAboutMedia(id: string, auth?: string): Promise<boolean> {
  try {
    const res = await fetch(`${backendUrl}/about/media/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: auth ? { Authorization: auth } : {},
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getAllCertificates(): Promise<Certificate[]> {
  const data = await getAboutData();
  return data.certificates;
}

export async function addCertificate(data: Partial<Certificate>, auth?: string): Promise<Certificate | null> {
  try {
    const res = await fetch(`${backendUrl}/about/certificates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify({
        title: data.title || '',
        imageUrl: data.imageUrl || '',
        description: data.description,
        fileUrl: data.fileUrl ?? undefined,
        displayOrder: data.displayOrder !== undefined ? Number(data.displayOrder) : 0,
        isActive: data.isActive ?? true,
      }),
    });
    if (res.ok) return res.json();
  } catch (err) {
    console.error('Error adding certificate:', err);
  }
  return null;
}

export async function updateCertificate(id: string, data: Partial<Certificate>, auth?: string): Promise<Certificate | null> {
  try {
    const res = await fetch(`${backendUrl}/about/certificates/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(data),
    });
    if (res.ok) return res.json();
  } catch (err) {
    console.error('Error updating certificate:', err);
  }
  return null;
}

export async function deleteCertificate(id: string, auth?: string): Promise<boolean> {
  try {
    const res = await fetch(`${backendUrl}/about/certificates/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: auth ? { Authorization: auth } : {},
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function createConsultationRequest(data: {
  name: string;
  phone: string;
  email?: string;
  message?: string;
}): Promise<ConsultationRequest | null> {
  try {
    const res = await fetch(`${backendUrl}/consultations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) return res.json();
  } catch (err) {
    console.error('Error creating consultation request:', err);
  }
  return null;
}

export async function getAllConsultationRequests(auth?: string): Promise<ConsultationRequest[]> {
  try {
    const res = await fetch(`${backendUrl}/consultations`, {
      headers: auth ? { Authorization: auth } : {},
      cache: 'no-store',
    });
    if (res.ok) return res.json();
  } catch (err) {
    console.error('Error fetching consultation requests:', err);
  }
  return [];
}

export async function updateConsultationStatus(id: string, status: string, auth?: string): Promise<ConsultationRequest | null> {
  try {
    const res = await fetch(`${backendUrl}/consultations/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) return res.json();
  } catch (err) {
    console.error('Error updating consultation status:', err);
  }
  return null;
}

export async function deleteConsultationRequest(id: string, auth?: string): Promise<boolean> {
  try {
    const res = await fetch(`${backendUrl}/consultations/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: auth ? { Authorization: auth } : {},
    });
    return res.ok;
  } catch {
    return false;
  }
}
