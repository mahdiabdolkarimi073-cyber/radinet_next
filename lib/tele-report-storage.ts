import { BACKEND_URL as backendUrl } from './auth-client';
import { signJwtTokenServer } from './server-auth';
import {
  EXPERIMENTAL_AI_DISCLAIMER,
  type TeleReportAiAnalysisResult,
  type TeleReportAiConfig,
  teleReportAiImageAnalyzer,
} from './tele-report-ai-service';

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
  subject?: string;
  message?: string;
  status: 'open' | 'answered' | 'closed' | 'responded';
  response: string | null;
  respondedAt: string | null;
  messages: StoredCommunicationMessage[];
  followUpStatus?: 'normal' | 'needs_followup' | 'resolved' | 'escalated';
  adminNote?: string | null;
  adminLogs?: StoredAdminCommunicationLog[];
  request?: {
    id: string;
    requestNumber: string;
    patientFirstName: string;
    patientLastName: string;
    imagingType: string;
    imagingArea: string;
  } | null;
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

function generateRequestNumber(): string {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TR-${y}${m}${d}-${rand}`;
}

function buildAuthHeaders(auth?: string, fallbackRole: 'admin' | 'support_expert' | 'radiologist' = 'admin'): Record<string, string> {
  if (auth && auth.trim()) {
    return { Authorization: auth.startsWith('Bearer ') ? auth : `Bearer ${auth}` };
  }
  const token = signJwtTokenServer({
    sub: '00000000-0000-4000-a000-000000000001',
    email:
      fallbackRole === 'admin'
        ? 'admin@radinet.ir'
        : fallbackRole === 'radiologist'
          ? 'doctor@radinet.ir'
          : 'support@radinet.ir',
    role: fallbackRole,
    name:
      fallbackRole === 'admin'
        ? 'مدیر سیستم'
        : fallbackRole === 'radiologist'
          ? 'پزشک رادیولوژیست'
          : 'کارشناس پشتیبانی',
  });
  return { Authorization: `Bearer ${token}` };
}

function mapInfoRequest(item: any): StoredInfoRequest {
  return {
    ...item,
    title: item?.title ?? item?.subject ?? '',
    body: item?.body ?? item?.message ?? '',
    subject: item?.subject ?? item?.title ?? '',
    message: item?.message ?? item?.body ?? '',
    messages: Array.isArray(item?.messages) ? item.messages : [],
  };
}

// ─────────────────────────────────────────────────────────────
// ۱. تنظیمات تحلیل و هوش مصنوعی
// ─────────────────────────────────────────────────────────────

export async function getAiConfigServer(): Promise<TeleReportAiConfig> {
  try {
    const res = await fetch(`${backendUrl}/tele-report/ai-config`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return {
        aiAnalysisEnabled: Boolean(data.aiAnalysisEnabled ?? data.enabled ?? true),
        aiPricingEnabled: Boolean(data.aiPricingEnabled ?? true),
        suggestedPrice: Number(data.suggestedPrice ?? 950000),
        currency: String(data.currency || 'IRR'),
        updatedAt: data.updatedAt || new Date().toISOString(),
      };
    }
  } catch {}
  return defaultAiConfig;
}

export async function updateAiConfigServer(
  input: {
    aiAnalysisEnabled?: boolean;
    aiPricingEnabled?: boolean;
    suggestedPrice?: number;
    currency?: string;
  },
  auth?: string,
): Promise<TeleReportAiConfig> {
  try {
    const current = await getAiConfigServer();
    const updated: TeleReportAiConfig = {
      aiAnalysisEnabled: input.aiAnalysisEnabled ?? current.aiAnalysisEnabled,
      aiPricingEnabled: input.aiPricingEnabled ?? current.aiPricingEnabled,
      suggestedPrice:
        input.suggestedPrice !== undefined ? Math.round(Number(input.suggestedPrice)) : current.suggestedPrice,
      currency: input.currency || current.currency,
      updatedAt: new Date().toISOString(),
    };

    const res = await fetch(`${backendUrl}/admin/ai-tariff/ai-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...buildAuthHeaders(auth, 'admin'),
      },
      body: JSON.stringify({
        enabled: updated.aiAnalysisEnabled,
        ...updated,
      }),
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      return {
        aiAnalysisEnabled: Boolean(data.aiAnalysisEnabled ?? data.enabled ?? updated.aiAnalysisEnabled),
        aiPricingEnabled: Boolean(data.aiPricingEnabled ?? updated.aiPricingEnabled),
        suggestedPrice: Number(data.suggestedPrice ?? updated.suggestedPrice),
        currency: String(data.currency || updated.currency),
        updatedAt: data.updatedAt || updated.updatedAt,
      };
    }

    return updated;
  } catch {
    return defaultAiConfig;
  }
}

export async function runTeleReportAiAnalysisServer(input: {
  imagingType: string;
  imagingArea: string;
  country?: string;
  language?: string;
  clinicalHistory?: string;
  symptoms?: string;
  pacsUrl?: string;
  cloudUrl?: string;
  files?: Array<{ name: string; type?: string; size?: number; buffer?: any }>;
}): Promise<TeleReportAiAnalysisResult> {
  const config = await getAiConfigServer();
  const result = await teleReportAiImageAnalyzer.analyzeImages(
    {
      imagingType: input.imagingType,
      imagingArea: input.imagingArea,
      country: input.country,
      language: input.language,
      pacsUrl: input.pacsUrl,
      cloudUrl: input.cloudUrl,
      files: (input.files || []).map((f) => ({
        name: f.name,
        size: f.size || 0,
        type: f.type,
      })),
    },
    config,
  );

  return {
    ...result,
    disclaimer: EXPERIMENTAL_AI_DISCLAIMER,
  };
}

// ─────────────────────────────────────────────────────────────
// ۲. درخواست‌های تله‌ریپورت و بیماران
// ─────────────────────────────────────────────────────────────

export async function checkPatientExistsServer(params: {
  nationalId?: string;
  passportNumber?: string;
  phone?: string;
}) {
  try {
    if (!params.nationalId || params.nationalId.trim().length !== 10) {
      return { exists: false, hasHistory: false };
    }
    const res = await fetch(`${backendUrl}/tele-report/requests/check-patient`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nationalId: params.nationalId.trim() }),
      cache: 'no-store',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return { exists: false, hasHistory: false };
}

export async function createTeleReportRequestServer(
  input: {
    userId?: string | null;
    country: string;
    language: string;
    patientFirstName: string;
    patientLastName: string;
    nationalId?: string | null;
    passportNumber?: string | null;
    phone: string;
    city: string;
    age?: number | string | null;
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
  },
  auth?: string,
) {
  if (!input.patientFirstName?.trim()) throw new Error('نام بیمار الزامی است.');
  if (!input.patientLastName?.trim()) throw new Error('نام خانوادگی بیمار الزامی است.');
  if (!input.nationalId?.trim() && !input.passportNumber?.trim()) {
    throw new Error('کد ملی یا شماره پاسپورت بیمار الزامی است.');
  }
  if (!input.phone?.trim()) throw new Error('شماره تماس بیمار الزامی است.');
  if (!input.city?.trim()) throw new Error('شهر محل سکونت بیمار الزامی است.');

  let validatedAge: number | null = null;
  if (typeof input.age === 'number') {
    if (!Number.isFinite(input.age) || !Number.isInteger(input.age) || input.age < 0 || input.age > 130) {
      throw new Error('سن بیمار باید یک عدد صحیح بین ۰ تا ۱۳۰ سال باشد.');
    }
    validatedAge = input.age;
  } else if (typeof input.age === 'string') {
    const normalized = input.age
      .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
      .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
      .trim();
    if (!normalized) {
      throw new Error('سن بیمار الزامی است.');
    }
    if (!/^[+-]?\d+$/.test(normalized)) {
      throw new Error('سن بیمار باید یک عدد صحیح معتبر باشد.');
    }
    const parsed = Number.parseInt(normalized, 10);
    if (!Number.isSafeInteger(parsed) || parsed < 0 || parsed > 130) {
      throw new Error('سن بیمار باید بین ۰ تا ۱۳۰ سال باشد.');
    }
    validatedAge = parsed;
  } else {
    throw new Error('سن بیمار الزامی است.');
  }

  if (!input.gender?.trim()) throw new Error('جنسیت بیمار الزامی است.');
  if (!input.imagingType?.trim()) throw new Error('نوع تصویربرداری الزامی است.');
  if (!input.imagingArea?.trim()) throw new Error('ناحیه تصویربرداری الزامی است.');
  if (!input.clinicalHistory?.trim()) throw new Error('شرح حال بالینی الزامی است.');
  if (!input.symptoms?.trim()) throw new Error('علائم فعلی بیمار الزامی است.');

  const res = await fetch(`${backendUrl}/tele-report/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: auth.startsWith('Bearer ') ? auth : `Bearer ${auth}` } : {}),
    },
    body: JSON.stringify({
      ...input,
      age: validatedAge,
      requestNumber: generateRequestNumber(),
      studyDate: input.studyDate || undefined,
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = Array.isArray(err?.message) ? err.message.join('، ') : err?.message;
    throw new Error(msg || 'ثبت درخواست تله‌ریپورت در دیتابیس ناموفق بود.');
  }

  return await res.json();
}

export async function getTeleReportRequestByNumberOrIdServer(identifier: string) {
  try {
    const res = await fetch(`${backendUrl}/tele-report/requests/${encodeURIComponent(identifier)}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return null;
}

export async function setReferralPathServer(requestNumber: string, referralPath: string) {
  const normalizedPath =
    referralPath === 'platform_radiologist' || !referralPath ? 'auto' : referralPath;

  const res = await fetch(`${backendUrl}/tele-report/requests/${encodeURIComponent(requestNumber)}/referral-path`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ referralPath: normalizedPath }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'ثبت مسیر ارجاع ناموفق بود.');
  }
  return await res.json();
}

// ─────────────────────────────────────────────────────────────
// ۳. پرداخت‌های تله‌ریپورت
// ─────────────────────────────────────────────────────────────

export async function getPaymentConfigServer(countryCode?: string) {
  try {
    const qs = countryCode ? `?country=${encodeURIComponent(countryCode)}` : '';
    const res = await fetch(`${backendUrl}/tele-report/payments/config${qs}`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch {}
  return {
    country: 'ایران',
    countryCode: 'IR',
    currency: 'IRR',
    currencyLabel: 'تومان',
    amount: 950000,
    formattedAmount: '۹۵۰٬۰۰۰',
    gateways: [],
  };
}

export async function startTeleReportPaymentServer(input: {
  requestNumber: string;
  gateway?: string;
  country?: string;
  callbackUrl?: string;
}) {
  const res = await fetch(`${backendUrl}/tele-report/payments/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'آغاز فرآیند پرداخت ناموفق بود.');
  }
  return await res.json();
}

export async function verifyTeleReportPaymentServer(input: {
  requestNumber: string;
  paymentToken?: string;
  gateway?: string;
  authority?: string;
  status?: string;
}) {
  const res = await fetch(`${backendUrl}/tele-report/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requestNumber: input.requestNumber,
      paymentToken: input.paymentToken || input.authority,
      gateway: input.gateway,
    }),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'تأیید پرداخت ناموفق بود.');
  }
  return await res.json();
}

// ─────────────────────────────────────────────────────────────
// ۴. پزشکان و تله‌ریپورت ادمین و پشتیبانی
// ─────────────────────────────────────────────────────────────

export async function listRadiologistDoctorsServer(auth?: string): Promise<StoredDoctorProfile[]> {
  try {
    const res = await fetch(`${backendUrl}/admin/doctors?limit=100`, {
      headers: buildAuthHeaders(auth, 'admin'),
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : data?.items ?? [];
    }
  } catch {}
  return [];
}

export async function listAdminTeleReportsServer(
  query: {
    status?: string;
    search?: string;
    imagingType?: string;
    assignedDoctorId?: string;
    page?: number | string;
    limit?: number | string;
  },
  auth?: string,
) {
  try {
    const params = new URLSearchParams();
    if (query.status) params.set('status', query.status);
    if (query.search) params.set('search', query.search);
    if (query.imagingType) params.set('imagingType', query.imagingType);
    if (query.assignedDoctorId) params.set('assignedDoctorId', query.assignedDoctorId);
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));

    const res = await fetch(`${backendUrl}/admin/tele-reports?${params.toString()}`, {
      headers: buildAuthHeaders(auth, 'admin'),
      cache: 'no-store',
    });
    if (res.ok) return await res.json();
  } catch {}
  return { items: [], total: 0, page: Number(query.page) || 1, limit: Number(query.limit) || 20, pages: 1 };
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
  auth?: string,
) {
  const requestId = typeof inputOrId === 'string' ? inputOrId : inputOrId.requestId;
  const doctorId = typeof inputOrId === 'string' ? (maybeDoctorId || '') : inputOrId.doctorId;

  const res = await fetch(`${backendUrl}/admin/tele-reports/${encodeURIComponent(requestId)}/assign-doctor`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(auth, 'admin'),
    },
    body: JSON.stringify({ doctorId, requestNumber: requestId }),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'ارجاع به پزشک ناموفق بود.');
  }
  return await res.json();
}

export async function updateTeleReportStatusServer(
  requestId: string,
  status: string,
  options?: { scope?: 'admin' | 'support' | 'dashboard'; auth?: string },
) {
  const scope = options?.scope ?? 'admin';
  const endpoint =
    scope === 'support'
      ? `${backendUrl}/support/telereports/${encodeURIComponent(requestId)}/status`
      : scope === 'dashboard'
        ? `${backendUrl}/dashboard/referrals/${encodeURIComponent(requestId)}/status`
        : `${backendUrl}/admin/tele-reports/${encodeURIComponent(requestId)}/status`;

  const role = scope === 'support' ? 'support_expert' : scope === 'dashboard' ? 'radiologist' : 'admin';

  const res = await fetch(endpoint, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(options?.auth, role),
    },
    body: JSON.stringify({ status }),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'تغییر وضعیت درخواست ناموفق بود.');
  }
  return await res.json();
}

export async function getDoctorFinanceSummaryServer(auth?: string) {
  try {
    const res = await fetch(`${backendUrl}/dashboard/finance`, {
      headers: buildAuthHeaders(auth, 'radiologist'),
      cache: 'no-store',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return {
    totalIncome: 0,
    settleableIncome: 0,
    settledIncome: 0,
    incomeGeneratingRequestsCount: 0,
    currency: 'IRR',
    isUnderDevelopment: true,
    developmentNotice: 'بخش مالی و درآمد پزشک در حال توسعه است. محاسبه و تسویه درآمد در نسخه فعلی فعال نیست.',
    transactions: [],
  };
}

export async function getDoctorDashboardServer(_doctorUserId?: string, auth?: string) {
  try {
    const res = await fetch(`${backendUrl}/dashboard`, {
      headers: buildAuthHeaders(auth, 'radiologist'),
      cache: 'no-store',
    });
    if (res.ok) return await res.json();
  } catch {}
  return {
    stats: { total: 0, new: 0, inReview: 0, completed: 0 },
    notifications: [],
  };
}

export async function listDoctorReferralsServer(
  query: {
    doctorUserId?: string;
    status?: string;
    imagingType?: string;
    from?: string;
    to?: string;
    search?: string;
    page?: number | string;
    limit?: number | string;
  },
  auth?: string,
) {
  try {
    const params = new URLSearchParams();
    if (query.status) params.set('status', query.status);
    if (query.imagingType) params.set('imagingType', query.imagingType);
    if (query.from) params.set('from', query.from);
    if (query.to) params.set('to', query.to);
    if (query.search) params.set('search', query.search);
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));

    const res = await fetch(`${backendUrl}/dashboard/referrals?${params.toString()}`, {
      headers: buildAuthHeaders(auth, 'radiologist'),
      cache: 'no-store',
    });
    if (res.ok) return await res.json();
  } catch {}
  return { items: [], total: 0, page: Number(query.page) || 1, limit: Number(query.limit) || 10, pages: 1 };
}

export async function getAdminTeleReportDetailServer(identifier: string, auth?: string, scope: 'admin' | 'support' = 'admin') {
  try {
    const endpoint =
      scope === 'support'
        ? `${backendUrl}/support/telereports/${encodeURIComponent(identifier)}`
        : `${backendUrl}/admin/tele-reports/${encodeURIComponent(identifier)}`;

    const res = await fetch(endpoint, {
      headers: buildAuthHeaders(auth, scope === 'support' ? 'support_expert' : 'admin'),
      cache: 'no-store',
    });
    if (res.ok) return await res.json();
  } catch {}
  return null;
}

export async function listUserPanelTelereportsServer(
  params?: {
    userId?: string;
    phone?: string;
    page?: number;
    limit?: number;
  },
  auth?: string,
) {
  try {
    if (!auth) return { items: [], total: 0, page: 1, limit: params?.limit || 10, pages: 1 };
    const searchParams = new URLSearchParams();
    if (params?.userId) searchParams.set('userId', params.userId);
    if (params?.phone) searchParams.set('phone', params.phone);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const res = await fetch(`${backendUrl}/panel/telereports?${searchParams.toString()}`, {
      headers: { Authorization: auth.startsWith('Bearer ') ? auth : `Bearer ${auth}` },
      cache: 'no-store',
    });
    if (res.ok) return await res.json();
  } catch {}
  return { items: [], total: 0, page: 1, limit: params?.limit || 10, pages: 1 };
}

export async function getDoctorPatientFileServer(requestId: string, auth?: string) {
  try {
    const res = await fetch(`${backendUrl}/dashboard/patients/${encodeURIComponent(requestId)}`, {
      headers: buildAuthHeaders(auth, 'radiologist'),
      cache: 'no-store',
    });
    if (res.ok) return await res.json();
  } catch {}
  return null;
}

// ─────────────────────────────────────────────────────────────
// ۵. گزارش‌های رادیولوژی و تله‌ریپورت
// ─────────────────────────────────────────────────────────────

export async function createOrGetDoctorReportServer(
  input: {
    requestId: string;
    authorId?: string;
    authorName?: string;
    findings?: string;
    conclusion?: string;
  },
  auth?: string,
) {
  const headers = buildAuthHeaders(auth, 'radiologist');

  // If a draft/report already exists for this request, return it first
  try {
    const existingRes = await fetch(
      `${backendUrl}/dashboard/reports/by-request/${encodeURIComponent(input.requestId)}`,
      { headers, cache: 'no-store' },
    );
    if (existingRes.ok) {
      const existingData = await existingRes.json();
      if (Array.isArray(existingData?.items) && existingData.items.length > 0) {
        return existingData.items[0];
      }
    }
  } catch {}

  const res = await fetch(`${backendUrl}/dashboard/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      requestId: input.requestId,
      findings: input.findings ?? '',
      conclusion: input.conclusion ?? '',
    }),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'ایجاد یا بارگذاری پیش‌نویس گزارش ناموفق بود.');
  }
  return await res.json();
}

export async function getDoctorReportByIdServer(reportId: string, auth?: string) {
  try {
    const res = await fetch(`${backendUrl}/dashboard/reports/${encodeURIComponent(reportId)}`, {
      headers: buildAuthHeaders(auth, 'radiologist'),
      cache: 'no-store',
    });
    if (res.ok) return await res.json();
  } catch {}
  return null;
}

export async function updateDoctorReportDraftServer(
  reportId: string,
  input: {
    findings?: string;
    conclusion?: string;
    signatureName?: string;
  },
  auth?: string,
) {
  const res = await fetch(`${backendUrl}/dashboard/reports/${encodeURIComponent(reportId)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(auth, 'radiologist'),
    },
    body: JSON.stringify({
      findings: input.findings,
      conclusion: input.conclusion,
    }),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'ذخیره پیش‌نویس گزارش ناموفق بود.');
  }
  return await res.json();
}

export async function submitDoctorReportForApprovalServer(
  reportId: string,
  input: {
    findings?: string;
    conclusion?: string;
    signed?: boolean;
    signatureName: string;
    actorId?: string;
    actorName?: string;
  },
  auth?: string,
) {
  const res = await fetch(`${backendUrl}/dashboard/reports/${encodeURIComponent(reportId)}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(auth, 'radiologist'),
    },
    body: JSON.stringify({
      findings: input.findings ?? '',
      conclusion: input.conclusion ?? '',
      signed: input.signed ?? true,
      signatureName: input.signatureName,
    }),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'ثبت گزارش برای تأیید ناموفق بود.');
  }
  return await res.json();
}

export async function reviewRadiologyReportServer(
  input: {
    reportId: string;
    requestId?: string;
    decision: 'approve' | 'reject' | 'approved' | 'rejected';
    reason?: string;
    rejectReason?: string;
    actorId?: string;
    actorName?: string;
    actorRole?: string;
    reviewerId?: string;
    reviewerName?: string;
    scope?: 'admin' | 'support';
  },
  auth?: string,
) {
  const targetId = input.requestId || input.reportId;
  const normalizedDecision: 'approved' | 'rejected' =
    input.decision === 'reject' || input.decision === 'rejected' ? 'rejected' : 'approved';
  const rejectReason = input.rejectReason ?? input.reason;

  const isSupport = input.scope === 'support' || input.actorRole === 'support' || input.actorRole === 'support_expert';

  const endpoint = isSupport
    ? `${backendUrl}/support/telereports/${encodeURIComponent(targetId)}/review-report`
    : `${backendUrl}/admin/tele-reports/${encodeURIComponent(targetId)}/reports/${encodeURIComponent(input.reportId)}`;

  const res = await fetch(endpoint, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(auth, isSupport ? 'support_expert' : 'admin'),
    },
    body: JSON.stringify(
      isSupport
        ? {
            reportId: input.reportId,
            decision: normalizedDecision,
            ...(rejectReason ? { rejectReason } : {}),
          }
        : {
            decision: normalizedDecision,
            ...(rejectReason ? { rejectReason } : {}),
          },
    ),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'بررسی و تغییر وضعیت گزارش ناموفق بود.');
  }
  return await res.json();
}

export async function listDoctorReportsServer(
  query: {
    status?: string;
    imagingType?: string;
    search?: string;
    page?: number | string;
    limit?: number | string;
  },
  auth?: string,
) {
  try {
    const params = new URLSearchParams();
    if (query.status) params.set('status', query.status);
    if (query.imagingType) params.set('imagingType', query.imagingType);
    if (query.search) params.set('search', query.search);
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));

    const res = await fetch(`${backendUrl}/dashboard/reports?${params.toString()}`, {
      headers: buildAuthHeaders(auth, 'radiologist'),
      cache: 'no-store',
    });
    if (res.ok) return await res.json();
  } catch {}
  return { items: [], total: 0, page: Number(query.page) || 1, limit: Number(query.limit) || 10, pages: 1 };
}

export async function listPatientTeleReportsServer(user: { id?: string; phone?: string }, auth?: string) {
  return listUserPanelTelereportsServer({ userId: user.id, phone: user.phone }, auth);
}

// ─────────────────────────────────────────────────────────────
// ۶. درخواست‌های اطلاعات تکمیلی (Info Requests)
// ─────────────────────────────────────────────────────────────

export async function listInfoRequestsServer(
  query: {
    doctorUserId?: string;
    requestId?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  },
  auth?: string,
): Promise<{
  items: StoredInfoRequest[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}> {
  try {
    const params = new URLSearchParams();
    if (query.requestId) params.set('requestId', query.requestId);
    if (query.status) params.set('status', query.status);
    if (query.search) params.set('search', query.search);
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));

    const res = await fetch(`${backendUrl}/dashboard/info-requests?${params.toString()}`, {
      headers: buildAuthHeaders(auth, 'radiologist'),
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return {
        items: Array.isArray(data?.items) ? data.items.map(mapInfoRequest) : [],
        total: Number(data?.total ?? 0),
        page: Number(data?.page ?? query.page ?? 1),
        limit: Number(data?.limit ?? query.limit ?? 10),
        pages: Number(data?.pages ?? 1),
      };
    }
  } catch {}
  return { items: [], total: 0, page: query.page || 1, limit: query.limit || 10, pages: 1 };
}

export async function listDoctorInfoRequestsServer(
  query: {
    doctorUserId?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  },
  auth?: string,
) {
  return listInfoRequestsServer(query, auth);
}

export async function createInfoRequestServer(
  input: {
    requestId: string;
    title?: string;
    body?: string;
    subject?: string;
    message?: string;
    authorId?: string;
    authorName?: string;
  },
  auth?: string,
): Promise<StoredInfoRequest> {
  const title = (input.title ?? input.subject ?? 'درخواست اطلاعات تکمیلی بالینی').trim();
  const body = (input.body ?? input.message ?? '').trim();

  const res = await fetch(`${backendUrl}/dashboard/info-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(auth, 'radiologist'),
    },
    body: JSON.stringify({
      requestId: input.requestId,
      title,
      body,
    }),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'ثبت درخواست اطلاعات تکمیلی ناموفق بود.');
  }
  return mapInfoRequest(await res.json());
}

export async function createDoctorInfoRequestServer(
  input: {
    requestId: string;
    authorId?: string;
    authorName?: string;
    subject?: string;
    message?: string;
    title?: string;
    body?: string;
  },
  auth?: string,
): Promise<StoredInfoRequest> {
  return createInfoRequestServer(input, auth);
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
  auth?: string,
): Promise<StoredInfoRequest> {
  const res = await fetch(`${backendUrl}/dashboard/info-requests/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(auth, 'radiologist'),
    },
    body: JSON.stringify({
      ...(input.response !== undefined || input.message !== undefined
        ? { response: input.response ?? input.message }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    }),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'ثبت پاسخ یا به‌روزرسانی درخواست اطلاعات ناموفق بود.');
  }
  return mapInfoRequest(await res.json());
}

export async function replyToInfoRequestServer(
  id: string,
  input: {
    senderRole?: 'doctor' | 'patient' | 'admin' | 'support';
    senderId?: string;
    senderName?: string;
    message: string;
  },
  auth?: string,
): Promise<StoredInfoRequest> {
  if (input.senderRole === 'patient' && auth) {
    const res = await fetch(`${backendUrl}/panel/telereports/${encodeURIComponent(id)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth.startsWith('Bearer ') ? auth : `Bearer ${auth}`,
      },
      body: JSON.stringify({ infoRequestId: id, message: input.message }),
      cache: 'no-store',
    });
    if (res.ok) return mapInfoRequest(await res.json());
  }
  return replyOrUpdateInfoRequestServer(
    id,
    {
      response: input.message,
      senderId: input.senderId,
      senderName: input.senderName,
      senderRole: input.senderRole,
    },
    auth,
  );
}

export async function adminUpdateCommunicationServer(
  id: string,
  input: {
    status?: 'open' | 'answered' | 'closed';
    adminNote?: string;
    actorName?: string;
  },
  auth?: string,
): Promise<StoredInfoRequest> {
  return replyOrUpdateInfoRequestServer(
    id,
    {
      status: input.status,
      adminNote: input.adminNote,
    },
    auth,
  );
}
