'use client';

export const USER_API = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000/api';

function token(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('radinet_auth_token');
}

export async function userRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const auth = token();
  const response = await fetch(`${USER_API}${path}`, {
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

export const userGet = <T,>(path: string) => userRequest<T>(path);
export const userPut = <T,>(path: string, body: unknown) => userRequest<T>(path, { method: 'PUT', body: JSON.stringify(body) });
export const userPost = <T,>(path: string, body: unknown) => userRequest<T>(path, { method: 'POST', body: JSON.stringify(body) });
export const userPatch = <T,>(path: string, body?: unknown) => userRequest<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });

export type UserDashboard = {
  stats: { totalOrders: number; totalTeleReports: number; totalConsultations: number };
  latestOrders: Array<{ id: string; orderNumber: string; total: string; status: string; createdAt: string; items: Array<{ productName: string; quantity: number }> }>;
  latestTeleReports: Array<{ id: string; requestNumber: string; imagingType: string; imagingArea: string; status: string; createdAt: string }>;
  latestConsultations: Array<{ id: string; name: string; message: string | null; status: string; createdAt: string }>;
};

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  country: string;
  status: string;
  createdAt: string;
};

// ── Panel types ──

export type PanelOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: string;
  subtotal: string;
  discountTotal: string;
  shippingCost: string;
  trackingCode: string | null;
  createdAt: string;
  items: Array<{ id: string; productName: string; quantity: number; unitPrice: string; lineTotal: string }>;
};

export type PanelTelereport = {
  id: string;
  requestNumber: string;
  imagingType: string;
  imagingArea: string;
  status: string;
  patientFirstName: string;
  patientLastName: string;
  createdAt: string;
  attachments: Array<{ id: string; originalName: string; storedName: string; mimeType: string; size: number }>;
  reports: Array<{ id: string; status: string; findings: string; conclusion: string; signed: boolean; createdAt: string }>;
};

export type PanelMedicalReport = {
  id: string;
  title: string;
  type: string;
  fileUrl: string | null;
  description: string;
  createdAt: string;
};

export type PanelTransaction = {
  id: string;
  amount: string;
  status: string;
  invoiceRef: string | null;
  description: string;
  type: string;
  createdAt: string;
};

export type PanelNotification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export type PanelTicket = {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  expert: { id: string; fullName: string } | null;
  _count: { replies: number };
};

export type PanelTicketDetail = {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  expert: { id: string; fullName: string } | null;
  replies: Array<{
    id: string;
    message: string;
    createdAt: string;
    author: { id: string; fullName: string; role: string };
  }>;
};

export type PanelReview = {
  id: string;
  targetType: string;
  targetId: string;
  content: string;
  rating: number;
  status: string;
  rejectReason: string | null;
  createdAt: string;
};
