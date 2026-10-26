import fs from 'fs';
import path from 'path';
import type {
  ContactData,
  ContactMessage,
  ContactPageContent,
  ContactPhoneNumber,
  ContactResponseHour,
  ContactSupportEmail,
} from './contact-data';
import { fallbackContactData } from './contact-data';

function getDbFilePath(): string {
  const localData = path.join(process.cwd(), 'data', 'radinet_db.json');
  if (fs.existsSync(localData)) return localData;
  const frontendData = path.join(process.cwd(), 'frontend', 'data', 'radinet_db.json');
  if (fs.existsSync(frontendData)) return frontendData;
  if (fs.existsSync(path.join(process.cwd(), 'frontend'))) {
    return frontendData;
  }
  return localData;
}

const initialContactPage: ContactPageContent = {
  id: 'contact-page-1',
  hero_title: 'تماس با ما',
  hero_subtitle: 'با کارشناسان و متخصصان رادینت در ارتباط باشید',
  intro_title: 'راه‌های ارتباطی با رادینت',
  intro_body: 'تیم پشتیبانی و کارشناسان فنی رادینت همواره آماده پاسخگویی به پرسش‌ها، ارائه مشاوره تخصصی تله‌رادیولوژی و پیگیری درخواست‌های مراکز درمانی و همکاران گرامی هستند.',
  office_address: 'تهران، خیابان ولیعصر، بالاتر از میدان ونک، برج نگار، طبقه ۱۰، واحد ۴',
  latitude: 35.7575,
  longitude: 51.4106,
  map_url: null,
  response_hours: 'شنبه تا چهارشنبه ۸:۰۰ الی ۱۷:۰۰ | پنج‌شنبه‌ها ۸:۰۰ الی ۱۳:۰۰',
};

const initialPhoneNumbers: ContactPhoneNumber[] = [
  { id: 'phone-1', label: 'پشتیبانی فنی و تله‌ریپورت', phone: '۰۲۱-۸۸۸۸۱۹۲۰', is_active: true, display_order: 1 },
  { id: 'phone-2', label: 'واحد فروش و امور قراردادها', phone: '۰۲۱-۸۸۸۸۱۹۲۱', is_active: true, display_order: 2 },
  { id: 'phone-3', label: 'خط ویژه مراکز درمانی', phone: '۰۹۱۲۰۰۰۰۰۰۰', is_active: true, display_order: 3 },
];

const initialSupportEmails: ContactSupportEmail[] = [
  { id: 'email-1', label: 'پشتیبانی و تیکت‌ها', email: 'support@radinet.ir', is_active: true, display_order: 1 },
  { id: 'email-2', label: 'امور همکاری و بازرگانی', email: 'info@radinet.ir', is_active: true, display_order: 2 },
  { id: 'email-3', label: 'مدیریت تله‌رادیولوژی', email: 'telerad@radinet.ir', is_active: true, display_order: 3 },
];

const initialResponseHours: ContactResponseHour[] = [
  { id: 'hour-1', day_label: 'شنبه تا چهارشنبه', hours: '۸:۰۰ الی ۱۷:۰۰', is_active: true, display_order: 1 },
  { id: 'hour-2', day_label: 'پنج‌شنبه‌ها', hours: '۸:۰۰ الی ۱۳:۰۰', is_active: true, display_order: 2 },
  { id: 'hour-3', day_label: 'جمعه‌ها و ایام تعطیل', hours: 'پشتیبانی آنلاین تله‌ریپورت اورژانس ۲۴/۷', is_active: true, display_order: 3 },
];

const initialContactMessages: ContactMessage[] = [
  {
    id: 'msg-1',
    name: 'دکتر حمید کاظمی',
    email: 'h.kazemi@clinic-sample.ir',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    subject: 'درخواست راه‌اندازی سرویس تفسیر آنلاین سی‌تی‌اسکن',
    message: 'با سلام، مرکز تصویربرداری ما در شهرستان سمنان مایل به عقد قرارداد تله‌رادیولوژی جهت گزارش‌نویسی تصاویر CT و MRI به صورت شبانه‌روزی می‌باشد. لطفا شرایط و تعرفه‌ها را ارسال فرمایید.',
    status: 'new',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'msg-2',
    name: 'سارا معتمدی',
    email: 'sara.motamedi@yahoo.com',
    phone: '۰۹۱۹۱۱۱۴۴۵۵',
    subject: 'پیگیری جواب گزارش سونوگرافی',
    message: 'سلام خسته نباشید، کد رهگیری گزارش رادیولوژی بنده صادر شده اما فایل PDF دانلود نمی‌شود. ممنون می‌شوم راهنمایی بفرمایید.',
    status: 'answered',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

function readDb(): any {
  const filePath = getDbFilePath();
  const dir = path.dirname(filePath);
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      const initial = {
        contactPageContent: initialContactPage,
        contactPhoneNumbers: initialPhoneNumbers,
        contactSupportEmails: initialSupportEmails,
        contactResponseHours: initialResponseHours,
        contactMessages: initialContactMessages,
      };
      fs.writeFileSync(filePath, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    const db = JSON.parse(raw);
    let changed = false;

    if (!db.contactPageContent) {
      db.contactPageContent = initialContactPage;
      changed = true;
    }
    if (!db.contactPhoneNumbers || !Array.isArray(db.contactPhoneNumbers)) {
      db.contactPhoneNumbers = initialPhoneNumbers;
      changed = true;
    }
    if (!db.contactSupportEmails || !Array.isArray(db.contactSupportEmails)) {
      db.contactSupportEmails = initialSupportEmails;
      changed = true;
    }
    if (!db.contactResponseHours || !Array.isArray(db.contactResponseHours)) {
      db.contactResponseHours = initialResponseHours;
      changed = true;
    }
    if (!db.contactMessages || !Array.isArray(db.contactMessages)) {
      db.contactMessages = initialContactMessages;
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(db, null, 2), 'utf-8');
    }
    return db;
  } catch (err) {
    console.error('Error in readDb (contact-storage):', err);
    return {
      contactPageContent: initialContactPage,
      contactPhoneNumbers: initialPhoneNumbers,
      contactSupportEmails: initialSupportEmails,
      contactResponseHours: initialResponseHours,
      contactMessages: initialContactMessages,
    };
  }
}

function writeDb(db: any) {
  const filePath = getDbFilePath();
  const dir = path.dirname(filePath);
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing radinet_db.json:', err);
  }
}

// ── Public Getters ──

export async function getContactDataServer(): Promise<ContactData> {
  const db = readDb();
  const page: ContactPageContent = db.contactPageContent || initialContactPage;
  const phones: ContactPhoneNumber[] = (db.contactPhoneNumbers || initialPhoneNumbers)
    .filter((p: ContactPhoneNumber) => p.is_active)
    .sort((a: ContactPhoneNumber, b: ContactPhoneNumber) => (a.display_order ?? 0) - (b.display_order ?? 0));
  const emails: ContactSupportEmail[] = (db.contactSupportEmails || initialSupportEmails)
    .filter((e: ContactSupportEmail) => e.is_active)
    .sort((a: ContactSupportEmail, b: ContactSupportEmail) => (a.display_order ?? 0) - (b.display_order ?? 0));
  const hours: ContactResponseHour[] = (db.contactResponseHours || initialResponseHours)
    .filter((h: ContactResponseHour) => h.is_active)
    .sort((a: ContactResponseHour, b: ContactResponseHour) => (a.display_order ?? 0) - (b.display_order ?? 0));

  return {
    page,
    phones: phones.length ? phones : fallbackContactData.phones,
    emails: emails.length ? emails : fallbackContactData.emails,
    hours: hours.length ? hours : fallbackContactData.hours,
  };
}

// ── Admin Getters ──

export async function getAdminContactData() {
  const db = readDb();
  return {
    page: db.contactPageContent || initialContactPage,
    phones: (db.contactPhoneNumbers || initialPhoneNumbers).sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0)),
    emails: (db.contactSupportEmails || initialSupportEmails).sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0)),
    hours: (db.contactResponseHours || initialResponseHours).sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0)),
    messages: (db.contactMessages || initialContactMessages).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
  };
}

// ── Page Content Updates ──

export async function updateContactPageContent(data: Partial<ContactPageContent>): Promise<ContactPageContent> {
  const db = readDb();
  const current: ContactPageContent = db.contactPageContent || initialContactPage;
  const updated: ContactPageContent = {
    ...current,
    ...data,
    latitude: data.latitude !== undefined ? Number(data.latitude) : current.latitude,
    longitude: data.longitude !== undefined ? Number(data.longitude) : current.longitude,
  };
  db.contactPageContent = updated;
  writeDb(db);
  return updated;
}

// ── Phone Numbers Operations ──

export async function createPhoneNumber(item: Omit<ContactPhoneNumber, 'id'>): Promise<ContactPhoneNumber> {
  const db = readDb();
  const newPhone: ContactPhoneNumber = {
    id: `phone-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    label: item.label.trim(),
    phone: item.phone.trim(),
    is_active: item.is_active !== undefined ? item.is_active : true,
    display_order: Number(item.display_order ?? (db.contactPhoneNumbers?.length || 0) + 1),
  };
  db.contactPhoneNumbers = db.contactPhoneNumbers || [];
  db.contactPhoneNumbers.push(newPhone);
  writeDb(db);
  return newPhone;
}

export async function updatePhoneNumber(id: string, data: Partial<ContactPhoneNumber>): Promise<ContactPhoneNumber | null> {
  const db = readDb();
  const list: ContactPhoneNumber[] = db.contactPhoneNumbers || [];
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const updated = { ...list[idx], ...data };
  if (data.display_order !== undefined) updated.display_order = Number(data.display_order);
  list[idx] = updated;
  db.contactPhoneNumbers = list;
  writeDb(db);
  return updated;
}

export async function deletePhoneNumber(id: string): Promise<boolean> {
  const db = readDb();
  const initialLen = db.contactPhoneNumbers?.length || 0;
  db.contactPhoneNumbers = (db.contactPhoneNumbers || []).filter((p: any) => p.id !== id);
  if (db.contactPhoneNumbers.length !== initialLen) {
    writeDb(db);
    return true;
  }
  return false;
}

// ── Support Emails Operations ──

export async function createSupportEmail(item: Omit<ContactSupportEmail, 'id'>): Promise<ContactSupportEmail> {
  const db = readDb();
  const newEmail: ContactSupportEmail = {
    id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    label: item.label.trim(),
    email: item.email.trim(),
    is_active: item.is_active !== undefined ? item.is_active : true,
    display_order: Number(item.display_order ?? (db.contactSupportEmails?.length || 0) + 1),
  };
  db.contactSupportEmails = db.contactSupportEmails || [];
  db.contactSupportEmails.push(newEmail);
  writeDb(db);
  return newEmail;
}

export async function updateSupportEmail(id: string, data: Partial<ContactSupportEmail>): Promise<ContactSupportEmail | null> {
  const db = readDb();
  const list: ContactSupportEmail[] = db.contactSupportEmails || [];
  const idx = list.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  const updated = { ...list[idx], ...data };
  if (data.display_order !== undefined) updated.display_order = Number(data.display_order);
  list[idx] = updated;
  db.contactSupportEmails = list;
  writeDb(db);
  return updated;
}

export async function deleteSupportEmail(id: string): Promise<boolean> {
  const db = readDb();
  const initialLen = db.contactSupportEmails?.length || 0;
  db.contactSupportEmails = (db.contactSupportEmails || []).filter((e: any) => e.id !== id);
  if (db.contactSupportEmails.length !== initialLen) {
    writeDb(db);
    return true;
  }
  return false;
}

// ── Response Hours Operations ──

export async function createResponseHour(item: Omit<ContactResponseHour, 'id'>): Promise<ContactResponseHour> {
  const db = readDb();
  const newHour: ContactResponseHour = {
    id: `hour-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    day_label: item.day_label.trim(),
    hours: item.hours.trim(),
    is_active: item.is_active !== undefined ? item.is_active : true,
    display_order: Number(item.display_order ?? (db.contactResponseHours?.length || 0) + 1),
  };
  db.contactResponseHours = db.contactResponseHours || [];
  db.contactResponseHours.push(newHour);
  writeDb(db);
  return newHour;
}

export async function updateResponseHour(id: string, data: Partial<ContactResponseHour>): Promise<ContactResponseHour | null> {
  const db = readDb();
  const list: ContactResponseHour[] = db.contactResponseHours || [];
  const idx = list.findIndex((h) => h.id === id);
  if (idx === -1) return null;
  const updated = { ...list[idx], ...data };
  if (data.display_order !== undefined) updated.display_order = Number(data.display_order);
  list[idx] = updated;
  db.contactResponseHours = list;
  writeDb(db);
  return updated;
}

export async function deleteResponseHour(id: string): Promise<boolean> {
  const db = readDb();
  const initialLen = db.contactResponseHours?.length || 0;
  db.contactResponseHours = (db.contactResponseHours || []).filter((h: any) => h.id !== id);
  if (db.contactResponseHours.length !== initialLen) {
    writeDb(db);
    return true;
  }
  return false;
}

// ── Contact Messages Operations ──

export async function createContactMessage(input: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}): Promise<ContactMessage> {
  const db = readDb();
  const newMsg: ContactMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    subject: input.subject.trim(),
    message: input.message.trim(),
    status: 'new',
    created_at: new Date().toISOString(),
  };
  db.contactMessages = db.contactMessages || [];
  db.contactMessages.unshift(newMsg);
  writeDb(db);
  return newMsg;
}

export async function listContactMessages(): Promise<ContactMessage[]> {
  const db = readDb();
  return (db.contactMessages || []).sort(
    (a: ContactMessage, b: ContactMessage) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function updateContactMessageStatus(id: string, status: string): Promise<ContactMessage | null> {
  const db = readDb();
  const list: ContactMessage[] = db.contactMessages || [];
  const idx = list.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  list[idx].status = status;
  db.contactMessages = list;
  writeDb(db);
  return list[idx];
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  const db = readDb();
  const initialLen = db.contactMessages?.length || 0;
  db.contactMessages = (db.contactMessages || []).filter((m: any) => m.id !== id);
  if (db.contactMessages.length !== initialLen) {
    writeDb(db);
    return true;
  }
  return false;
}
