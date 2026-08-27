import {
  ArrowLeft,
  ArrowUpLeft,
  BrainCircuit,
  Check,
  ChevronLeft,
  ClipboardCheck,
  Clock3,
  Download,
  FileCheck2,
  Headphones,
  Image as ImageIcon,
  LockKeyhole,
  MousePointerClick,
  Network,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Upload,
  UsersRound,
} from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import type { FooterSettings } from '@/lib/home-data';

type TeleReportPageProps = { footer: FooterSettings };

type IconComponent = typeof BrainCircuit;

type Feature = { title: string; description: string; icon: IconComponent };

type Step = { number: string; title: string; description: string; icon: IconComponent };

type Guide = { number: string; title: string; description: string };

const features: Feature[] = [
  { title: 'تحلیل هوشمند', description: 'استفاده از هوش مصنوعی برای تحلیل دقیق تصاویر', icon: BrainCircuit },
  { title: 'سرعت بالا', description: 'تحویل گزارش‌ در کمتر از ۲۴ ساعت', icon: Clock3 },
  { title: 'دقت بالا', description: 'گزارش‌نویسی دقیق توسط متخصصان مجرب', icon: ScanLine },
  { title: 'امنیت اطلاعات', description: 'حفاظت کامل از حریم خصوصی و اطلاعات بیماران', icon: ShieldCheck },
];

const steps: Step[] = [
  { number: '۰۱', title: 'ثبت سفارش', description: 'اطلاعات بیمار و نوع تصویربرداری را وارد کنید.', icon: ClipboardCheck },
  { number: '۰۲', title: 'بررسی تخصصی', description: 'تصاویر شما توسط تیم متخصص بررسی می‌شوند.', icon: Stethoscope },
  { number: '۰۳', title: 'گزارش هوشمند', description: 'تصاویر با کمک هوش مصنوعی تحلیل می‌شوند.', icon: BrainCircuit },
  { number: '۰۴', title: 'دریافت گزارش', description: 'گزارش نهایی را به‌صورت آنلاین دریافت کنید.', icon: Download },
];

const guides: Guide[] = [
  { number: '۱', title: 'ثبت‌نام و ورود', description: 'در سامانه ثبت‌نام کنید و وارد پنل شوید.' },
  { number: '۲', title: 'ثبت سفارش', description: 'نوع تصویربرداری و اطلاعات بیمار را وارد کنید.' },
  { number: '۳', title: 'پرداخت آنلاین', description: 'هزینه را به‌صورت امن پرداخت کنید.' },
  { number: '۴', title: 'انتظار برای گزارش', description: 'وضعیت سفارش خود را در پنل دنبال کنید.' },
  { number: '۵', title: 'دریافت گزارش', description: 'گزارش نهایی را مشاهده و دانلود کنید.' },
];

const benefits: Feature[] = [
  { title: 'هزینه مناسب', description: 'کیفیت تخصصی با قیمت منصفانه', icon: Sparkles },
  { title: 'کیفیت بالا', description: 'گزارش‌های دقیق و استاندارد', icon: FileCheck2 },
  { title: 'کیفیت آسان', description: 'از هر مکان و در هر زمان', icon: MousePointerClick },
  { title: 'کاهش زمان انتظار', description: 'گزارش سریع بدون معطلی', icon: Download },
  { title: 'پشتیبانی در دسترس', description: 'همراه شما در تمام مراحل', icon: Headphones },
];

function EmptyGuideImage() {
  return <div className="tele-guide__image" aria-hidden="true"><ImageIcon size={24} /></div>;
}

export function TeleReportPage({ footer }: TeleReportPageProps) {
  return (
    <main className="tele-report-page">
      <SiteHeader activePath="/tele-report" />

      <section className="tele-hero">
        <div className="container tele-hero__inner">
          <div className="tele-hero__copy">
            <span className="tele-eyebrow">راهکار نوین تصویربرداری پزشکی</span>
            <h1>تله‌ریپورت رادینت</h1>
            <h2>گزارش هوشمند تصویربرداری پزشکی با هوش مصنوعی</h2>
            <p>با بهره‌گیری از پیشرفته‌ترین الگوریتم‌های هوش مصنوعی، تصاویر پزشکی شما را تحلیل کرده و در سریع‌ترین زمان ممکن گزارشی دقیق و قابل اعتماد ارائه می‌دهیم.</p>
            <div className="tele-hero__actions">
              <a className="tele-button tele-button--primary" href="#steps">ثبت درخواست جدید <ArrowLeft size={18} /></a>
              <a className="tele-button tele-button--secondary" href="#about">مشاهده خدمات <ArrowUpLeft size={17} /></a>
            </div>
          </div>
          <div className="tele-hero__visual">
            <img src="/assets/images/ChatGPT_Image_Aug_25,_2026,_02_46_54_PM.png" alt="محیط هوشمند تله‌ریپورت رادینت" />
          </div>
        </div>
      </section>

      <section className="tele-features" aria-label="ویژگی‌های کلیدی">
        <div className="container tele-features__grid">
          {features.map(({ title, description, icon: Icon }) => (
            <article className="tele-feature-card" key={title}>
              <div className="tele-icon"><Icon size={25} /></div>
              <div><h3>{title}</h3><p>{description}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="tele-about" id="about">
        <div className="container tele-about__inner">
          <div className="tele-about__copy">
            <span className="tele-section-kicker">آشنایی با سرویس</span>
            <h2>تله‌ریپورت رادینت چیست؟</h2>
            <p>تله‌ریپورت، یک سرویس آنلاین برای تحلیل تصاویر پزشکی با استفاده از هوش مصنوعی است. با این سرویس، می‌توانید در کوتاه‌ترین زمان ممکن گزارش دقیق و تخصصی دریافت کنید.</p>
            <ul>
              <li><span><Check size={15} /></span>تحلیل تصاویر پزشکی (X-Ray، CT، MRI و سونوگرافی)</li>
              <li><span><Check size={15} /></span>گزارش توسط متخصصان مجرب و مورد اعتماد</li>
              <li><span><Check size={15} /></span>دسترسی آسان و سریع به گزارش</li>
              <li><span><Check size={15} /></span>قابل استفاده برای پزشکان و مراکز درمانی</li>
            </ul>
          </div>
          <div className="tele-about__media" aria-label="تصویر محیط سرویس">
            <div className="tele-about__media-content"><Network size={48} /><span>محیط امن تحلیل و دریافت گزارش</span></div>
          </div>
        </div>
      </section>

      <section className="tele-steps" id="steps">
        <div className="container">
          <div className="tele-section-heading"><span className="tele-section-kicker">ساده، سریع و مطمئن</span><h2>مراحل استفاده از سرویس</h2></div>
          <div className="tele-steps__grid">
            {steps.map(({ number, title, description, icon: Icon }, index) => (
              <div className="tele-step-wrap" key={number}>
                <article className="tele-step-card">
                  <div className="tele-step-card__number">{number}</div>
                  <div className="tele-step-card__icon"><Icon size={25} /></div>
                  <h3>{title}</h3><p>{description}</p>
                </article>
                {index < steps.length - 1 && <ChevronLeft className="tele-step-arrow" size={22} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tele-guide">
        <div className="container">
          <div className="tele-section-heading"><span className="tele-section-kicker">راهنمای شروع</span><h2>راهنمای استفاده</h2></div>
          <div className="tele-guide__grid">
            {guides.map(({ number, title, description }) => (
              <article className="tele-guide-card" key={number}><EmptyGuideImage /><div className="tele-guide-card__number">{number}</div><h3>{title}</h3><p>{description}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="tele-benefits">
        <div className="container">
          <div className="tele-section-heading"><span className="tele-section-kicker">چرا رادینت؟</span><h2>مزایای استفاده از رادینت</h2></div>
          <div className="tele-benefits__grid">
            {benefits.map(({ title, description, icon: Icon }) => <article className="tele-benefit" key={title}><div className="tele-benefit__icon"><Icon size={30} /></div><h3>{title}</h3><p>{description}</p></article>)}
          </div>
        </div>
      </section>

      <section className="tele-cta">
        <div className="container"><div className="tele-cta__box"><div className="tele-cta__pattern" aria-hidden="true" /><h2>آماده‌اید تجربه جدیدی در گزارش‌دهی پزشکی را تجربه کنید؟</h2><p>با رادینت، مسیر دریافت گزارش تخصصی کوتاه‌تر و مطمئن‌تر است.</p><a className="tele-button tele-button--primary" href="#steps">همین حالا شروع کنید <ArrowLeft size={18} /></a></div></div>
      </section>

      <SiteFooter footer={footer} />
    </main>
  );
}
