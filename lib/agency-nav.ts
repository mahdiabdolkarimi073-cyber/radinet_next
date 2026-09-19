import {
  LayoutDashboard,
  Building2,
  Stethoscope,
  FileText,
  MessageSquare,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type AgencyNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const agencyNavItems: AgencyNavItem[] = [
  { label: 'داشبورد', href: '/agency', icon: LayoutDashboard },
  { label: 'مراکز زیرمجموعه', href: '/agency/centers', icon: Building2 },
  { label: 'پزشکان زیرمجموعه', href: '/agency/doctors', icon: Stethoscope },
  { label: 'درخواست‌ها و سفارش‌ها', href: '/agency/orders', icon: FileText },
  { label: 'ارتباط با مدیریت مرکزی', href: '/agency/communication', icon: MessageSquare },
  { label: 'امور مالی و کارمزد', href: '/agency/finance', icon: Wallet },
];

export function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
}

export function formatToman(n: number): string {
  return n.toLocaleString('fa-IR');
}
