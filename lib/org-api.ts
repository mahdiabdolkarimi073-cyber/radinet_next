import { getStoredToken } from '@/lib/auth-client';

const ORG_API_PROXY = '/api/org';

function authHeaders(includeJsonContentType = true): Record<string, string> {
  const token = getStoredToken();
  const headers: Record<string, string> = {};
  if (includeJsonContentType) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function parseErrorMessage(body: Record<string, unknown>, status: number): string {
  const msg = body?.message;
  if (Array.isArray(msg)) return String(msg[0] ?? `خطا (${status})`);
  if (typeof msg === 'string' && msg.trim()) return msg;
  return `خطا در ارتباط با سرور (${status})`;
}

export async function orgGet<T>(path: string): Promise<T> {
  const res = await fetch(`${ORG_API_PROXY}${path}`, {
    headers: authHeaders(false),
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(parseErrorMessage(body, res.status));
  }
  return res.json() as Promise<T>;
}

export async function orgPost<T>(path: string, data: unknown): Promise<T> {
  const res = await fetch(`${ORG_API_PROXY}${path}`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(parseErrorMessage(body, res.status));
  }
  return res.json() as Promise<T>;
}

export async function orgPostForm<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${ORG_API_PROXY}${path}`, {
    method: 'POST',
    headers: authHeaders(false),
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(parseErrorMessage(body, res.status));
  }
  return res.json() as Promise<T>;
}

export async function orgPut<T>(path: string, data: unknown): Promise<T> {
  const res = await fetch(`${ORG_API_PROXY}${path}`, {
    method: 'PUT',
    headers: authHeaders(true),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(parseErrorMessage(body, res.status));
  }
  return res.json() as Promise<T>;
}

export async function orgDelete<T = { ok: boolean }>(path: string): Promise<T> {
  const res = await fetch(`${ORG_API_PROXY}${path}`, {
    method: 'DELETE',
    headers: authHeaders(false),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(parseErrorMessage(body, res.status));
  }
  return res.json() as Promise<T>;
}

// ── Types ──

export type OrgContext = {
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    organizationId: string;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
    type: string;
    city: string;
    province: string;
    logo: string | null;
    isActive: boolean;
  } | null;
  permissions: {
    staffCanSubmit: boolean;
    staffCanViewReports: boolean;
    staffCanViewAllRequests: boolean;
  };
};

export type OrgDashboardStats = {
  organization?: {
    id: string;
    name: string;
    slug: string;
    type: string;
    city: string;
    province: string;
    phone: string;
    email: string;
  } | null;
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  rejectedRequests: number;
  staffCount: number;
  activeStaffCount: number;
  pendingInvoices: number;
  totalInvoicesCount: number;
  paidInvoicesCount: number;
  overdueInvoicesCount: number;
  totalInvoicedAmount: string;
  totalPaidAmount: string;
  remainingDebtAmount: string;
  recentInvoices: Array<{
    id: string;
    invoiceNumber: string;
    amount: string;
    paidAmount: string;
    remainingAmount: string;
    dueDate: string;
    status: string;
    createdAt: string;
    contract: { id: string; contractNumber: string; title: string };
  }>;
  recentRequests: Array<{
    id: string;
    requestNumber: string;
    patientFirstName: string;
    patientLastName: string;
    phone?: string;
    imagingType: string;
    imagingArea?: string;
    status: string;
    createdAt: string;
    user: { id?: string; fullName: string; email?: string } | null;
  }>;
  recentActivities: Array<{
    id: string;
    type: 'request_log' | 'payment' | 'user';
    title: string;
    description: string;
    actor: string;
    createdAt: string;
  }>;
  requestsByType: Array<{ name: string; count: number }>;
  monthlyData: Array<{ month: string; count: number }>;
};

export type OrgStaffUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  requestsCount?: number;
};

export type OrgRequestItem = {
  id: string;
  requestNumber: string;
  patientFirstName: string;
  patientLastName: string;
  nationalId?: string | null;
  phone?: string;
  city?: string;
  age?: number | null;
  gender?: string;
  imagingType: string;
  imagingArea: string;
  clinicalHistory: string;
  symptoms?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  user: { id: string; fullName: string; email?: string; role?: string } | null;
  _count?: { attachments: number; reports: number };
};

export type OrgRequestList = {
  items: OrgRequestItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type OrgRequestDetail = {
  id: string;
  requestNumber: string;
  patientFirstName: string;
  patientLastName: string;
  nationalId?: string | null;
  phone: string;
  city: string;
  age?: number | null;
  gender: string;
  imagingType: string;
  imagingArea: string;
  studyDate?: string | null;
  pacsUrl?: string | null;
  cloudUrl?: string | null;
  clinicalHistory: string;
  symptoms: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; fullName: string; email: string; role?: string } | null;
  attachments: Array<{
    id: string;
    originalName: string;
    storedName: string;
    mimeType: string;
    size: number;
    storagePath: string;
    createdAt?: string;
  }>;
  reports?: Array<{
    id: string;
    findings: string;
    conclusion: string;
    status: string;
    signed: boolean;
    signatureName?: string | null;
    signedAt?: string | null;
    createdAt: string;
    author?: { fullName: string } | null;
  }>;
  statusLogs: Array<{
    id: string;
    status: string;
    note: string;
    createdAt: string;
    user: { fullName: string; role?: string } | null;
  }>;
};

export type OrgReportData = {
  summary: {
    total: number;
    completed: number;
    pending: number;
    rejected: number;
    completionRate: number;
  };
  byUser: Array<{
    userId: string;
    name: string;
    role: string;
    count: number;
    completed: number;
    pending: number;
    rejected: number;
  }>;
  byType: Array<{ name: string; count: number }>;
  byStatus: Array<{ status: string; count: number }>;
  byDate: Array<{ date: string; count: number }>;
};

export type OrgContract = {
  id: string;
  contractNumber: string;
  title: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string | null;
  terms?: string;
  discountPercent: number;
  creditLimit: string | null;
  signedBy?: string | null;
  signedAt?: string | null;
  notes?: string | null;
  center: { id: string; name: string; city?: string; phone?: string } | null;
  _count: { invoices: number };
  totalInvoiced?: string;
  totalPaid?: string;
  createdAt: string;
};

export type OrgInvoice = {
  id: string;
  invoiceNumber: string;
  amount: string;
  paidAmount?: string;
  remainingAmount?: string;
  dueDate: string;
  status: string;
  createdAt: string;
  contract: { id: string; contractNumber: string; title: string };
  payments?: Array<{
    id: string;
    amount: string;
    paidAt: string;
    method: string;
    reference: string;
  }>;
  _count: { payments: number };
};

export type OrgPayment = {
  id: string;
  amount: string;
  paidAt: string;
  method: string;
  reference: string;
  createdAt: string;
  invoice: {
    id: string;
    invoiceNumber: string;
    amount?: string;
    status?: string;
    contract: { id: string; contractNumber: string; title?: string };
  };
};

export type OrgSettings = {
  org: {
    id: string;
    name: string;
    slug: string;
    type?: string;
    nationalId?: string | null;
    economicCode?: string | null;
    registrationNumber?: string | null;
    email: string;
    phone: string;
    province: string;
    city: string;
    address: string;
    contactPerson?: string | null;
    contactPhone?: string | null;
    contactEmail?: string | null;
    description?: string;
    logo: string | null;
    isActive?: boolean;
  };
  settings: {
    id: string;
    settings: {
      staffCanSubmit?: boolean;
      staffCanViewReports?: boolean;
      staffCanViewAllRequests?: boolean;
    };
    updatedAt: string;
  };
};
