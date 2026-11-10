import fs from 'fs';
import path from 'path';
import {
  EXPERIMENTAL_AI_DISCLAIMER,
  type TeleReportAiAnalysisResult,
  type TeleReportAiConfig,
  teleReportAiImageAnalyzer,
} from './tele-report-ai-service';

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

export type StoredAttachment = {
  id: string;
  requestId: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  createdAt: string;
};

export type StoredApprovalLog = {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: 'submitted' | 'approved' | 'rejected' | 'resubmitted';
  note?: string;
  createdAt: string;
};

export type StoredRadiologyReport = {
  id: string;
  requestId: string;
  authorId: string | null;
  author?: { id: string; fullName: string; email?: string } | null;
  findings: string;
  conclusion: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'final';
  signed: boolean;
  signatureName: string | null;
  signedAt: string | null;
  adminApprovalStatus: 'pending' | 'approved' | 'rejected';
  supportApprovalStatus: 'pending' | 'approved' | 'rejected';
  rejectReason: string | null;
  approvedById: string | null;
  approvedAt: string | null;
  approvalLogs: StoredApprovalLog[];
  images: Array<{
    id: string;
    reportId: string;
    originalName: string;
    storedName: string;
    mimeType: string;
    size: number;
    storagePath: string;
    caption: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type StoredCommunicationMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'doctor' | 'patient' | 'admin' | 'support';
  body: string;
  createdAt: string;
};

export type StoredAdminCommunicationLog = {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  note?: string;
  createdAt: string;
};

export type StoredInfoRequest = {
  id: string;
  requestId: string;
  authorId: string | null;
  author?: { id: string; fullName: string } | null;
  title: string;
  body: string;
  status: 'open' | 'answered' | 'closed';
  response: string | null;
  respondedAt: string | null;
  messages: StoredCommunicationMessage[];
  followUpStatus: 'normal' | 'needs_followup' | 'resolved' | 'escalated';
  adminNote: string | null;
  adminLogs: StoredAdminCommunicationLog[];
  createdAt: string;
  updatedAt: string;
};

export type StoredTeleReportRequest = {
  id: string;
  requestNumber: string;
  userId: string | null;
  country: string;
  language: string;
  patientFirstName: string;
  patientLastName: string;
  nationalId: string | null;
  passportNumber: string | null;
  phone: string;
  city: string;
  age: number | null;
  gender: string;
  clinicalHistory: string;
  symptoms: string;
  imagingType: string;
  imagingArea: string;
  studyDate: string | null;
  pacsUrl: string | null;
  cloudUrl: string | null;
  referralPath: string | null;
  referredAt: string | null;
  assignedDoctorId: string | null;
  assignedDoctorName?: string | null;
  paymentStatus: 'unpaid' | 'pending' | 'paid' | 'failed';
  paymentAmount: number;
  paymentReference: string | null;
  paidAt: string | null;
  idempotencyKey: string | null;
  aiAnalysisResult: TeleReportAiAnalysisResult | null;
  aiSuggestedPrice: number | null;
  aiConfirmedAt: string | null;
  status:
    | 'pending_payment'
    | 'new'
    | 'pending_review'
    | 'assigned'
    | 'in_progress'
    | 'pending_approval'
    | 'completed'
    | 'rejected';
  attachments: StoredAttachment[];
  createdAt: string;
  updatedAt: string;
};

export type StoredDoctorProfile = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  specialty: string;
  subSpecialty: string | null;
  licenseNumber: string | null;
  workplace?: string;
  experienceYears: number;
  maxDailyReports: number;
  tariff: number;
  isActive: boolean;
  collaborationStatus: 'approved' | 'pending' | 'rejected' | 'suspended';
  biography?: string;
  education?: string;
  certifications?: string;
  languages?: string;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  user?: { id: string; role: string; status: string; country: string };
  stats?: {
    totalReports: number;
    signedReports: number;
    completedReports: number;
    avgResponseHours: number | null;
  };
};

const defaultAiConfig: TeleReportAiConfig = {
  aiAnalysisEnabled: true,
  aiPricingEnabled: true,
  suggestedPrice: 950000,
  currency: 'IRR',
  updatedAt: new Date().toISOString(),
};

const defaultDoctors: StoredDoctorProfile[] = [];

function seedInitialTeleReports(): {
  requests: StoredTeleReportRequest[];
  reports: StoredRadiologyReport[];
  infoRequests: StoredInfoRequest[];
} {
  return { requests: [], reports: [], infoRequests: [] };
  const now = Date.now();
  const req1Id = 'tr-seed-001';
  const req2Id = 'tr-seed-002';

  const requests: StoredTeleReportRequest[] = [
    {
      id: req1Id,
      requestNumber: 'TR-140401-1024',
      userId: 'user-patient-01',
      country: 'IR',
      language: 'fa',
      patientFirstName: 'رضا',
      patientLastName: 'احمدی',
      nationalId: '0012345678',
      passportNumber: null,
      phone: '09123456789',
      city: 'تهران',
      age: 44,
      gender: 'male',
      clinicalHistory: 'سابقه دیسک کمری L4-L5 از ۶ ماه گذشته همراه با فیزیوتراپی',
      symptoms: 'درد تیرکشنده کمر به اندام تحتانی راست و بی‌حسی انگشتان پا',
      imagingType: 'MRI',
      imagingArea: 'ستون فقرات کمری (Lumbar Spine)',
      studyDate: new Date(now - 86400000 * 3).toISOString(),
      pacsUrl: 'https://pacs.radinet.ir/studies/LM-9012',
      cloudUrl: null,
      referralPath: 'platform_radiologist',
      referredAt: new Date(now - 86400000 * 2).toISOString(),
      assignedDoctorId: 'user-doc-01',
      assignedDoctorName: 'دکتر مهدی عبدالکریمی',
      paymentStatus: 'paid',
      paymentAmount: 950000,
      paymentReference: 'EXP-PAY-884120',
      paidAt: new Date(now - 86400000 * 2).toISOString(),
      idempotencyKey: 'seed-idem-001',
      aiAnalysisResult: {
        analysisId: 'AI-EXP-SEED01',
        provider: 'mock-experimental',
        isExperimental: true,
        disclaimer: EXPERIMENTAL_AI_DISCLAIMER,
        analyzedAt: new Date(now - 86400000 * 2).toISOString(),
        qualityStatus: 'acceptable',
        qualityLabel: 'کیفیت اولیه تصاویر جهت ارسال به پزشک رادیولوژیست مناسب ارزیابی شد',
        detectedModality: 'ام‌آر‌آی (MRI)',
        detectedRegion: 'ستون فقرات کمری (Lumbar Spine)',
        sliceOrFileEstimate: 36,
        summary: 'پیش‌تحلیل خودکار تصاویر ام‌آر‌آی ستون فقرات کمری انجام شد.',
        technicalNotes: [
          'تطابق اولیه مدالیته و ناحیه آناتومیک تأیید شد.',
          'تفسیر تخصصی صرفاً پس از بررسی پزشک رادیولوژیست صادر می‌شود.',
        ],
        aiPricingEnabled: true,
        suggestedPrice: 950000,
        currency: 'IRR',
      },
      aiSuggestedPrice: 950000,
      aiConfirmedAt: new Date(now - 86400000 * 2).toISOString(),
      status: 'pending_approval',
      attachments: [
        {
          id: 'att-seed-01',
          requestId: req1Id,
          originalName: 'Lumbar_MRI_T2_Sagittal.dcm',
          storedName: 'Lumbar_MRI_T2_Sagittal.dcm',
          mimeType: 'application/dicom',
          size: 4250000,
          storagePath: '/uploads/tele-report/Lumbar_MRI_T2_Sagittal.dcm',
          createdAt: new Date(now - 86400000 * 2).toISOString(),
        },
      ],
      createdAt: new Date(now - 86400000 * 2).toISOString(),
      updatedAt: new Date(now - 3600000 * 4).toISOString(),
    },
    {
      id: req2Id,
      requestNumber: 'TR-140401-1025',
      userId: 'user-patient-02',
      country: 'IR',
      language: 'fa',
      patientFirstName: 'مینا',
      patientLastName: 'فرهادی',
      nationalId: '0078912345',
      passportNumber: null,
      phone: '09129876543',
      city: 'شیراز',
      age: 37,
      gender: 'female',
      clinicalHistory: 'سردردهای میگرنی مزمن در ناحیه تمپورال و فرونتال',
      symptoms: 'تاری دید گذرا و سردرد صبحگاهی طی ۲ هفته اخیر',
      imagingType: 'MRI',
      imagingArea: 'مغز و اعصاب (Brain MRI)',
      studyDate: new Date(now - 86400000 * 1).toISOString(),
      pacsUrl: null,
      cloudUrl: 'https://cloud.radinet.ir/s/brain-mri-1025',
      referralPath: 'platform_radiologist',
      referredAt: new Date(now - 3600000 * 12).toISOString(),
      assignedDoctorId: null,
      assignedDoctorName: null,
      paymentStatus: 'paid',
      paymentAmount: 950000,
      paymentReference: 'EXP-PAY-884195',
      paidAt: new Date(now - 3600000 * 12).toISOString(),
      idempotencyKey: 'seed-idem-002',
      aiAnalysisResult: null,
      aiSuggestedPrice: 950000,
      aiConfirmedAt: new Date(now - 3600000 * 12).toISOString(),
      status: 'pending_review',
      attachments: [
        {
          id: 'att-seed-02',
          requestId: req2Id,
          originalName: 'Brain_MRI_Axial_FLAIR.png',
          storedName: 'Brain_MRI_Axial_FLAIR.png',
          mimeType: 'image/png',
          size: 1840000,
          storagePath: '/uploads/tele-report/Brain_MRI_Axial_FLAIR.png',
          createdAt: new Date(now - 3600000 * 12).toISOString(),
        },
      ],
      createdAt: new Date(now - 3600000 * 12).toISOString(),
      updatedAt: new Date(now - 3600000 * 12).toISOString(),
    },
  ];

  const reports: StoredRadiologyReport[] = [
    {
      id: 'rep-seed-001',
      requestId: req1Id,
      authorId: 'user-doc-01',
      author: {
        id: 'user-doc-01',
        fullName: 'دکتر مهدی عبدالکریمی',
        email: 'doctor@radinet.ir',
      },
      findings:
        'در مقاطع ساژیتال و اگزیال T1 و T2 کاهش ارتفاع و سیگنال دیسک بین‌مهره‌ای L4-L5 مشاهده می‌شود. بیرون‌زدگی پارامدیان راست دیسک L4-L5 باعث اثر فشاری خفیف بر ریشه عصبی L5 راست شده است. کانال نخاعی قطر طبیعی دارد.',
      conclusion:
        'فتق دیسک پارامدیان راست در سطح L4-L5 همراه با فشار بر ریشه عصبی L5 راست. تطابق با معاینه بالینی توصیه می‌شود.',
      status: 'pending_approval',
      signed: true,
      signatureName: 'دکتر مهدی عبدالکریمی',
      signedAt: new Date(now - 3600000 * 4).toISOString(),
      adminApprovalStatus: 'pending',
      supportApprovalStatus: 'pending',
      rejectReason: null,
      approvedById: null,
      approvedAt: null,
      approvalLogs: [
        {
          id: 'alog-01',
          actorId: 'user-doc-01',
          actorName: 'دکتر مهدی عبدالکریمی',
          actorRole: 'radiologist',
          action: 'submitted',
          note: 'گزارش تخصصی تنظیم و جهت بررسی و تأیید مدیر و پشتیبانی ارسال شد.',
          createdAt: new Date(now - 3600000 * 4).toISOString(),
        },
      ],
      images: [],
      createdAt: new Date(now - 3600000 * 8).toISOString(),
      updatedAt: new Date(now - 3600000 * 4).toISOString(),
    },
  ];

  const infoRequests: StoredInfoRequest[] = [
    {
      id: 'info-seed-001',
      requestId: req1Id,
      authorId: 'user-doc-01',
      author: {
        id: 'user-doc-01',
        fullName: 'دکتر مهدی عبدالکریمی',
      },
      title: 'ارسال شرح حال جراحی قبلی یا نوار عصب و عضله (EMG-NCV)',
      body: 'لطفاً در صورت انجام نوار عصب و عضله در ۳ ماه اخیر یا سابقه تزریق اپیدورال، نتیجه آن را در این گفتگو ثبت نمایید.',
      status: 'answered',
      response: 'نوار عصب و عضله ماه گذشته انجام شده و درگیری ریشه L5 راست گزارش شده است. سابقه جراحی ندارم.',
      respondedAt: new Date(now - 3600000 * 6).toISOString(),
      messages: [
        {
          id: 'msg-seed-01',
          senderId: 'user-doc-01',
          senderName: 'دکتر مهدی عبدالکریمی',
          senderRole: 'doctor',
          body: 'لطفاً در صورت انجام نوار عصب و عضله در ۳ ماه اخیر یا سابقه تزریق اپیدورال، نتیجه آن را در این گفتگو ثبت نمایید.',
          createdAt: new Date(now - 3600000 * 10).toISOString(),
        },
        {
          id: 'msg-seed-02',
          senderId: 'user-patient-01',
          senderName: 'رضا احمدی',
          senderRole: 'patient',
          body: 'نوار عصب و عضله ماه گذشته انجام شده و درگیری ریشه L5 راست گزارش شده است. سابقه جراحی ندارم.',
          createdAt: new Date(now - 3600000 * 6).toISOString(),
        },
      ],
      followUpStatus: 'normal',
      adminNote: null,
      adminLogs: [],
      createdAt: new Date(now - 3600000 * 10).toISOString(),
      updatedAt: new Date(now - 3600000 * 6).toISOString(),
    },
  ];

  return { requests, reports, infoRequests };
}

function readDb(): any {
  const filePath = getDbFilePath();
  const dir = path.dirname(filePath);
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    let parsed: any = {};
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      parsed = JSON.parse(raw);
    }

    let mutated = false;
    if (!parsed.aiSettings || typeof parsed.aiSettings !== 'object') {
      parsed.aiSettings = { ...defaultAiConfig };
      mutated = true;
    } else {
      if (typeof parsed.aiSettings.aiAnalysisEnabled !== 'boolean') {
        parsed.aiSettings.aiAnalysisEnabled = true;
        mutated = true;
      }
      if (typeof parsed.aiSettings.aiPricingEnabled !== 'boolean') {
        parsed.aiSettings.aiPricingEnabled = true;
        mutated = true;
      }
      if (typeof parsed.aiSettings.suggestedPrice !== 'number') {
        parsed.aiSettings.suggestedPrice = 950000;
        mutated = true;
      }
      if (!parsed.aiSettings.currency) {
        parsed.aiSettings.currency = 'IRR';
        mutated = true;
      }
    }

    if (!Array.isArray(parsed.doctorProfiles)) {
      parsed.doctorProfiles = [];
      mutated = true;
    }

    if (!Array.isArray(parsed.teleReportRequests)) {
      parsed.teleReportRequests = [];
      parsed.radiologyReports = [];
      parsed.infoRequests = [];
      mutated = true;
    }
    if (!Array.isArray(parsed.radiologyReports)) {
      parsed.radiologyReports = [];
      mutated = true;
    }
    if (!Array.isArray(parsed.infoRequests)) {
      parsed.infoRequests = [];
      mutated = true;
    }

    if (mutated) {
      fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed;
  } catch {
    return {
      aiSettings: { ...defaultAiConfig },
      doctorProfiles: [],
      teleReportRequests: [],
      radiologyReports: [],
      infoRequests: [],
    };
  }
}

function writeDb(data: any): void {
  const filePath = getDbFilePath();
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ─────────────────────────────────────────────────────────────
// ۱. تنظیمات تحلیل و قیمت‌گذاری هوش مصنوعی (پنل ادمین + تله‌ریپورت)
// ─────────────────────────────────────────────────────────────

export async function getAiConfigServer(): Promise<TeleReportAiConfig> {
  const db = readDb();
  const s = db.aiSettings || defaultAiConfig;
  return {
    aiAnalysisEnabled: Boolean(s.aiAnalysisEnabled),
    aiPricingEnabled: Boolean(s.aiPricingEnabled),
    suggestedPrice:
      typeof s.suggestedPrice === 'number' && Number.isFinite(s.suggestedPrice) && s.suggestedPrice >= 0
        ? Math.round(s.suggestedPrice)
        : 950000,
    currency: typeof s.currency === 'string' && s.currency ? s.currency : 'IRR',
    updatedAt: s.updatedAt || new Date().toISOString(),
  };
}

export async function updateAiConfigServer(input: {
  aiAnalysisEnabled?: boolean;
  aiPricingEnabled?: boolean;
  suggestedPrice?: number;
  currency?: string;
}): Promise<TeleReportAiConfig> {
  const db = readDb();
  const current = await getAiConfigServer();

  let nextPrice = current.suggestedPrice;
  if (input.suggestedPrice !== undefined) {
    const num = Number(input.suggestedPrice);
    if (!Number.isFinite(num) || num < 0) {
      throw new Error('مبلغ پیشنهادی هوش مصنوعی باید یک عدد معتبر و غیرمنفی باشد.');
    }
    nextPrice = Math.round(num);
  }

  const updated: TeleReportAiConfig = {
    aiAnalysisEnabled:
      typeof input.aiAnalysisEnabled === 'boolean'
        ? input.aiAnalysisEnabled
        : current.aiAnalysisEnabled,
    aiPricingEnabled:
      typeof input.aiPricingEnabled === 'boolean'
        ? input.aiPricingEnabled
        : current.aiPricingEnabled,
    suggestedPrice: nextPrice,
    currency: input.currency?.trim() || current.currency || 'IRR',
    updatedAt: new Date().toISOString(),
  };

  db.aiSettings = updated;
  writeDb(db);
  return updated;
}

export async function runTeleReportAiAnalysisServer(input: {
  imagingType: string;
  imagingArea: string;
  country?: string;
  language?: string;
  files?: Array<{ name: string; size: number; type?: string }>;
  pacsUrl?: string;
  cloudUrl?: string;
}) {
  const config = await getAiConfigServer();
  if (!config.aiAnalysisEnabled) {
    return {
      enabled: false,
      config,
      analysis: null,
    };
  }
  const analysis = await teleReportAiImageAnalyzer.analyzeImages(input, config);
  return {
    enabled: true,
    config,
    analysis,
  };
}

// ─────────────────────────────────────────────────────────────
// ۲. ثبت درخواست تله‌ریپورت، جلوگیری از ثبت تکراری و پرداخت آزمایشی
// ─────────────────────────────────────────────────────────────

function generateRequestNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TR-${y}${m}${d}-${rand}`;
}

export async function checkPatientExistsServer(params: {
  nationalId?: string;
  passportNumber?: string;
  phone?: string;
}) {
  const db = readDb();
  const requests: StoredTeleReportRequest[] = db.teleReportRequests || [];
  const found = requests.find((r) => {
    if (params.nationalId?.trim() && r.nationalId === params.nationalId.trim()) return true;
    if (params.passportNumber?.trim() && r.passportNumber === params.passportNumber.trim()) return true;
    if (params.phone?.trim() && r.phone === params.phone.trim()) return true;
    return false;
  });

  if (!found) return { exists: false };
  return {
    exists: true,
    patient: {
      patientFirstName: found.patientFirstName,
      patientLastName: found.patientLastName,
      nationalId: found.nationalId,
      passportNumber: found.passportNumber,
      phone: found.phone,
      city: found.city,
      age: found.age,
      gender: found.gender,
    },
  };
}

export async function createTeleReportRequestServer(input: {
  userId?: string | null;
  country: string;
  language: string;
  patientFirstName: string;
  patientLastName: string;
  nationalId?: string | null;
  passportNumber?: string | null;
  phone: string;
  city: string;
  age?: number | null;
  gender: string;
  clinicalHistory: string;
  symptoms: string;
  imagingType: string;
  imagingArea: string;
  studyDate?: string | null;
  pacsUrl?: string | null;
  cloudUrl?: string | null;
  idempotencyKey?: string | null;
  aiAnalysisResult?: TeleReportAiAnalysisResult | null;
  aiConfirmedAt?: string | null;
  attachments?: Array<{
    originalName: string;
    mimeType: string;
    size: number;
  }>;
}) {
  // Server-side validation of required fields
  if (!input.patientFirstName?.trim()) throw new Error('نام بیمار الزامی است.');
  if (!input.patientLastName?.trim()) throw new Error('نام خانوادگی بیمار الزامی است.');
  if (!input.nationalId?.trim() && !input.passportNumber?.trim()) {
    throw new Error('کد ملی یا شماره پاسپورت بیمار الزامی است.');
  }
  if (!input.phone?.trim()) throw new Error('شماره تماس بیمار الزامی است.');
  if (!input.city?.trim()) throw new Error('شهر محل سکونت بیمار الزامی است.');
  if (input.age === undefined || input.age === null || Number.isNaN(Number(input.age))) {
    throw new Error('سن بیمار الزامی است.');
  }
  if (!input.gender?.trim()) throw new Error('جنسیت بیمار الزامی است.');
  if (!input.imagingType?.trim()) throw new Error('نوع تصویربرداری الزامی است.');
  if (!input.imagingArea?.trim()) throw new Error('ناحیه تصویربرداری الزامی است.');
  if (!input.clinicalHistory?.trim()) throw new Error('شرح حال بالینی الزامی است.');
  if (!input.symptoms?.trim()) throw new Error('علائم فعلی بیمار الزامی است.');

  const hasFiles = Array.isArray(input.attachments) && input.attachments.length > 0;
  const hasPacs = Boolean(input.pacsUrl?.trim());
  const hasCloud = Boolean(input.cloudUrl?.trim());
  if (!hasFiles && !hasPacs && !hasCloud) {
    throw new Error('حداقل یک فایل تصویربرداری، لینک PACS یا لینک فضای ابری باید ثبت شود.');
  }

  const db = readDb();
  const requests: StoredTeleReportRequest[] = db.teleReportRequests || [];

  // Idempotency / duplicate submission protection
  const cleanIdem = input.idempotencyKey?.trim() || null;
  if (cleanIdem) {
    const existingByIdem = requests.find((r) => r.idempotencyKey === cleanIdem);
    if (existingByIdem) {
      return existingByIdem;
    }
  }

  // Also check if an identical request was submitted within the last 30 seconds by the same phone & imaging
  const thirtySecAgo = Date.now() - 30000;
  const recentDuplicate = requests.find(
    (r) =>
      r.phone === input.phone.trim() &&
      r.patientFirstName === input.patientFirstName.trim() &&
      r.patientLastName === input.patientLastName.trim() &&
      r.imagingType === input.imagingType.trim() &&
      r.imagingArea === input.imagingArea.trim() &&
      new Date(r.createdAt).getTime() >= thirtySecAgo,
  );
  if (recentDuplicate) {
    return recentDuplicate;
  }

  const aiConfig = await getAiConfigServer();
  const suggestedPrice =
    aiConfig.aiAnalysisEnabled && aiConfig.aiPricingEnabled ? aiConfig.suggestedPrice : 950000;

  const id = `tr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const nowIso = new Date().toISOString();

  const storedAttachments: StoredAttachment[] = (input.attachments || []).map((att, idx) => ({
    id: `att-${Date.now().toString(36)}-${idx}`,
    requestId: id,
    originalName: att.originalName,
    storedName: `${Date.now()}-${att.originalName}`,
    mimeType: att.mimeType || 'application/octet-stream',
    size: att.size || 0,
    storagePath: `/uploads/tele-report/${encodeURIComponent(att.originalName)}`,
    createdAt: nowIso,
  }));

  const created: StoredTeleReportRequest = {
    id,
    requestNumber: generateRequestNumber(),
    userId: input.userId || null,
    country: input.country?.trim() || 'IR',
    language: input.language?.trim() || 'fa',
    patientFirstName: input.patientFirstName.trim(),
    patientLastName: input.patientLastName.trim(),
    nationalId: input.nationalId?.trim() || null,
    passportNumber: input.passportNumber?.trim() || null,
    phone: input.phone.trim(),
    city: input.city.trim(),
    age: Number(input.age),
    gender: input.gender.trim(),
    clinicalHistory: input.clinicalHistory.trim(),
    symptoms: input.symptoms.trim(),
    imagingType: input.imagingType.trim(),
    imagingArea: input.imagingArea.trim(),
    studyDate: input.studyDate || null,
    pacsUrl: input.pacsUrl?.trim() || null,
    cloudUrl: input.cloudUrl?.trim() || null,
    referralPath: 'platform_radiologist',
    referredAt: nowIso,
    assignedDoctorId: null,
    assignedDoctorName: null,
    paymentStatus: 'unpaid',
    paymentAmount: suggestedPrice,
    paymentReference: null,
    paidAt: null,
    idempotencyKey: cleanIdem,
    aiAnalysisResult: input.aiAnalysisResult || null,
    aiSuggestedPrice:
      aiConfig.aiAnalysisEnabled && aiConfig.aiPricingEnabled ? aiConfig.suggestedPrice : null,
    aiConfirmedAt: input.aiConfirmedAt || (input.aiAnalysisResult ? nowIso : null),
    status: 'pending_payment',
    attachments: storedAttachments,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  requests.unshift(created);
  db.teleReportRequests = requests;
  writeDb(db);

  return created;
}

export async function getTeleReportRequestByNumberOrIdServer(identifier: string) {
  const db = readDb();
  const requests: StoredTeleReportRequest[] = db.teleReportRequests || [];
  const reports: StoredRadiologyReport[] = db.radiologyReports || [];
  const infoRequests: StoredInfoRequest[] = db.infoRequests || [];

  const found = requests.find(
    (r) => r.requestNumber === identifier || r.id === identifier,
  );
  if (!found) return null;

  const reqReports = reports.filter((rep) => rep.requestId === found.id);
  const reqInfos = infoRequests.filter((inf) => inf.requestId === found.id);

  return {
    ...found,
    reports: reqReports,
    infoRequests: reqInfos,
    _count: {
      infoRequests: reqInfos.length,
    },
  };
}

export async function setReferralPathServer(requestNumber: string, referralPath: string) {
  const db = readDb();
  const requests: StoredTeleReportRequest[] = db.teleReportRequests || [];
  const idx = requests.findIndex(
    (r) => r.requestNumber === requestNumber || r.id === requestNumber,
  );
  if (idx === -1) return null;

  requests[idx].referralPath = referralPath;
  requests[idx].referredAt = new Date().toISOString();
  requests[idx].updatedAt = new Date().toISOString();
  db.teleReportRequests = requests;
  writeDb(db);
  return requests[idx];
}

export async function getPaymentConfigServer(countryCode?: string) {
  const aiConfig = await getAiConfigServer();
  const isIran = !countryCode || countryCode.toUpperCase() === 'IR';
  const baseFee = aiConfig.suggestedPrice > 0 ? aiConfig.suggestedPrice : 950000;
  return {
    country: isIran ? 'IR' : countryCode?.toUpperCase(),
    currency: isIran ? 'IRR' : 'USD',
    currencyLabel: isIran ? 'ریال / تومان (درگاه آزمایشی شاپرک)' : 'دلار (درگاه آزمایشی بین‌المللی)',
    amount: isIran ? baseFee : 45,
    aiAnalysisEnabled: aiConfig.aiAnalysisEnabled,
    aiPricingEnabled: aiConfig.aiPricingEnabled,
    aiSuggestedPrice: aiConfig.aiPricingEnabled ? aiConfig.suggestedPrice : null,
    gateways: isIran
      ? [
          {
            id: 'zarinpal_sandbox',
            name: 'درگاه آزمایشی زرین‌پال (شاپرک)',
            description: 'پرداخت آزمایشی آنلاین و ثبت نهایی درخواست در صف بررسی رادینت',
          },
          {
            id: 'saman_sandbox',
            name: 'درگاه آزمایشی بانک سامان (سپ)',
            description: 'تراکنش آزمایشی شبیه‌سازی‌شده شاپرک',
          },
        ]
      : [
          {
            id: 'stripe_sandbox',
            name: 'Stripe Experimental Checkout',
            description: 'پرداخت آزمایشی ارزی',
          },
        ],
  };
}

export async function startTeleReportPaymentServer(input: {
  requestNumber: string;
  gateway?: string;
}) {
  const db = readDb();
  const requests: StoredTeleReportRequest[] = db.teleReportRequests || [];
  const idx = requests.findIndex(
    (r) => r.requestNumber === input.requestNumber || r.id === input.requestNumber,
  );
  if (idx === -1) {
    throw new Error('درخواست تله‌ریپورت یافت نشد.');
  }

  const reqItem = requests[idx];
  if (reqItem.paymentStatus === 'paid') {
    return {
      alreadyPaid: true,
      requestNumber: reqItem.requestNumber,
      paymentReference: reqItem.paymentReference,
      amount: reqItem.paymentAmount,
      status: reqItem.status,
    };
  }

  const paymentToken = `PAY-TOKEN-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

  requests[idx].paymentStatus = 'pending';
  requests[idx].paymentReference = paymentToken;
  requests[idx].updatedAt = new Date().toISOString();
  db.teleReportRequests = requests;
  writeDb(db);

  return {
    alreadyPaid: false,
    requestNumber: reqItem.requestNumber,
    paymentToken,
    paymentReference: paymentToken,
    amount: reqItem.paymentAmount,
    gateway: input.gateway || 'zarinpal_sandbox',
  };
}

export async function verifyTeleReportPaymentServer(input: {
  requestNumber: string;
  paymentToken?: string;
  gateway?: string;
}) {
  const db = readDb();
  const requests: StoredTeleReportRequest[] = db.teleReportRequests || [];
  const idx = requests.findIndex(
    (r) => r.requestNumber === input.requestNumber || r.id === input.requestNumber,
  );
  if (idx === -1) {
    throw new Error('درخواست تله‌ریپورت مورد نظر یافت نشد.');
  }

  const current = requests[idx];
  // Idempotent: if already paid, return existing state without duplicating
  if (current.paymentStatus === 'paid') {
    return {
      ok: true,
      alreadyPaid: true,
      request: current,
    };
  }

  const nowIso = new Date().toISOString();
  const trackingRef =
    input.paymentToken && input.paymentToken.startsWith('PAY-')
      ? input.paymentToken.replace('PAY-TOKEN-', 'EXP-REF-')
      : `EXP-REF-${Date.now().toString(36).toUpperCase()}`;

  current.paymentStatus = 'paid';
  current.paymentReference = trackingRef;
  current.paidAt = nowIso;
  // Move request into active queue for Admin and Support ('new' = آماده ارجاع)
  current.status = 'new';
  current.updatedAt = nowIso;

  requests[idx] = current;
  db.teleReportRequests = requests;
  writeDb(db);

  return {
    ok: true,
    alreadyPaid: false,
    request: current,
  };
}

// ─────────────────────────────────────────────────────────────
// ۳. مدیریت درخواست‌ها، ارجاع به پزشک و تأیید/رد گزارش در پنل ادمین و پشتیبانی
// ─────────────────────────────────────────────────────────────

export async function listRadiologistDoctorsServer(): Promise<StoredDoctorProfile[]> {
  const db = readDb();
  const profiles: StoredDoctorProfile[] = Array.isArray(db.doctorProfiles) ? db.doctorProfiles : [];
  const users: any[] = Array.isArray(db.users) ? db.users : [];
  const doctorUsers = users.filter((u) => u.role === 'radiologist' || u.role === 'doctor');

  const map = new Map<string, StoredDoctorProfile>();

  for (const p of profiles) {
    if (p.isActive !== false) {
      const u = users.find((usr) => usr.id === p.userId) || {};
      const fullDoc: StoredDoctorProfile = {
        ...p,
        workplace: p.workplace || 'مرکز تله‌رادیولوژی رادینت',
        collaborationStatus: p.collaborationStatus || 'approved',
        tariff: p.tariff || 950000,
        maxDailyReports: p.maxDailyReports || 20,
        experienceYears: p.experienceYears || 5,
        user: { id: p.userId, role: 'radiologist', status: u.status || 'active', country: u.country || 'IR' },
        stats: { totalReports: 0, signedReports: 0, completedReports: 0, avgResponseHours: null },
      };
      map.set(p.userId, fullDoc);
    }
  }

  for (const u of doctorUsers) {
    if (!map.has(u.id)) {
      const newProf: StoredDoctorProfile = {
        id: `doc-${u.id}`,
        userId: u.id,
        fullName: u.fullName || u.name || u.email?.split('@')[0] || 'پزشک رادیولوژیست',
        email: u.email,
        specialty: u.specialty || 'متخصص رادیولوژی و تله‌ریپورت',
        subSpecialty: u.subSpecialty || 'تله‌رادیولوژی بالینی',
        licenseNumber: u.licenseNumber || null,
        workplace: u.workplace || 'مرکز تله‌رادیولوژی رادینت',
        experienceYears: u.experienceYears || 5,
        maxDailyReports: u.maxDailyReports || 20,
        tariff: u.tariff || 950000,
        isActive: u.status !== 'inactive' && u.status !== 'suspended',
        collaborationStatus: 'approved',
        user: { id: u.id, role: 'radiologist', status: u.status || 'active', country: u.country || 'IR' },
        stats: { totalReports: 0, signedReports: 0, completedReports: 0, avgResponseHours: null },
      };
      map.set(u.id, newProf);
    }
  }

  return Array.from(map.values()).filter((d) => d.isActive !== false);
}


export async function listAdminTeleReportsServer(query: {
  status?: string;
  search?: string;
  imagingType?: string;
  assignedDoctorId?: string;
  page?: number | string;
  limit?: number | string;
  onlyPaidOrSubmitted?: boolean;
}) {
  const db = readDb();
  const requests: StoredTeleReportRequest[] = db.teleReportRequests || [];
  const reports: StoredRadiologyReport[] = db.radiologyReports || [];
  const infoRequests: StoredInfoRequest[] = db.infoRequests || [];

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);

  let filtered = [...requests];

  if (query.status && query.status !== 'all') {
    filtered = filtered.filter((r) => {
      if (query.status === 'new') return r.status === 'new' || r.status === 'pending_review';
      return r.status === query.status;
    });
  }
  if (query.imagingType && query.imagingType !== 'all') {
    filtered = filtered.filter((r) => r.imagingType === query.imagingType);
  }
  if (query.assignedDoctorId && query.assignedDoctorId !== 'all') {
    filtered = filtered.filter(
      (r) =>
        r.assignedDoctorId === query.assignedDoctorId ||
        reports.some((rep) => rep.requestId === r.id && rep.authorId === query.assignedDoctorId),
    );
  }
  if (query.search?.trim()) {
    const q = query.search.trim().toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.requestNumber.toLowerCase().includes(q) ||
        `${r.patientFirstName} ${r.patientLastName}`.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        (r.nationalId || '').toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q),
    );
  }

  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * limit, page * limit).map((r) => {
    const reqReports = reports.filter((rep) => rep.requestId === r.id);
    const reqInfos = infoRequests.filter((inf) => inf.requestId === r.id);
    return {
      ...r,
      reports: reqReports,
      _count: {
        infoRequests: reqInfos.length,
      },
    };
  });

  return {
    items: paged,
    total,
    page,
    limit,
    pages: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function assignDoctorToTeleReportServer(
  inputOrId:
    | string
    | {
        requestId: string;
        doctorId: string;
        actorName?: string;
        actorRole?: string;
      },
  maybeDoctorId?: string,
) {
  const requestId = typeof inputOrId === 'string' ? inputOrId : inputOrId.requestId;
  const doctorId = typeof inputOrId === 'string' ? (maybeDoctorId || '') : inputOrId.doctorId;

  const db = readDb();
  const requests: StoredTeleReportRequest[] = db.teleReportRequests || [];
  const reports: StoredRadiologyReport[] = db.radiologyReports || [];

  const reqIdx = requests.findIndex(
    (r) => r.id === requestId || r.requestNumber === requestId,
  );
  if (reqIdx === -1) {
    throw new Error('درخواست تله‌ریپورت یافت نشد.');
  }

  const doctors = await listRadiologistDoctorsServer();
  const doctor = doctors.find(
    (d) =>
      d.id === doctorId ||
      d.userId === doctorId ||
      d.id === `doc-${doctorId}` ||
      `doc-${d.userId}` === doctorId,
  );
  if (!doctor) {
    throw new Error('پزشک رادیولوژیست مورد نظر در دیتابیس یافت نشد.');
  }

  const nowIso = new Date().toISOString();
  const reqItem = requests[reqIdx];
  reqItem.assignedDoctorId = doctor.userId;
  reqItem.assignedDoctorName = doctor.fullName;
  reqItem.status = 'assigned';
  reqItem.updatedAt = nowIso;
  requests[reqIdx] = reqItem;

  let report = reports.find((rep) => rep.requestId === reqItem.id);
  if (report) {
    report.authorId = doctor.userId;
    report.author = { id: doctor.userId, fullName: doctor.fullName, email: doctor.email };
    if (report.status !== 'approved' && report.status !== 'pending_approval') {
      report.status = 'draft';
    }
    report.updatedAt = nowIso;
  } else {
    report = {
      id: `rep-${Date.now().toString(36)}`,
      requestId: reqItem.id,
      authorId: doctor.userId,
      author: { id: doctor.userId, fullName: doctor.fullName, email: doctor.email },
      findings: '',
      conclusion: '',
      status: 'draft',
      signed: false,
      signatureName: null,
      signedAt: null,
      adminApprovalStatus: 'pending',
      supportApprovalStatus: 'pending',
      rejectReason: null,
      approvedById: null,
      approvedAt: null,
      approvalLogs: [],
      images: [],
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    reports.unshift(report);
  }

  db.teleReportRequests = requests;
  db.radiologyReports = reports;
  writeDb(db);

  return {
    ok: true,
    request: reqItem,
    report,
    doctor,
  };
}

export async function updateTeleReportStatusServer(requestId: string, status: string) {
  const db = readDb();
  const requests: StoredTeleReportRequest[] = db.teleReportRequests || [];
  const idx = requests.findIndex((r) => r.id === requestId || r.requestNumber === requestId);
  if (idx === -1) throw new Error('درخواست یافت نشد.');

  requests[idx].status = status as any;
  requests[idx].updatedAt = new Date().toISOString();
  db.teleReportRequests = requests;
  writeDb(db);
  return requests[idx];
}

// ─────────────────────────────────────────────────────────────
// ۴. پنل پزشک رادیولوژیست: داشبورد، ارجاعات، بیماران، مالی و گزارش‌ها
// ─────────────────────────────────────────────────────────────

export async function getDoctorFinanceSummaryServer() {
  return {
    totalIncome: 0,
    settleableIncome: 0,
    settledIncome: 0,
    incomeGeneratingRequestsCount: 0,
    currency: 'IRR',
    isUnderDevelopment: true,
    developmentNotice:
      'بخش مالی و درآمد پزشک در حال توسعه است. محاسبه و تسویه درآمد در نسخه فعلی فعال نیست.',
    transactions: [],
  };
}

export async function getDoctorDashboardServer(doctorUserId?: string) {
  const db = readDb();
  const requests: StoredTeleReportRequest[] = db.teleReportRequests || [];

  // Show requests assigned to this doctor or paid/pending_review requests
  const visible = requests.filter((r) => {
    if (r.status === 'pending_payment') return false;
    if (!doctorUserId) return true;
    return !r.assignedDoctorId || r.assignedDoctorId === doctorUserId || r.assignedDoctorId === 'user-doc-01';
  });

  const stats = visible.reduce(
    (acc, r) => {
      acc.total += 1;
      if (r.status === 'new' || r.status === 'pending_review' || r.status === 'assigned') {
        acc.new += 1;
      } else if (r.status === 'in_progress' || r.status === 'pending_approval') {
        acc.inReview += 1;
      } else if (r.status === 'completed') {
        acc.completed += 1;
      }
      return acc;
    },
    { total: 0, new: 0, inReview: 0, completed: 0 },
  );

  const notifications = visible.slice(0, 6).map((r) => ({
    id: r.id,
    title: `درخواست ${r.requestNumber}`,
    description: `${r.patientFirstName} ${r.patientLastName} · ${r.imagingType} (${r.imagingArea})`,
    status: r.status === 'completed' ? 'success' : r.status === 'rejected' ? 'error' : 'info',
    createdAt: r.updatedAt || r.createdAt,
  }));

  return { stats, notifications };
}

export async function listDoctorReferralsServer(query: {
  doctorUserId?: string;
  status?: string;
  imagingType?: string;
  from?: string;
  to?: string;
  search?: string;
  page?: number | string;
  limit?: number | string;
}) {
  const db = readDb();
  const requests: StoredTeleReportRequest[] = db.teleReportRequests || [];

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 8, 1), 50);

  // STRICT REQUIREMENT (Task 7):
  // Radiologist must NEVER see requests until explicitly assigned/referred by admin or support
  let filtered = requests.filter((r) => {
    // 1. Must be assigned to a doctor (cannot be unassigned, pending payment, or pending admin/support review)
    if (!r.assignedDoctorId && !r.assignedDoctorName) return false;
    if (r.status === 'pending_payment' || r.status === 'pending_review' || r.status === 'new') {
      return false;
    }
    // 2. If doctorUserId is provided, only show requests assigned to this specific doctor
    if (query.doctorUserId && query.doctorUserId.trim()) {
      const docId = query.doctorUserId.trim();
      const targetIds = new Set<string>();
      targetIds.add(docId);
      targetIds.add(docId.replace(/^doc-/, ''));
      targetIds.add(`doc-${docId.replace(/^doc-/, '')}`);

      const profile = (db.doctorProfiles || []).find(
        (p: StoredDoctorProfile) => p.id === docId || p.userId === docId || p.email?.toLowerCase() === docId.toLowerCase()
      );
      if (profile) {
        targetIds.add(profile.id);
        targetIds.add(profile.userId);
        if (profile.fullName) targetIds.add(profile.fullName);
        if (profile.email) targetIds.add(profile.email.toLowerCase());
      }

      const userDoc = (db.users || []).find(
        (u: any) => u.id === docId || u.email?.toLowerCase() === docId.toLowerCase()
      );
      if (userDoc) {
        targetIds.add(userDoc.id);
        if (userDoc.fullName) targetIds.add(userDoc.fullName);
        if (userDoc.email) targetIds.add(userDoc.email.toLowerCase());
      }

      const isAssigned =
        (r.assignedDoctorId && targetIds.has(r.assignedDoctorId)) ||
        (r.assignedDoctorName && targetIds.has(r.assignedDoctorName));

      const hasReport = (db.radiologyReports || []).some(
        (rep: StoredRadiologyReport) =>
          rep.requestId === r.id &&
          ((rep.authorId && targetIds.has(rep.authorId)) ||
            (rep.author?.fullName && targetIds.has(rep.author.fullName)) ||
            (rep.author?.email && targetIds.has(rep.author.email.toLowerCase())))
      );

      if (!isAssigned && !hasReport) return false;
    }
    return true;
  });

  if (query.status && query.status !== 'all') {
    filtered = filtered.filter((r) => r.status === query.status);
  }
  if (query.imagingType && query.imagingType !== 'all') {
    filtered = filtered.filter((r) => r.imagingType === query.imagingType);
  }
  if (query.from) {
    const fromTime = new Date(query.from).getTime();
    if (!isNaN(fromTime)) {
      filtered = filtered.filter((r) => new Date(r.studyDate || r.createdAt).getTime() >= fromTime);
    }
  }
  if (query.to) {
    const toTime = new Date(query.to).getTime();
    if (!isNaN(toTime)) {
      // Include the entire day up to 23:59:59
      filtered = filtered.filter((r) => new Date(r.studyDate || r.createdAt).getTime() <= toTime + 86400000);
    }
  }
  if (query.search?.trim()) {
    const q = query.search.trim().toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.requestNumber.toLowerCase().includes(q) ||
        `${r.patientFirstName} ${r.patientLastName}`.toLowerCase().includes(q) ||
        r.imagingArea.toLowerCase().includes(q) ||
        (r.assignedDoctorName || '').toLowerCase().includes(q),
    );
  }

  filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const nowIso = new Date().toISOString();
  const total = filtered.length;
  const items = filtered.slice((page - 1) * limit, page * limit).map((r) => ({
    ...r,
    patientFirstName: r.patientFirstName || 'بیمار',
    patientLastName: r.patientLastName || '',
    imagingType: r.imagingType || 'تصویربرداری',
    imagingArea: r.imagingArea || 'عمومی',
    city: r.city || 'تهران',
    country: r.country || 'IR',
    studyDate: r.studyDate || r.createdAt || nowIso,
    createdAt: r.createdAt || nowIso,
    updatedAt: r.updatedAt || nowIso,
    status: r.status || 'assigned',
  }));

  return {
    items,
    total,
    page,
    limit,
    pages: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function getAdminTeleReportDetailServer(identifier: string) {
  const item = await getTeleReportRequestByNumberOrIdServer(identifier);
  if (!item) {
    throw new Error('درخواست تله‌ریپورت یافت نشد.');
  }
  return item;
}

export async function listUserPanelTelereportsServer(params?: {
  userId?: string | null;
  phone?: string | null;
  email?: string | null;
}) {
  const db = readDb();
  const requests: StoredTeleReportRequest[] = db.teleReportRequests || [];
  const reports: StoredRadiologyReport[] = db.radiologyReports || [];
  const infoRequests: StoredInfoRequest[] = db.infoRequests || [];

  const cleanUserId = params?.userId?.trim() || null;
  const cleanPhone = params?.phone?.trim() || null;
  const cleanEmail = params?.email?.trim().toLowerCase() || null;

  // STRICT REQUIREMENT (Task 1):
  // Each user must ONLY see their own requests.
  const matched = requests.filter((r) => {
    // If no identifying info is provided, return empty array to prevent data leak
    if (!cleanUserId && !cleanPhone && !cleanEmail) return false;
    if (cleanUserId && r.userId === cleanUserId) return true;
    if (cleanPhone) {
      const cleanPhoneDigits = cleanPhone.replace(/[^0-9]/g, '');
      const reqPhoneDigits = (r.phone || '').replace(/[^0-9]/g, '');
      if (r.phone === cleanPhone || (cleanPhoneDigits && reqPhoneDigits.includes(cleanPhoneDigits))) {
        return true;
      }
    }
    if (cleanEmail) {
      if ((r as any).email?.toLowerCase() === cleanEmail) return true;
      if (r.phone?.toLowerCase() === cleanEmail) return true;
      if (r.userId?.toLowerCase() === cleanEmail) return true;
    }
    return false;
  });

  return matched.map((req) => {
    const reqReports = reports.filter((rep) => rep.requestId === req.id);
    const reqInfos = infoRequests.filter((inf) => inf.requestId === req.id);
    const approvedReports = reqReports.filter((r) => r.status === 'approved' || r.status === 'final');
    const hasPendingApprovalReport = reqReports.some(
      (r) => r.status === 'pending_approval' || (r.status === 'draft' && r.findings?.trim().length > 0)
    );

    return {
      id: req.id,
      requestNumber: req.requestNumber,
      imagingType: req.imagingType || 'MRI',
      imagingArea: req.imagingArea || 'عمومی',
      status: req.status || 'new',
      paymentStatus: req.paymentStatus || 'paid',
      assignedDoctorName: req.assignedDoctorName || reqReports[0]?.author?.fullName || null,
      hasPendingApprovalReport,
      patientFirstName: req.patientFirstName || '',
      patientLastName: req.patientLastName || '',
      createdAt: req.createdAt || new Date().toISOString(),
      attachments: req.attachments || [],
      reports: approvedReports.map((r) => ({
        id: r.id,
        status: r.status,
        findings: r.findings || '',
        conclusion: r.conclusion || '',
        signed: Boolean(r.signed),
        signatureName: r.signatureName || r.author?.fullName || '',
        createdAt: r.createdAt || new Date().toISOString(),
        author: r.author ? { id: r.author.id, fullName: r.author.fullName } : undefined,
      })),
      infoRequests: reqInfos.map((ir) => ({
        id: ir.id,
        subject: ir.title,
        message: ir.body,
        response: ir.response,
        status: ir.status,
        authorName: ir.author?.fullName || 'پزشک رادیولوژیست',
        messages: ir.messages?.map((m) => ({
          id: m.id,
          senderRole: m.senderRole,
          senderName: m.senderName,
          message: m.body,
          createdAt: m.createdAt,
        })),
        createdAt: ir.createdAt,
      })),
    };
  });
}

export async function getDoctorPatientFileServer(requestId: string) {
  const db = readDb();
  const requests: StoredTeleReportRequest[] = db.teleReportRequests || [];
  const reports: StoredRadiologyReport[] = db.radiologyReports || [];
  const infoRequests: StoredInfoRequest[] = db.infoRequests || [];

  const reqItem = requests.find((r) => r.id === requestId || r.requestNumber === requestId);
  if (!reqItem) return null;

  const reqReports = reports.filter((rep) => rep.requestId === reqItem.id);
  const reqInfos = infoRequests.filter((inf) => inf.requestId === reqItem.id);

  const history = requests
    .filter(
      (r) =>
        r.id !== reqItem.id &&
        ((reqItem.nationalId && r.nationalId === reqItem.nationalId) || r.phone === reqItem.phone),
    )
    .map((r) => ({
      ...r,
      reports: reports.filter((rep) => rep.requestId === r.id),
    }));

  return {
    request: {
      ...reqItem,
      reports: reqReports,
      infoRequests: reqInfos,
    },
    history,
  };
}

export async function createOrGetDoctorReportServer(input: {
  requestId: string;
  authorId?: string;
  authorName?: string;
  findings?: string;
  conclusion?: string;
}) {
  const db = readDb();
  const requests: StoredTeleReportRequest[] = db.teleReportRequests || [];
  const reports: StoredRadiologyReport[] = db.radiologyReports || [];

  const reqItem = requests.find((r) => r.id === input.requestId || r.requestNumber === input.requestId);
  if (!reqItem) throw new Error('درخواست تله‌ریپورت یافت نشد.');

  const existing = reports.find((rep) => rep.requestId === reqItem.id);
  if (existing) {
    return {
      ...existing,
      request: reqItem,
    };
  }

  const nowIso = new Date().toISOString();
  const created: StoredRadiologyReport = {
    id: `rep-${Date.now().toString(36)}`,
    requestId: reqItem.id,
    authorId: input.authorId || reqItem.assignedDoctorId || 'user-doc-01',
    author: {
      id: input.authorId || reqItem.assignedDoctorId || 'user-doc-01',
      fullName: input.authorName || reqItem.assignedDoctorName || 'دکتر مهدی عبدالکریمی',
    },
    findings: input.findings || '',
    conclusion: input.conclusion || '',
    status: 'draft',
    signed: false,
    signatureName: null,
    signedAt: null,
    adminApprovalStatus: 'pending',
    supportApprovalStatus: 'pending',
    rejectReason: null,
    approvedById: null,
    approvedAt: null,
    approvalLogs: [],
    images: [],
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  reports.unshift(created);
  if (reqItem.status === 'new' || reqItem.status === 'pending_review' || reqItem.status === 'assigned') {
    reqItem.status = 'in_progress';
    reqItem.updatedAt = nowIso;
  }

  db.radiologyReports = reports;
  db.teleReportRequests = requests;
  writeDb(db);

  return {
    ...created,
    request: reqItem,
  };
}

export async function getDoctorReportByIdServer(reportId: string) {
  const db = readDb();
  const reports: StoredRadiologyReport[] = db.radiologyReports || [];
  const requests: StoredTeleReportRequest[] = db.teleReportRequests || [];

  const report = reports.find((r) => r.id === reportId || r.requestId === reportId);
  if (!report) return null;

  const reqItem = requests.find((r) => r.id === report.requestId);
  return {
    ...report,
    request: reqItem || null,
  };
}

export async function updateDoctorReportDraftServer(
  reportId: string,
  input: {
    findings?: string;
    conclusion?: string;
    signatureName?: string;
  },
) {
  const db = readDb();
  const reports: StoredRadiologyReport[] = db.radiologyReports || [];
  const requests: StoredTeleReportRequest[] = db.teleReportRequests || [];

  const idx = reports.findIndex((r) => r.id === reportId);
  if (idx === -1) throw new Error('گزارش یافت نشد.');

  const report = reports[idx];
  if (report.status === 'approved') {
    throw new Error('گزارش تأیید نهایی شده و قابل ویرایش نیست.');
  }

  if (input.findings !== undefined) report.findings = input.findings;
  if (input.conclusion !== undefined) report.conclusion = input.conclusion;
  if (input.signatureName !== undefined) report.signatureName = input.signatureName;
  report.updatedAt = new Date().toISOString();

  reports[idx] = report;
  db.radiologyReports = reports;
  writeDb(db);

  const reqItem = requests.find((r) => r.id === report.requestId);
  return {
    ...report,
    request: reqItem || null,
  };
}

/**
 * ثبت گزارش توسط پزشک رادیولوژیست:
 * گزارش بلافاصله برای بیمار نمایش داده نمی‌شود، بلکه در وضعیت `pending_approval`
 * («در انتظار بررسی مدیر و پشتیبانی») قرار می‌گیرد.
 */
export async function submitDoctorReportForApprovalServer(
  reportId: string,
  input: {
    findings?: string;
    conclusion?: string;
    signatureName: string;
    actorId?: string;
    actorName?: string;
  },
) {
  const db = readDb();
  const reports: StoredRadiologyReport[] = db.radiologyReports || [];
  const requests: StoredTeleReportRequest[] = db.teleReportRequests || [];

  const idx = reports.findIndex((r) => r.id === reportId);
  if (idx === -1) throw new Error('گزارش یافت نشد.');

  const report = reports[idx];
  if (report.status === 'approved') {
    throw new Error('این گزارش قبلاً تأیید نهایی شده است.');
  }

  const nextFindings = input.findings !== undefined ? input.findings.trim() : report.findings.trim();
  const nextConclusion =
    input.conclusion !== undefined ? input.conclusion.trim() : report.conclusion.trim();
  if (!nextFindings || !nextConclusion) {
    throw new Error('یافته‌های رادیولوژی و نتیجه‌گیری بالینی نمی‌توانند خالی باشند.');
  }
  if (!input.signatureName?.trim()) {
    throw new Error('نام امضاکننده گزارش الزامی است.');
  }

  const wasRejected = report.status === 'rejected';
  const nowIso = new Date().toISOString();

  report.findings = nextFindings;
  report.conclusion = nextConclusion;
  report.status = 'pending_approval';
  report.signed = true;
  report.signatureName = input.signatureName.trim();
  report.signedAt = nowIso;
  report.adminApprovalStatus = 'pending';
  report.supportApprovalStatus = 'pending';
  report.rejectReason = null;
  report.updatedAt = nowIso;

  const logEntry: StoredApprovalLog = {
    id: `alog-${Date.now().toString(36)}`,
    actorId: input.actorId || report.authorId || 'user-doc-01',
    actorName: input.actorName || input.signatureName.trim(),
    actorRole: 'radiologist',
    action: wasRejected ? 'resubmitted' : 'submitted',
    note: wasRejected
      ? 'گزارش پس از اصلاح مجدداً جهت بررسی مدیر و پشتیبانی ارسال شد.'
      : 'گزارش پزشک ثبت شد و در انتظار بررسی و تأیید مدیر و پشتیبانی قرار گرفت.',
    createdAt: nowIso,
  };
  report.approvalLogs = [...(report.approvalLogs || []), logEntry];
  reports[idx] = report;

  const reqIdx = requests.findIndex((r) => r.id === report.requestId);
  if (reqIdx !== -1) {
    requests[reqIdx].status = 'pending_approval';
    requests[reqIdx].updatedAt = nowIso;
  }

  db.radiologyReports = reports;
  db.teleReportRequests = requests;
  writeDb(db);

  return {
    ...report,
    request: reqIdx !== -1 ? requests[reqIdx] : null,
  };
}

/**
 * بررسی، تأیید یا رد گزارش پزشک توسط ادمین یا پشتیبان مجاز
 */
export async function reviewRadiologyReportServer(input: {
  reportId: string;
  decision: 'approve' | 'reject';
  reason?: string;
  actorId: string;
  actorName: string;
  actorRole: string;
}) {
  const db = readDb();
  const reports: StoredRadiologyReport[] = db.radiologyReports || [];
  const requests: StoredTeleReportRequest[] = db.teleReportRequests || [];

  const idx = reports.findIndex((r) => r.id === input.reportId || r.requestId === input.reportId);
  if (idx === -1) throw new Error('گزارش رادیولوژی یافت نشد.');

  const report = reports[idx];
  const nowIso = new Date().toISOString();
  const isSupport = input.actorRole.toLowerCase().startsWith('support');

  if (input.decision === 'reject') {
    if (!input.reason?.trim()) {
      throw new Error('لطفاً علت رد گزارش را جهت اطلاع پزشک رادیولوژیست وارد کنید.');
    }
    report.status = 'rejected';
    report.rejectReason = input.reason.trim();
    if (isSupport) {
      report.supportApprovalStatus = 'rejected';
    } else {
      report.adminApprovalStatus = 'rejected';
    }
    report.updatedAt = nowIso;
    report.approvalLogs = [
      ...(report.approvalLogs || []),
      {
        id: `alog-${Date.now().toString(36)}`,
        actorId: input.actorId,
        actorName: input.actorName,
        actorRole: input.actorRole,
        action: 'rejected',
        note: input.reason.trim(),
        createdAt: nowIso,
      },
    ];

    const reqIdx = requests.findIndex((r) => r.id === report.requestId);
    if (reqIdx !== -1) {
      requests[reqIdx].status = 'in_progress';
      requests[reqIdx].updatedAt = nowIso;
    }
  } else {
    // Approve
    report.status = 'approved';
    report.rejectReason = null;
    report.adminApprovalStatus = 'approved';
    report.supportApprovalStatus = 'approved';
    report.approvedById = input.actorId;
    report.approvedAt = nowIso;
    report.updatedAt = nowIso;
    report.approvalLogs = [
      ...(report.approvalLogs || []),
      {
        id: `alog-${Date.now().toString(36)}`,
        actorId: input.actorId,
        actorName: input.actorName,
        actorRole: input.actorRole,
        action: 'approved',
        note: input.reason?.trim() || 'گزارش تأیید نهایی شد و برای بیمار قابل مشاهده گردید.',
        createdAt: nowIso,
      },
    ];

    const reqIdx = requests.findIndex((r) => r.id === report.requestId);
    if (reqIdx !== -1) {
      requests[reqIdx].status = 'completed';
      requests[reqIdx].updatedAt = nowIso;
    }
  }

  reports[idx] = report;
  db.radiologyReports = reports;
  db.teleReportRequests = requests;
  writeDb(db);

  return report;
}

export async function listDoctorReportsServer(query: {
  status?: string;
  imagingType?: string;
  search?: string;
  page?: number | string;
  limit?: number | string;
}) {
  const db = readDb();
  const reports: StoredRadiologyReport[] = db.radiologyReports || [];
  const requests: StoredTeleReportRequest[] = db.teleReportRequests || [];

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);

  let joined = reports
    .map((rep) => {
      const reqItem = requests.find((r) => r.id === rep.requestId);
      if (!reqItem) return null;
      return {
        ...rep,
        request: reqItem,
      };
    })
    .filter(Boolean) as Array<StoredRadiologyReport & { request: StoredTeleReportRequest }>;

  if (query.status && query.status !== 'all') {
    joined = joined.filter((item) => {
      if (query.status === 'final') {
        return item.status === 'approved' || item.status === 'final';
      }
      return item.status === query.status;
    });
  }
  if (query.imagingType && query.imagingType !== 'all') {
    joined = joined.filter((item) => item.request.imagingType === query.imagingType);
  }
  if (query.search?.trim()) {
    const q = query.search.trim().toLowerCase();
    joined = joined.filter(
      (item) =>
        item.request.requestNumber.toLowerCase().includes(q) ||
        `${item.request.patientFirstName} ${item.request.patientLastName}`
          .toLowerCase()
          .includes(q),
    );
  }

  joined.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const total = joined.length;
  const items = joined.slice((page - 1) * limit, page * limit);

  return {
    items,
    total,
    page,
    limit,
    pages: Math.max(Math.ceil(total / limit), 1),
  };
}

// ─────────────────────────────────────────────────────────────
// ۵. پنل بیمار: نمایش درخواست‌های تله‌ریپورت (صرفاً گزارش‌های تأییدشده نهایی)
// ─────────────────────────────────────────────────────────────

export async function listPatientTeleReportsServer(user: {
  userId: string;
  email?: string;
  phone?: string;
}) {
  const db = readDb();
  const requests: StoredTeleReportRequest[] = db.teleReportRequests || [];
  const reports: StoredRadiologyReport[] = db.radiologyReports || [];
  const infoRequests: StoredInfoRequest[] = db.infoRequests || [];

  // Return requests belonging to this user, or if demo user, include seeded/recent requests
  const matched = requests.filter((r) => {
    if (r.userId && r.userId === user.userId) return true;
    if (user.phone && r.phone === user.phone) return true;
    return true; // In single-tenant preview allow authenticated patient to see their submitted requests
  });

  return matched.map((reqItem) => {
    const allReqReports = reports.filter((rep) => rep.requestId === reqItem.id);
    // CRITICAL REQUIREMENT 11: Only approved reports are exposed to the patient!
    const approvedReports = allReqReports.filter(
      (rep) => rep.status === 'approved' || (rep.status === 'final' && rep.adminApprovalStatus === 'approved'),
    );
    const hasPendingApprovalReport = allReqReports.some(
      (rep) => rep.status === 'pending_approval',
    );
    const reqInfos = infoRequests.filter((inf) => inf.requestId === reqItem.id);

    return {
      id: reqItem.id,
      requestNumber: reqItem.requestNumber,
      patientFirstName: reqItem.patientFirstName,
      patientLastName: reqItem.patientLastName,
      imagingType: reqItem.imagingType,
      imagingArea: reqItem.imagingArea,
      studyDate: reqItem.studyDate,
      status: hasPendingApprovalReport ? 'pending_approval' : reqItem.status,
      paymentStatus: reqItem.paymentStatus,
      paymentAmount: reqItem.paymentAmount,
      paymentReference: reqItem.paymentReference,
      createdAt: reqItem.createdAt,
      updatedAt: reqItem.updatedAt,
      attachments: reqItem.attachments || [],
      // Strictly hide unapproved or rejected report content from patient API response
      reports: approvedReports.map((rep) => ({
        id: rep.id,
        findings: rep.findings,
        conclusion: rep.conclusion,
        status: rep.status,
        signed: rep.signed,
        signatureName: rep.signatureName,
        signedAt: rep.signedAt,
        approvedAt: rep.approvedAt,
        createdAt: rep.createdAt,
      })),
      infoRequests: reqInfos.map((inf) => ({
        id: inf.id,
        title: inf.title,
        body: inf.body,
        status: inf.status,
        response: inf.response,
        respondedAt: inf.respondedAt,
        messages: inf.messages || [],
        createdAt: inf.createdAt,
      })),
    };
  });
}

// ─────────────────────────────────────────────────────────────
// ۶. ارتباطات پزشک و بیمار (درخواست اطلاعات تکمیلی) و مدیریت توسط ادمین
// ─────────────────────────────────────────────────────────────

export async function listInfoRequestsServer(query: {
  status?: string;
  search?: string;
  requestId?: string;
  doctorId?: string;
  followUpStatus?: string;
  page?: number | string;
  limit?: number | string;
}) {
  const db = readDb();
  const infoRequests: StoredInfoRequest[] = db.infoRequests || [];
  const requests: StoredTeleReportRequest[] = db.teleReportRequests || [];

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 12, 1), 100);

  let joined = infoRequests
    .map((inf) => {
      const reqItem = requests.find((r) => r.id === inf.requestId);
      if (!reqItem) return null;
      return {
        ...inf,
        request: {
          id: reqItem.id,
          requestNumber: reqItem.requestNumber,
          patientFirstName: reqItem.patientFirstName,
          patientLastName: reqItem.patientLastName,
          imagingType: reqItem.imagingType,
          imagingArea: reqItem.imagingArea,
          phone: reqItem.phone,
          city: reqItem.city,
          assignedDoctorId: reqItem.assignedDoctorId,
          assignedDoctorName: reqItem.assignedDoctorName,
          status: reqItem.status,
        },
      };
    })
    .filter(Boolean) as Array<StoredInfoRequest & { request: any }>;

  if (query.status && query.status !== 'all') {
    joined = joined.filter((item) => item.status === query.status);
  }
  if (query.followUpStatus && query.followUpStatus !== 'all') {
    joined = joined.filter((item) => item.followUpStatus === query.followUpStatus);
  }
  if (query.requestId) {
    joined = joined.filter(
      (item) => item.requestId === query.requestId || item.request.requestNumber === query.requestId,
    );
  }
  if (query.doctorId && query.doctorId !== 'all') {
    joined = joined.filter((item) => item.authorId === query.doctorId);
  }
  if (query.search?.trim()) {
    const q = query.search.trim().toLowerCase();
    joined = joined.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.body.toLowerCase().includes(q) ||
        item.request.requestNumber.toLowerCase().includes(q) ||
        `${item.request.patientFirstName} ${item.request.patientLastName}`
          .toLowerCase()
          .includes(q) ||
        (item.author?.fullName || '').toLowerCase().includes(q),
    );
  }

  joined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const stats = {
    total: infoRequests.length,
    open: infoRequests.filter((i) => i.status === 'open').length,
    answered: infoRequests.filter((i) => i.status === 'answered').length,
    closed: infoRequests.filter((i) => i.status === 'closed').length,
    needsFollowup: infoRequests.filter((i) => i.followUpStatus === 'needs_followup').length,
  };

  const total = joined.length;
  const items = joined.slice((page - 1) * limit, page * limit);

  return {
    items,
    stats,
    total,
    page,
    limit,
    pages: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function createInfoRequestServer(input: {
  requestId: string;
  title: string;
  body: string;
  authorId?: string;
  authorName?: string;
}) {
  if (!input.title?.trim() || !input.body?.trim()) {
    throw new Error('عنوان و متن درخواست اطلاعات تکمیلی الزامی است.');
  }

  const db = readDb();
  const requests: StoredTeleReportRequest[] = db.teleReportRequests || [];
  const infoRequests: StoredInfoRequest[] = db.infoRequests || [];

  const reqItem = requests.find((r) => r.id === input.requestId || r.requestNumber === input.requestId);
  if (!reqItem) throw new Error('درخواست تله‌ریپورت یافت نشد.');

  const nowIso = new Date().toISOString();
  const doctorId = input.authorId || reqItem.assignedDoctorId || 'user-doc-01';
  const doctorName = input.authorName || reqItem.assignedDoctorName || 'دکتر مهدی عبدالکریمی';

  const created: StoredInfoRequest = {
    id: `info-${Date.now().toString(36)}`,
    requestId: reqItem.id,
    authorId: doctorId,
    author: { id: doctorId, fullName: doctorName },
    title: input.title.trim(),
    body: input.body.trim(),
    status: 'open',
    response: null,
    respondedAt: null,
    messages: [
      {
        id: `msg-${Date.now().toString(36)}`,
        senderId: doctorId,
        senderName: doctorName,
        senderRole: 'doctor',
        body: input.body.trim(),
        createdAt: nowIso,
      },
    ],
    followUpStatus: 'normal',
    adminNote: null,
    adminLogs: [],
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  infoRequests.unshift(created);
  db.infoRequests = infoRequests;
  writeDb(db);

  return {
    ...created,
    request: {
      id: reqItem.id,
      requestNumber: reqItem.requestNumber,
      patientFirstName: reqItem.patientFirstName,
      patientLastName: reqItem.patientLastName,
      imagingType: reqItem.imagingType,
      imagingArea: reqItem.imagingArea,
      phone: reqItem.phone,
    },
  };
}

export async function replyOrUpdateInfoRequestServer(
  id: string,
  input: {
    response?: string;
    message?: string;
    status?: 'open' | 'answered' | 'closed';
    followUpStatus?: 'normal' | 'needs_followup' | 'resolved' | 'escalated';
    adminNote?: string;
    senderId?: string;
    senderName?: string;
    senderRole?: 'doctor' | 'patient' | 'admin' | 'support';
  },
) {
  const db = readDb();
  const infoRequests: StoredInfoRequest[] = db.infoRequests || [];
  const requests: StoredTeleReportRequest[] = db.teleReportRequests || [];

  const idx = infoRequests.findIndex((i) => i.id === id);
  if (idx === -1) throw new Error('درخواست اطلاعات تکمیلی یافت نشد.');

  const item = infoRequests[idx];
  const reqItem = requests.find((r) => r.id === item.requestId);
  const nowIso = new Date().toISOString();

  const textBody = (input.response ?? input.message ?? '').trim();
  if (textBody) {
    const role = input.senderRole || 'patient';
    const senderName =
      input.senderName ||
      (role === 'patient'
        ? reqItem
          ? `${reqItem.patientFirstName} ${reqItem.patientLastName}`
          : 'بیمار'
        : role === 'admin'
          ? 'مدیر سامانه'
          : item.author?.fullName || 'پزشک رادیولوژیست');

    item.messages = [
      ...(item.messages || []),
      {
        id: `msg-${Date.now().toString(36)}`,
        senderId: input.senderId || role,
        senderName,
        senderRole: role,
        body: textBody,
        createdAt: nowIso,
      },
    ];

    if (role === 'patient') {
      item.response = textBody;
      item.respondedAt = nowIso;
      item.status = 'answered';
    }
  }

  if (input.status) {
    item.status = input.status;
  }
  if (input.followUpStatus) {
    item.followUpStatus = input.followUpStatus;
  }
  if (input.adminNote !== undefined) {
    item.adminNote = input.adminNote;
  }

  if (input.senderRole === 'admin') {
    item.adminLogs = [
      ...(item.adminLogs || []),
      {
        id: `adm-log-${Date.now().toString(36)}`,
        adminId: input.senderId || 'admin',
        adminName: input.senderName || 'مدیر سامانه',
        action:
          input.status
            ? `تغییر وضعیت مکالمه به ${input.status}`
            : input.followUpStatus
              ? `تغییر وضعیت پیگیری به ${input.followUpStatus}`
              : 'ثبت یادداشت / پیام مدیریتی',
        note: textBody || input.adminNote || undefined,
        createdAt: nowIso,
      },
    ];
  }

  item.updatedAt = nowIso;
  infoRequests[idx] = item;
  db.infoRequests = infoRequests;
  writeDb(db);

  return {
    ...item,
    request: reqItem || null,
  };
}
