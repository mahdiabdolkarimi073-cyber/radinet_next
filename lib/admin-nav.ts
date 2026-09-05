import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Building2,
  Package,
  ShoppingCart,
  FileText,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const adminNavItems: NavItem[] = [
  { label: 'داشبورد', href: '/admin', icon: LayoutDashboard },
  { label: 'کاربران', href: '/admin/users', icon: Users },
  { label: 'پزشکان', href: '/admin/doctors', icon: Stethoscope },
  { label: 'مراکز تصویربرداری', href: '/admin/imaging-centers', icon: Building2 },
  { label: 'سازمان‌ها', href: '/admin/organizations', icon: Building2 },
  { label: 'محصولات فروشگاه', href: '/admin/shop-products', icon: Package },
  { label: 'سفارش‌های فروشگاه', href: '/admin/shop-orders', icon: ShoppingCart },
  { label: 'درخواست‌های تله‌ریپورت', href: '/admin/tele-reports', icon: FileText },
];

export function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
}

export function formatToman(n: number): string {
  return n.toLocaleString('fa-IR');
}
