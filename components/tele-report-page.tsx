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
  MousePointerClick,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import type { FooterSettings } from '@/lib/home-data';
import type { TeleReportData } from '@/lib/tele-report-data';

type TeleReportPageProps = { footer: FooterSettings; data: TeleReportData };
type IconComponent = typeof BrainCircuit;

const icons: Record<string, IconComponent> = {
  brain: BrainCircuit,
  clock: Clock3,
  scan: ScanLine,
  shield: ShieldCheck,
  clipboard: ClipboardCheck,
  stethoscope: Stethoscope,
  download: Download,
  sparkles: Sparkles,
  file: FileCheck2,
  pointer: MousePointerClick,
  headphones: Headphones,
};

function getIcon(name: string): IconComponent {
  return icons[name] ?? BrainCircuit;
}

function GuideImage({ imageUrl }: { imageUrl: string }) {
  if (imageUrl) return <img className="tele-guide__image" src={imageUrl} alt="" />;
  return <div className="tele-guide__image" aria-hidden="true"><ImageIcon size={24} /></div>;
}

export function TeleReportPage({ footer, data }: TeleReportPageProps) {
  return (
    <main className="tele-report-page">
      <SiteHeader activePath="/tele-report" />

      <section className="tele-hero">
        <div className="container tele-hero__inner">
          <div className="tele-hero__copy">
            <span className="tele-eyebrow">{data.hero.eyebrow}</span>
            <h1>{data.hero.title}</h1>
            <h2>{data.hero.subtitle}</h2>
            <p>{data.hero.description}</p>
            <div className="tele-hero__actions">
              <a className="tele-button tele-button--primary" href="/tele-report/new">{data.hero.primaryCta} <ArrowLeft size={18} /></a>
              <a className="tele-button tele-button--secondary" href="#about">{data.hero.secondaryCta} <ArrowUpLeft size={17} /></a>
            </div>
          </div>
          <div className="tele-hero__visual">
            <img src={data.hero.imageUrl} alt="محیط هوشمند تله‌ریپورت رادینت" />
          </div>
        </div>
      </section>

      <section className="tele-features" aria-label="ویژگی‌های کلیدی">
        <div className="container tele-features__grid">
          {data.features.map((feature) => {
            const Icon = getIcon(feature.icon);
            return <article className="tele-feature-card" key={feature.title}>
              <div className="tele-icon"><Icon size={25} /></div>
              <div><h3>{feature.title}</h3><p>{feature.description}</p></div>
            </article>;
          })}
        </div>
      </section>

      <section className="tele-about" id="about">
        <div className="container tele-about__inner">
          <div className="tele-about__copy">
            <span className="tele-section-kicker">{data.about.eyebrow}</span>
            <h2>{data.about.title}</h2>
            <p>{data.about.description}</p>
            <ul>{data.about.bullets.map((bullet) => <li key={bullet}><span><Check size={15} /></span>{bullet}</li>)}</ul>
          </div>
          <div className="tele-about__media" aria-label="تصویر محیط سرویس">
            {data.about.imageUrl ? <img src={data.about.imageUrl} alt="محیط سرویس تله‌ریپورت" /> : <div className="tele-about__media-content"><ImageIcon size={48} /><span>تصویر محیط سرویس</span></div>}
          </div>
        </div>
      </section>

      <section className="tele-steps" id="steps">
        <div className="container">
          <div className="tele-section-heading"><span className="tele-section-kicker">ساده، سریع و مطمئن</span><h2>مراحل استفاده از سرویس</h2></div>
          <div className="tele-steps__grid">
            {data.steps.map((step, index) => {
              const Icon = getIcon(step.icon);
              return <div className="tele-step-wrap" key={step.number}>
                <article className="tele-step-card">
                  <div className="tele-step-card__number">{step.number}</div>
                  <div className="tele-step-card__icon"><Icon size={25} /></div>
                  <h3>{step.title}</h3><p>{step.description}</p>
                </article>
                {index < data.steps.length - 1 && <ChevronLeft className="tele-step-arrow" size={22} />}
              </div>;
            })}
          </div>
        </div>
      </section>

      <section className="tele-guide">
        <div className="container">
          <div className="tele-section-heading"><span className="tele-section-kicker">راهنمای شروع</span><h2>راهنمای استفاده</h2></div>
          <div className="tele-guide__grid">
            {data.guides.map((guide) => <article className="tele-guide-card" key={guide.number}>
              <GuideImage imageUrl={guide.imageUrl} />
              <div className="tele-guide-card__number">{guide.number}</div>
              <h3>{guide.title}</h3><p>{guide.description}</p>
            </article>)}
          </div>
        </div>
      </section>

      <section className="tele-benefits">
        <div className="container">
          <div className="tele-section-heading"><span className="tele-section-kicker">چرا رادینت؟</span><h2>مزایای استفاده از رادینت</h2></div>
          <div className="tele-benefits__grid">
            {data.benefits.map((benefit) => { const Icon = getIcon(benefit.icon); return <article className="tele-benefit" key={benefit.title}><div className="tele-benefit__icon"><Icon size={30} /></div><h3>{benefit.title}</h3><p>{benefit.description}</p></article>; })}
          </div>
        </div>
      </section>

      <section className="tele-cta">
        <div className="container"><div className="tele-cta__box"><div className="tele-cta__pattern" aria-hidden="true" /><h2>{data.cta.title}</h2><p>{data.cta.description}</p><a className="tele-button tele-button--primary" href="/tele-report/new">{data.cta.buttonLabel} <ArrowLeft size={18} /></a></div></div>
      </section>

      <SiteFooter footer={footer} />
    </main>
  );
}
