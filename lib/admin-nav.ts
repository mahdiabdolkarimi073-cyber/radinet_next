import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Building2,
  Building,
  Package,
  ShoppingCart,
  FileText,
  Sparkles,
  Route,
  Globe,
  Bell,
  Ticket,
  BarChart3,
  Settings,
  MessageSquare,
  MessageCircleQuestion,
  Headphones,
  Activity,
  FileCheck,
  PhoneCall,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const adminNavItems: NavItem[] = [
  // ۱۵ بخش اصلی کنترل پنل مدیریت مرکزی
  { label: 'داشبورد مدیریت', href: '/admin', icon: LayoutDashboard },
  { label: 'مدیریت کاربران', href: '/admin/users', icon: Users },
  { label: 'مدیریت پزشکان', href: '/admin/doctors', icon: Stethoscope },
  { label: 'مراکز تصویربرداری', href: '/admin/imaging-centers', icon: Building2 },
  { label: 'سازمان‌ها', href: '/admin/organizations', icon: Building },
  { label: 'محصولات فروشگاه', href: '/admin/shop-products', icon: Package },
  { label: 'سفارش‌های فروشگاه', href: '/admin/shop-orders', icon: ShoppingCart },
  { label: 'درخواست‌های تله‌ریپورت', href: '/admin/tele-reports', icon: FileText },
  { label: 'هوش مصنوعی و تعرفه‌ها', href: '/admin/ai-tariffs', icon: Sparkles },
  { label: 'مسیریابی گزارش‌ها', href: '/admin/routing', icon: Route },
  { label: 'محتوای صفحات عمومی', href: '/admin/content', icon: Globe },
  { label: 'اعلان‌ها و پیامک‌ها', href: '/admin/notifications', icon: Bell },
  { label: 'کدهای تخفیف', href: '/admin/discounts', icon: Ticket },
  { label: 'گزارش‌های مدیریتی', href: '/admin/reports', icon: BarChart3 },
  { label: 'تنظیمات سامانه', href: '/admin/settings', icon: Settings },

  // بخش‌های تکمیلی عملیاتی سیستم
  { label: 'مدیریت نظرات', href: '/admin/reviews', icon: MessageSquare },
  { label: 'ارتباطات پزشک و بیمار', href: '/admin/communications', icon: MessageCircleQuestion },
  { label: 'مدیریت پشتیبانی', href: '/admin/support', icon: Headphones },
];

export function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
}

export function formatToman(n: number | null | undefined): string {
  const num = Number(n);
  if (!Number.isFinite(num)) return '۰';
  return num.toLocaleString('fa-IR');
}
