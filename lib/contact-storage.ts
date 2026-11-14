import { BACKEND_URL as backendUrl } from './auth-client';
import type {
  ContactData,
  ContactMessage,
  ContactPageContent,
  ContactPhoneNumber,
  ContactResponseHour,
  ContactSupportEmail,
} from './contact-data';
import { fallbackContactData } from './contact-data';

function mapPage(page: any): ContactPageContent {
  return {
    id: page?.id || 'contact-page',
    hero_title: page?.heroTitle || fallbackContactData.page?.hero_title || 'تماس با ما',
    hero_subtitle: page?.heroSubtitle || fallbackContactData.page?.hero_subtitle || '',
    intro_title: page?.introTitle || fallbackContactData.page?.intro_title || '',
    intro_body: page?.introBody || fallbackContactData.page?.intro_body || '',
    office_address: page?.officeAddress || fallbackContactData.page?.office_address || '',
    latitude: page?.latitude !== null && page?.latitude !== undefined ? Number(page.latitude) : 35.7575,
    longitude: page?.longitude !== null && page?.longitude !== undefined ? Number(page.longitude) : 51.4106,
    map_url: page?.mapUrl || null,
    response_hours: page?.responseHours || fallbackContactData.page?.response_hours || '',
  };
}

function mapPhone(p: any): ContactPhoneNumber {
  return {
    id: p.id,
    label: p.label,
    phone: p.phone,
    is_active: p.isActive !== false,
    display_order: Number(p.displayOrder ?? 0),
  };
}

function mapEmail(e: any): ContactSupportEmail {
  return {
    id: e.id,
    label: e.label,
    email: e.email,
    is_active: e.isActive !== false,
    display_order: Number(e.displayOrder ?? 0),
  };
}

function mapHour(h: any): ContactResponseHour {
  return {
    id: h.id,
    day_label: h.dayLabel,
    hours: h.hours,
    is_active: h.isActive !== false,
    display_order: Number(h.displayOrder ?? 0),
  };
}

function mapMessage(m: any): ContactMessage {
  return {
    id: m.id,
    name: m.name,
    email: m.email,
    phone: m.phone,
    subject: m.subject,
    message: m.message,
    status: m.status,
    created_at: m.createdAt,
  };
}

export async function getContactDataServer(): Promise<ContactData> {
  try {
    const res = await fetch(`${backendUrl}/contact`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const phones = Array.isArray(data.phones) ? data.phones.map(mapPhone) : [];
      const emails = Array.isArray(data.emails) ? data.emails.map(mapEmail) : [];
      const hours = Array.isArray(data.hours) ? data.hours.map(mapHour) : [];

      return {
        page: mapPage(data.page),
        phones,
        emails,
        hours,
      };
    }
  } catch (err) {
    console.error('Error fetching contact data from backend:', err);
  }
  return fallbackContactData;
}

export async function getAdminContactData(auth?: string): Promise<ContactData & { messages: ContactMessage[] }> {
  const [contact, messages] = await Promise.all([
    getContactDataServer(),
    listContactMessages(auth),
  ]);
  return {
    ...contact,
    messages,
  };
}

export async function updateContactPage(
  data: Partial<ContactPageContent>,
  auth?: string,
): Promise<ContactPageContent | null> {
  try {
    const payload: Record<string, unknown> = {};
    if (data.hero_title !== undefined) payload.heroTitle = data.hero_title;
    if (data.hero_subtitle !== undefined) payload.heroSubtitle = data.hero_subtitle;
    if (data.intro_title !== undefined) payload.introTitle = data.intro_title;
    if (data.intro_body !== undefined) payload.introBody = data.intro_body;
    if (data.office_address !== undefined) payload.officeAddress = data.office_address;
    if (data.latitude !== undefined && data.latitude !== null) payload.latitude = Number(data.latitude);
    if (data.longitude !== undefined && data.longitude !== null) payload.longitude = Number(data.longitude);
    if (data.map_url !== undefined && data.map_url !== null) payload.mapUrl = data.map_url;
    if (data.response_hours !== undefined) payload.responseHours = data.response_hours;

    const res = await fetch(`${backendUrl}/contact/page`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return mapPage(await res.json());
    }
  } catch (err) {
    console.error('Error updating contact page in backend:', err);
  }
  return null;
}

export const updateContactPageContent = updateContactPage;

export async function addPhoneNumber(
  data: Partial<ContactPhoneNumber>,
  auth?: string,
): Promise<ContactPhoneNumber | null> {
  try {
    const res = await fetch(`${backendUrl}/contact/phones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify({
        label: data.label,
        phone: data.phone,
        isActive: data.is_active ?? true,
        displayOrder: Number(data.display_order ?? 0),
      }),
    });
    if (res.ok) {
      return mapPhone(await res.json());
    }
  } catch (err) {
    console.error('Error adding phone number:', err);
  }
  return null;
}

export const createPhoneNumber = addPhoneNumber;

export async function updatePhoneNumber(
  id: string,
  data: Partial<ContactPhoneNumber>,
  auth?: string,
): Promise<ContactPhoneNumber | null> {
  try {
    const payload: Record<string, unknown> = {};
    if (data.label !== undefined) payload.label = data.label;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.is_active !== undefined) payload.isActive = data.is_active;
    if (data.display_order !== undefined) payload.displayOrder = Number(data.display_order);

    const res = await fetch(`${backendUrl}/contact/phones/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return mapPhone(await res.json());
    }
  } catch (err) {
    console.error('Error updating phone number:', err);
  }
  return null;
}

export async function deletePhoneNumber(id: string, auth?: string): Promise<boolean> {
  try {
    const res = await fetch(`${backendUrl}/contact/phones/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: auth ? { Authorization: auth } : {},
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function addSupportEmail(
  data: Partial<ContactSupportEmail>,
  auth?: string,
): Promise<ContactSupportEmail | null> {
  try {
    const res = await fetch(`${backendUrl}/contact/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify({
        label: data.label,
        email: data.email,
        isActive: data.is_active ?? true,
        displayOrder: Number(data.display_order ?? 0),
      }),
    });
    if (res.ok) {
      return mapEmail(await res.json());
    }
  } catch (err) {
    console.error('Error adding email:', err);
  }
  return null;
}

export const createSupportEmail = addSupportEmail;

export async function updateSupportEmail(
  id: string,
  data: Partial<ContactSupportEmail>,
  auth?: string,
): Promise<ContactSupportEmail | null> {
  try {
    const payload: Record<string, unknown> = {};
    if (data.label !== undefined) payload.label = data.label;
    if (data.email !== undefined) payload.email = data.email;
    if (data.is_active !== undefined) payload.isActive = data.is_active;
    if (data.display_order !== undefined) payload.displayOrder = Number(data.display_order);

    const res = await fetch(`${backendUrl}/contact/emails/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return mapEmail(await res.json());
    }
  } catch (err) {
    console.error('Error updating email:', err);
  }
  return null;
}

export async function deleteSupportEmail(id: string, auth?: string): Promise<boolean> {
  try {
    const res = await fetch(`${backendUrl}/contact/emails/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: auth ? { Authorization: auth } : {},
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function addResponseHour(
  data: Partial<ContactResponseHour>,
  auth?: string,
): Promise<ContactResponseHour | null> {
  try {
    const res = await fetch(`${backendUrl}/contact/hours`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify({
        dayLabel: data.day_label,
        hours: data.hours,
        isActive: data.is_active ?? true,
        displayOrder: Number(data.display_order ?? 0),
      }),
    });
    if (res.ok) {
      return mapHour(await res.json());
    }
  } catch (err) {
    console.error('Error adding response hour:', err);
  }
  return null;
}

export const createResponseHour = addResponseHour;

export async function updateResponseHour(
  id: string,
  data: Partial<ContactResponseHour>,
  auth?: string,
): Promise<ContactResponseHour | null> {
  try {
    const payload: Record<string, unknown> = {};
    if (data.day_label !== undefined) payload.dayLabel = data.day_label;
    if (data.hours !== undefined) payload.hours = data.hours;
    if (data.is_active !== undefined) payload.isActive = data.is_active;
    if (data.display_order !== undefined) payload.displayOrder = Number(data.display_order);

    const res = await fetch(`${backendUrl}/contact/hours/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return mapHour(await res.json());
    }
  } catch (err) {
    console.error('Error updating response hour:', err);
  }
  return null;
}

export async function deleteResponseHour(id: string, auth?: string): Promise<boolean> {
  try {
    const res = await fetch(`${backendUrl}/contact/hours/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: auth ? { Authorization: auth } : {},
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function createContactMessage(input: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}): Promise<ContactMessage | null> {
  try {
    const res = await fetch(`${backendUrl}/contact/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (res.ok) {
      return mapMessage(await res.json());
    }
  } catch (err) {
    console.error('Error submitting contact message to backend:', err);
  }
  return null;
}

export async function listContactMessages(auth?: string): Promise<ContactMessage[]> {
  try {
    const res = await fetch(`${backendUrl}/contact/messages`, {
      headers: auth ? { Authorization: auth } : {},
      cache: 'no-store',
    });
    if (res.ok) {
      const list = await res.json();
      return (list || []).map(mapMessage);
    }
  } catch (err) {
    console.error('Error listing contact messages:', err);
  }
  return [];
}

export async function updateContactMessageStatus(
  id: string,
  status: string,
  auth?: string,
): Promise<ContactMessage | null> {
  try {
    const res = await fetch(`${backendUrl}/contact/messages/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      return mapMessage(await res.json());
    }
  } catch (err) {
    console.error('Error updating contact message status:', err);
  }
  return null;
}

export async function deleteContactMessage(id: string, auth?: string): Promise<boolean> {
  try {
    const res = await fetch(`${backendUrl}/contact/messages/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: auth ? { Authorization: auth } : {},
    });
    return res.ok;
  } catch {
    return false;
  }
}
