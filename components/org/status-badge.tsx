'use client';

export function OrgStatusBadge({ value }: { value: string }) {
  const normalized = (value || '').toLowerCase();
  const labels: Record<string, string> = {
    pending: 'در انتظار بررسی',
    processing: 'در حال پردازش',
    in_progress: 'در حال انجام',
    reviewing: 'در حال بازبینی',
    need_info: 'نیازمند اطلاعات تکمیلی',
    shipped: 'ارسال شده',
    delivered: 'تحویل شده',
    cancelled: 'لغو شده',
    new: 'جدید (ثبت شده)',
    open: 'باز',
    closed: 'بسته شده',
    completed: 'تکمیل شده',
    referred: 'ارجاع شده',
    paid: 'پرداخت شده',
    unpaid: 'پرداخت نشده',
    overdue: 'سررسید گذشته (معوق)',
    partial: 'پرداخت جزئی',
    refunded: 'بازگشت‌داده شده',
    draft: 'پیش‌نویس',
    signed: 'امضا شده',
    approved: 'تایید شده',
    rejected: 'رد شده',
    resolved: 'حل شده',
    low: 'کم',
    medium: 'متوسط',
    high: 'زیاد',
    urgent: 'فوری',
    emergency: 'اورژانسی',
    normal: 'عادی',
    active: 'فعال',
    inactive: 'غیرفعال',
    expired: 'منقضی شده',
    service: 'خدماتی / تله‌ریپورت',
    corporate: 'سازمانی',
    insurance: 'بیمه‌ای',
    org_admin: 'مدیر سازمان',
    org_staff: 'کارشناس سازمان',
    bank_transfer: 'انتقال بانکی / حواله',
    online_gateway: 'درگاه پرداخت آنلاین',
    cheque: 'چک بانکی',
    credit: 'اعتباری',
  };
  return (
    <span className={`org-badge org-badge--${normalized}`}>
      {labels[normalized] ?? value}
    </span>
  );
}
