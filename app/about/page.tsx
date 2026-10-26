import './about.css';
import { Metadata } from 'next';
import { AboutPage } from '@/components/about-page';
import { getAboutData } from '@/lib/about-data';

export const metadata: Metadata = {
  title: 'درباره ما | رادینت',
  description: 'آشنایی با چشم‌انداز، ماموریت، ارزش‌ها، تیم متخصص و گواهینامه‌های شرکت رادینت در حوزه تصویربرداری پزشکی و تله‌رادیولوژی',
};

export const revalidate = 30;

export default async function AboutRoute(): Promise<JSX.Element> {
  const data = await getAboutData();
  return <AboutPage initialData={data} />;
}
