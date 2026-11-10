import fs from 'fs';
import path from 'path';

export type AboutContent = {
  id: string;
  key: string;
  title: string;
  body: string;
  isActive: boolean;
  displayOrder?: number;
};

export type AboutMedia = {
  id: string;
  kind: string; // 'team' | 'office'
  title: string;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
};

export type Certificate = {
  id: string;
  title: string;
  imageUrl: string;
  fileUrl?: string | null;
  description?: string;
  displayOrder: number;
  isActive: boolean;
};

export type ConsultationRequest = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  status: string; // 'new' | 'in_progress' | 'contacted' | 'completed' | 'closed'
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

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'radinet_db.json');

const initialAboutContent: AboutContent[] = [
  {
    id: 'intro',
    key: 'intro',
    title: 'درباره شرکت رادینت',
    body: 'رادینت با تکیه بر دانش تخصصی پزشکان رادیولوژیست و به‌کارگیری فناوری‌های هوشمند سلامت، مسیر دسترسی مراکز درمانی به خدمات تصویربرداری و تفسیر تشخیصی سریع را متحول ساخته است.',
    isActive: true,
    displayOrder: 0,
  },
  {
    id: 'values',
    key: 'values',
    title: 'ارزش‌های بنیادین',
    body: 'اعتماد، دقت تشخیصی حداکثری، حفظ محرمانگی پرونده سلامت بیماران، نوآوری فناورانه و همراهی ۲۴ ساعته با جامعه پزشکی.',
    isActive: true,
    displayOrder: 1,
  },
  {
    id: 'mission',
    key: 'mission',
    title: 'ماموریت شرکت',
    body: 'تسهیل و تسریع دسترسی عادلانه به خدمات تفسیر تصاویر پزشکی در سراسر کشور از طریق توسعه راهکارهای نوین تله‌رادیولوژی و هوش مصنوعی.',
    isActive: true,
    displayOrder: 2,
  },
  {
    id: 'vision',
    key: 'vision',
    title: 'چشم‌انداز شرکت',
    body: 'تبدیل شدن به بزرگ‌ترین و معتبرترین پلتفرم سلامت دیجیتال در حوزه پرتوپزشکی، تله‌ریپورت و هوش مصنوعی بالینی در منطقه خاورمیانه.',
    isActive: true,
    displayOrder: 3,
  },
  {
    id: 'contact_link',
    key: 'contact_link',
    title: 'لینک تماس با ما',
    body: '/contact',
    isActive: true,
    displayOrder: 4,
  },
];

const initialAboutMedia: AboutMedia[] = [
  {
    id: 'team-1',
    kind: 'team',
    title: 'دکتر مریم احمدی - مدیر بورد تخصصی رادیولوژی',
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'team-2',
    kind: 'team',
    title: 'دکتر علیرضا رضایی - متخصص تصویربرداری عصبی',
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'team-3',
    kind: 'team',
    title: 'مهندس سارا کریمی - مدیر ارشد فنی و تله‌رادیولوژی',
    imageUrl: 'https://images.unsplash.com/photo-1594824813583-094396ef07cf?auto=format&fit=crop&w=600&q=80',
    displayOrder: 3,
    isActive: true,
  },
  {
    id: 'office-1',
    kind: 'office',
    title: 'اتاق مانیتورینگ و تفسیر آنلاین تله‌ریپورت',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'office-2',
    kind: 'office',
    title: 'بخش مهندسی پزشکی و سرورهای ابری PACS',
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80',
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'office-3',
    kind: 'office',
    title: 'سالن جلسات و هم‌اندیشی بالینی',
    imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=600&q=80',
    displayOrder: 3,
    isActive: true,
  },
];

const initialCertificates: Certificate[] = [
  {
    id: 'cert-1',
    title: 'ISO 9001:2015',
    imageUrl: 'https://images.unsplash.com/photo-1589330694653-dad6d3240a2b?auto=format&fit=crop&w=400&q=80',
    description: 'سیستم بین‌المللی مدیریت کیفیت خدمات پزشکی و سلامت',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'cert-2',
    title: 'ISO 27001',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
    description: 'استاندارد امنیت اطلاعات و محرمانگی پرونده‌های سلامت',
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'cert-3',
    title: 'مجوز نظام پزشکی',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80',
    description: 'تأییدیه رسمی سازمان نظام پزشکی جمهوری اسلامی ایران',
    displayOrder: 3,
    isActive: true,
  },
  {
    id: 'cert-4',
    title: 'وزارت بهداشت و درمان',
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80',
    description: 'مجوز رسمی ارائه خدمات سلامت دیجیتال و تصویربرداری',
    displayOrder: 4,
    isActive: true,
  },
];

const initialConsultationRequests: ConsultationRequest[] = [
  {
    id: 'cons-1',
    name: 'دکتر علیرضا محمدی',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    email: 'mohammadi@hospital.ir',
    message: 'درخواست مشاوره جهت اتصال بخش سی‌تی‌اسکن بیمارستان به شبکه تله‌ریپورت رادینت',
    status: 'new',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'cons-2',
    name: 'مهندس حسینی',
    phone: '۰۹۱۹۸۷۶۵۴۳۲',
    email: 'hosseini@clinic.com',
    message: 'مشاوره خرید سرور PACS و ایستگاه کاری رادیولوژی',
    status: 'contacted',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

function readDb(): any {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = {
        aboutContent: initialAboutContent,
        aboutMedia: initialAboutMedia,
        certificates: initialCertificates,
        consultationRequests: initialConsultationRequests,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const db = JSON.parse(raw);

    let changed = false;
    if (!db.aboutContent) {
      db.aboutContent = initialAboutContent;
      changed = true;
    }
    if (!db.aboutMedia) {
      db.aboutMedia = initialAboutMedia;
      changed = true;
    }
    if (!db.certificates) {
      db.certificates = initialCertificates;
      changed = true;
    }
    if (!db.consultationRequests) {
      db.consultationRequests = initialConsultationRequests;
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    }
    return db;
  } catch (err) {
    console.error('Error reading radinet_db.json for about:', err);
    return {
      aboutContent: initialAboutContent,
      aboutMedia: initialAboutMedia,
      certificates: initialCertificates,
      consultationRequests: initialConsultationRequests,
    };
  }
}

function writeDb(data: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    let existing: any = {};
    if (fs.existsSync(DB_FILE)) {
      try {
        existing = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      } catch {}
    }
    const merged = { ...existing, ...data };
    fs.writeFileSync(DB_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing radinet_db.json for about:', err);
  }
}

export async function getAboutData(): Promise<AboutData> {
  const db = readDb();
  const content = (db.aboutContent as AboutContent[])
    .filter((c) => c.isActive !== false)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const allMedia = (db.aboutMedia as AboutMedia[])
    .filter((m) => m.isActive !== false)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const certificates = (db.certificates as Certificate[])
    .filter((c) => c.isActive !== false)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const contactLinkItem = content.find((c) => c.key === 'contact_link');

  return {
    content,
    team: allMedia.filter((m) => m.kind === 'team'),
    office: allMedia.filter((m) => m.kind === 'office'),
    certificates,
    contactLink: contactLinkItem?.body || '/contact',
  };
}

export async function getAllAboutContent(): Promise<AboutContent[]> {
  const db = readDb();
  return (db.aboutContent as AboutContent[]).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

export async function updateAboutContent(key: string, data: Partial<AboutContent>): Promise<AboutContent> {
  const db = readDb();
  const idx = db.aboutContent.findIndex((c: AboutContent) => c.key === key || c.id === key);
  if (idx === -1) {
    const newItem: AboutContent = {
      id: key,
      key,
      title: data.title || key,
      body: data.body || '',
      isActive: data.isActive !== undefined ? data.isActive : true,
      displayOrder: data.displayOrder ?? db.aboutContent.length,
    };
    db.aboutContent.push(newItem);
    writeDb(db);
    return newItem;
  }
  db.aboutContent[idx] = { ...db.aboutContent[idx], ...data };
  writeDb(db);
  return db.aboutContent[idx];
}

// Media Operations
export async function getAllAboutMedia(): Promise<AboutMedia[]> {
  const db = readDb();
  return (db.aboutMedia as AboutMedia[]).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

export async function addAboutMedia(data: Partial<AboutMedia>): Promise<AboutMedia> {
  const db = readDb();
  const newItem: AboutMedia = {
    id: `media-${Date.now()}`,
    kind: data.kind || 'team',
    title: data.title || '',
    imageUrl: data.imageUrl || '',
    displayOrder: data.displayOrder ?? db.aboutMedia.length + 1,
    isActive: data.isActive !== undefined ? data.isActive : true,
  };
  db.aboutMedia.push(newItem);
  writeDb(db);
  return newItem;
}

export async function updateAboutMedia(id: string, data: Partial<AboutMedia>): Promise<AboutMedia | null> {
  const db = readDb();
  const idx = db.aboutMedia.findIndex((m: AboutMedia) => m.id === id);
  if (idx === -1) return null;
  db.aboutMedia[idx] = { ...db.aboutMedia[idx], ...data };
  writeDb(db);
  return db.aboutMedia[idx];
}

export async function deleteAboutMedia(id: string): Promise<boolean> {
  const db = readDb();
  const before = db.aboutMedia.length;
  db.aboutMedia = db.aboutMedia.filter((m: AboutMedia) => m.id !== id);
  if (db.aboutMedia.length !== before) {
    writeDb(db);
    return true;
  }
  return false;
}

// Certificate Operations
export async function getAllCertificates(): Promise<Certificate[]> {
  const db = readDb();
  return (db.certificates as Certificate[]).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

export async function addCertificate(data: Partial<Certificate>): Promise<Certificate> {
  const db = readDb();
  const newItem: Certificate = {
    id: `cert-${Date.now()}`,
    title: data.title || '',
    imageUrl: data.imageUrl || '',
    fileUrl: data.fileUrl || null,
    description: data.description || '',
    displayOrder: data.displayOrder ?? db.certificates.length + 1,
    isActive: data.isActive !== undefined ? data.isActive : true,
  };
  db.certificates.push(newItem);
  writeDb(db);
  return newItem;
}

export async function updateCertificate(id: string, data: Partial<Certificate>): Promise<Certificate | null> {
  const db = readDb();
  const idx = db.certificates.findIndex((c: Certificate) => c.id === id);
  if (idx === -1) return null;
  db.certificates[idx] = { ...db.certificates[idx], ...data };
  writeDb(db);
  return db.certificates[idx];
}

export async function deleteCertificate(id: string): Promise<boolean> {
  const db = readDb();
  const before = db.certificates.length;
  db.certificates = db.certificates.filter((c: Certificate) => c.id !== id);
  if (db.certificates.length !== before) {
    writeDb(db);
    return true;
  }
  return false;
}

// Consultation Request Operations
export async function createConsultationRequest(data: {
  name: string;
  phone: string;
  email?: string;
  message?: string;
}): Promise<ConsultationRequest> {
  const db = readDb();
  const newItem: ConsultationRequest = {
    id: `cons-${Date.now()}`,
    name: data.name,
    phone: data.phone,
    email: data.email || '',
    message: data.message || '',
    status: 'new',
    createdAt: new Date().toISOString(),
  };
  if (!db.consultationRequests) db.consultationRequests = [];
  db.consultationRequests.unshift(newItem);
  writeDb(db);
  return newItem;
}

export async function getAllConsultationRequests(): Promise<ConsultationRequest[]> {
  const db = readDb();
  return (db.consultationRequests as ConsultationRequest[]) || [];
}

export async function updateConsultationStatus(id: string, status: string): Promise<ConsultationRequest | null> {
  const db = readDb();
  const idx = db.consultationRequests.findIndex((c: ConsultationRequest) => c.id === id);
  if (idx === -1) return null;
  db.consultationRequests[idx].status = status;
  db.consultationRequests[idx].updatedAt = new Date().toISOString();
  writeDb(db);
  return db.consultationRequests[idx];
}

export async function deleteConsultationRequest(id: string): Promise<boolean> {
  const db = readDb();
  const before = db.consultationRequests?.length || 0;
  db.consultationRequests = db.consultationRequests.filter((c: ConsultationRequest) => c.id !== id);
  if (db.consultationRequests.length !== before) {
    writeDb(db);
    return true;
  }
  return false;
}
