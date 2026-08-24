export type HomeSlide = {
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  primary_cta: string;
  secondary_cta: string;
};

export type HomeService = {
  name: string;
  description: string;
  icon_key: string;
  color_theme: string;
  cta_label: string;
};

export type HomeStat = {
  label: string;
  value: string;
  icon_key: string;
};

export type HomeNews = {
  title: string;
  date_label: string;
  image_url: string;
};

export type FooterSettings = {
  description: string;
  phone: string;
  email: string;
  address: string;
};

export type HomeData = {
  slide: HomeSlide;
  services: HomeService[];
  stats: HomeStat[];
  news: HomeNews[];
  footer: FooterSettings;
};

export const fallbackData: HomeData = {
  slide: {
    title: 'رادینت',
    subtitle: 'پلتفرم هوشمند خدمات تصویربرداری پزشکی',
    description:
      'ارائه‌دهنده راهکارهای نوین در حوزه تله‌رادیولوژی، مشاوره تخصصی و فروش تجهیزات و ملزومات تصویربرداری',
    image_url: '/assets/images/hero-radinat-radiology.png.png',
    primary_cta: 'خدمات ما',
    secondary_cta: 'درباره ما',
  },
  services: [
    {
      name: 'فروشگاه',
      description: 'تجهیزات و ملزومات تصویربرداری',
      icon_key: 'store',
      color_theme: 'green',
      cta_label: 'مشاهده محصولات',
    },
    {
      name: 'تله‌رپورت',
      description: 'ارسال و تفسیر آنلاین تصاویر پزشکی',
      icon_key: 'teleradiology',
      color_theme: 'lavender',
      cta_label: 'استفاده از سرویس',
    },
    {
      name: 'مشاوره',
      description: 'مشاوره تخصصی با رادیولوژیست‌ها',
      icon_key: 'consultation',
      color_theme: 'peach',
      cta_label: 'درخواست مشاوره',
    },
    {
      name: 'سایر خدمات',
      description: 'خدمات تخصصی برند رادینت',
      icon_key: 'services',
      color_theme: 'blue',
      cta_label: 'مشاهده خدمات',
    },
  ],
  stats: [
    { label: 'تعداد درخواست‌ها', value: '۳۴,۷۸۹', icon_key: 'activity' },
    { label: 'پزشکان', value: '۲,۳۴۵', icon_key: 'users' },
    { label: 'مراکز طرف قرارداد', value: '۵۶۷', icon_key: 'building' },
    { label: 'کاربران فعال', value: '۱۲,۴۵۶', icon_key: 'user-check' },
  ],
  news: [
    {
      title: 'توسعه خدمات تصویربرداری برون‌سپاری',
      date_label: '۱۴۰۳/۰۲/۱۵',
      image_url: '/assets/images/news-1.png.png',
    },
    {
      title: 'مزایای تله‌رادیولوژی در تشخیص سریع‌تر',
      date_label: '۱۴۰۳/۰۲/۰۷',
      image_url: '/assets/images/news-2.png.png',
    },
  ],
  footer: {
    description:
      'پلتفرم هوشمند خدمات تصویربرداری پزشکی با هدف ساده‌تر کردن دسترسی به خدمات تخصصی',
    phone: '۰۲۱-۱۲۳۴۵۶۷۸',
    email: 'info@radinat.com',
    address: 'تهران، خیابان ولیعصر',
  },
};
