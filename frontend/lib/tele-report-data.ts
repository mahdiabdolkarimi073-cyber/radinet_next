export type TeleReportFeature = {
  title: string;
  description: string;
  icon: string;
};

export type TeleReportStep = {
  number: string;
  title: string;
  description: string;
  icon: string;
};

export type TeleReportGuide = {
  number: string;
  title: string;
  description: string;
  imageUrl: string;
};

export type TeleReportData = {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    imageUrl: string;
  };
  features: TeleReportFeature[];
  about: {
    eyebrow: string;
    title: string;
    description: string;
    bullets: string[];
    imageUrl: string;
  };
  steps: TeleReportStep[];
  guides: TeleReportGuide[];
  benefits: TeleReportFeature[];
  cta: {
    title: string;
    description: string;
    buttonLabel: string;
  };
};

export const fallbackTeleReport: TeleReportData = {
  hero: {
    eyebrow: 'راهکار نوین تصویربرداری پزشکی',
    title: 'تله‌ریپورت رادینت',
    subtitle: 'گزارش هوشمند تصویربرداری پزشکی با هوش مصنوعی',
    description: 'با بهره‌گیری از پیشرفته‌ترین الگوریتم‌های هوش مصنوعی، تصاویر پزشکی شما را تحلیل کرده و در سریع‌ترین زمان ممکن گزارشی دقیق و قابل اعتماد ارائه می‌دهیم.',
    primaryCta: 'ثبت درخواست جدید',
    secondaryCta: 'مشاهده دمو',
    imageUrl: '/assets/images/ChatGPT_Image_Aug_25,_2026,_02_46_54_PM.png',
  },
  features: [
    { title: 'تحلیل هوشمند', description: 'استفاده از هوش مصنوعی برای تحلیل دقیق تصاویر', icon: 'brain' },
    { title: 'سرعت بالا', description: 'تحویل گزارش در کمتر از ۲۴ ساعت', icon: 'clock' },
    { title: 'دقت بالا', description: 'گزارش‌نویسی دقیق توسط متخصصان مجرب', icon: 'scan' },
    { title: 'امنیت اطلاعات', description: 'حفاظت کامل از حریم خصوصی و اطلاعات بیماران', icon: 'shield' },
  ],
  about: {
    eyebrow: 'آشنایی با سرویس',
    title: 'تله‌ریپورت رادینت چیست؟',
    description: 'تله‌ریپورت، یک سرویس آنلاین برای تحلیل تصاویر پزشکی با استفاده از هوش مصنوعی است. با این سرویس، می‌توانید در کوتاه‌ترین زمان ممکن گزارش دقیق و تخصصی دریافت کنید.',
    bullets: ['تحلیل تصاویر پزشکی (X-Ray، CT، MRI و سونوگرافی)', 'گزارش توسط متخصصان مجرب و مورد اعتماد', 'دسترسی آسان و سریع به گزارش', 'قابل استفاده برای پزشکان و مراکز درمانی'],
    imageUrl: '',
  },
  steps: [
    { number: '۰۱', title: 'ثبت سفارش', description: 'اطلاعات بیمار و نوع تصویربرداری را وارد کنید.', icon: 'clipboard' },
    { number: '۰۲', title: 'بررسی تخصصی', description: 'تصاویر شما توسط تیم متخصص بررسی می‌شوند.', icon: 'stethoscope' },
    { number: '۰۳', title: 'گزارش هوشمند', description: 'تصاویر با کمک هوش مصنوعی تحلیل می‌شوند.', icon: 'brain' },
    { number: '۰۴', title: 'دریافت گزارش', description: 'گزارش نهایی را به‌صورت آنلاین دریافت کنید.', icon: 'download' },
  ],
  guides: [
    { number: '۱', title: 'ثبت‌نام و ورود', description: 'در سامانه ثبت‌نام کنید و وارد پنل شوید.', imageUrl: '' },
    { number: '۲', title: 'ثبت سفارش', description: 'نوع تصویربرداری و اطلاعات بیمار را وارد کنید.', imageUrl: '' },
    { number: '۳', title: 'پرداخت آنلاین', description: 'هزینه را به‌صورت امن پرداخت کنید.', imageUrl: '' },
    { number: '۴', title: 'انتظار برای گزارش', description: 'وضعیت سفارش خود را در پنل دنبال کنید.', imageUrl: '' },
    { number: '۵', title: 'دریافت گزارش', description: 'گزارش نهایی را مشاهده و دانلود کنید.', imageUrl: '' },
  ],
  benefits: [
    { title: 'هزینه مناسب', description: 'کیفیت تخصصی با قیمت منصفانه', icon: 'sparkles' },
    { title: 'کیفیت بالا', description: 'گزارش‌های دقیق و استاندارد', icon: 'file' },
    { title: 'دسترسی آسان', description: 'از هر مکان و در هر زمان', icon: 'pointer' },
    { title: 'کاهش زمان انتظار', description: 'گزارش سریع بدون معطلی', icon: 'download' },
    { title: 'پشتیبانی در دسترس', description: 'همراه شما در تمام مراحل', icon: 'headphones' },
  ],
  cta: {
    title: 'آماده‌اید تجربه جدیدی در گزارش‌دهی پزشکی را تجربه کنید؟',
    description: 'با رادینت، مسیر دریافت گزارش تخصصی کوتاه‌تر و مطمئن‌تر است.',
    buttonLabel: 'همین حالا شروع کنید',
  },
};

function mergeData(value: Partial<TeleReportData>): TeleReportData {
  return {
    ...fallbackTeleReport,
    ...value,
    hero: { ...fallbackTeleReport.hero, ...value.hero },
    about: { ...fallbackTeleReport.about, ...value.about },
    cta: { ...fallbackTeleReport.cta, ...value.cta },
    features: value.features?.length ? value.features : fallbackTeleReport.features,
    steps: value.steps?.length ? value.steps : fallbackTeleReport.steps,
    guides: value.guides?.length ? value.guides : fallbackTeleReport.guides,
    benefits: value.benefits?.length ? value.benefits : fallbackTeleReport.benefits,
  };
}

export async function getTeleReportData(): Promise<TeleReportData> {
  const apiUrl = process.env.BACKEND_URL ?? 'http://localhost:4000';
  try {
    const response = await fetch(`${apiUrl}/api/tele-report`, { next: { revalidate: 30 } });
    if (!response.ok) return fallbackTeleReport;
    const data = await response.json() as Partial<TeleReportData>;
    return mergeData(data);
  } catch {
    return fallbackTeleReport;
  }
}
