'use client';

export function OrgStatusBadge({ value }: { value: string }) {
  const labels: Record<string, string> = {
    pending: 'در انتظار',
    processing: 'در حال پردازش',
    shipped: 'ارسال شده',
    delivered: 'تحویل شده',
    cancelled: 'لغو شده',
    new: 'جدید',
    open: 'باز',
    closed: 'بسته',
    completed: 'تکمیل شده',
    paid: 'پرداخت شده',
    unpaid: 'پرداخت نشده',
    overdue: 'معوق',
    refunded: 'بازگشت‌داده شده',
    in_progress: 'در حال انجام',
    draft: 'پیش‌نویس',
    signed: 'امضا شده',
    approved: 'تایید شده',
    rejected: 'رد شده',
    resolved: 'حل شده',
    low: 'کم',
    medium: 'متوسط',
    high: 'زیاد',
    urgent: 'فوری',
    normal: 'عادی',
    active: 'فعال',
    inactive: 'غیرفعال',
    expired: 'منقضی',
  };
  return <span className={`org-badge org-badge--${value}`}>{labels[value] ?? value}</span>;
}
