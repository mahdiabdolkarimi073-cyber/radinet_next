import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Building2,
  Package,
  ShoppingCart,
  FileText,
  PhoneCall,
  FileCheck,
  Headphones,
  Bell,
  Settings,
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
  { label: 'سفارش‌های فروشگاه', href: '/admin/shop-orders', icon: ShoppingCart },
  { label: 'محصولات فروشگاه', href: '/admin/shop-products', icon: Package },
  { label: 'درخواست‌های تله‌ریپورت', href: '/admin/tele-reports', icon: FileText },
  { label: 'مدیریت پشتیبانی', href: '/admin/support', icon: Headphones },
  { label: 'اعلان‌ها', href: '/admin/notifications', icon: Bell },
  { label: 'مدیریت مقالات', href: '/admin/articles', icon: FileText },
  { label: 'مدیریت درباره ما', href: '/admin/about', icon: Building2 },
  { label: 'مدیریت تماس با ما', href: '/admin/contact', icon: PhoneCall },
  { label: 'قوانین و مقررات', href: '/admin/legal', icon: FileCheck },
  { label: 'تنظیمات سامانه', href: '/admin/settings', icon: Settings },
];

export function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
}

export function formatToman(n: number): string {
  return n.toLocaleString('fa-IR');
}
