export const ORG_API = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000/api';

function token(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('radinet_auth_token');
}

export async function orgRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const auth = token();
  const response = await fetch(`${ORG_API}/org${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      ...(options.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (response.status === 401 || response.status === 403) {
    if (typeof window !== 'undefined') window.location.href = '/auth';
    throw new Error('دسترسی غیرمجاز');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message ?? data?.error ?? 'درخواست ناموفق بود');
  return data as T;
}

export const orgGet = <T,>(path: string) => orgRequest<T>(path);
export const orgPost = <T,>(path: string, body: unknown) => orgRequest<T>(path, { method: 'POST', body: JSON.stringify(body) });
export const orgPut = <T,>(path: string, body: unknown) => orgRequest<T>(path, { method: 'PUT', body: JSON.stringify(body) });
export const orgDelete = <T,>(path: string) => orgRequest<T>(path, { method: 'DELETE' });

// ── Types ──

export type OrgDashboardStats = {
  totalRequests: number;
  staffCount: number;
  pendingInvoices: number;
  recentRequests: Array<{
    id: string;
    requestNumber: string;
    patientFirstName: string;
    patientLastName: string;
    imagingType: string;
    status: string;
    createdAt: string;
    user: { fullName: string };
  }>;
  requestsByType: Array<{ name: string; value: number }>;
  monthlyData: Array<{ month: string; count: number }>;
};

export type OrgStaff = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  country: string;
  createdAt: string;
};

export type OrgRequest = {
  id: string;
  requestNumber: string;
  patientFirstName: string;
  patientLastName: string;
  imagingType: string;
  imagingArea: string;
  status: string;
  createdAt: string;
  user: { id: string; fullName: string };
};

export type OrgRequestDetail = {
  request: {
    id: string;
    requestNumber: string;
    patientFirstName: string;
    patientLastName: string;
    imagingType: string;
    imagingArea: string;
    status: string;
    priority: string;
    clinicalHistory: string;
    createdAt: string;
    user: { id: string; fullName: string; email: string };
    attachments: Array<{ id: string; originalName: string; storedName: string; mimeType: string; size: number }>;
    reports: Array<{ id: string; status: string; findings: string; conclusion: string; signed: boolean; createdAt: string }>;
  };
  statusLogs: Array<{
    id: string;
    status: string;
    note: string;
    createdAt: string;
    user: { fullName: string } | null;
  }>;
};

export type OrgReportData = {
  byUser: Array<{ name: string; count: number }>;
  byType: Array<{ name: string; count: number }>;
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
  discountPercent: number;
  creditLimit: string | null;
  center: { id: string; name: string } | null;
  _count: { invoices: number };
  createdAt: string;
};

export type OrgInvoice = {
  id: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  status: string;
  createdAt: string;
  contract: { id: string; contractNumber: string; title: string };
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
    contract: { id: string; contractNumber: string };
  };
};

export type OrgSettings = {
  org: {
    id: string;
    name: string;
    slug: string;
    email: string;
    phone: string;
    address: string;
    logo: string | null;
    city: string;
    province: string;
  };
  settings: {
    id: string;
    settings: Record<string, boolean>;
    updatedAt: string;
  };
};
