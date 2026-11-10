import { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { fallbackData } from '@/lib/home-data';
import { createHomeRepository } from '@/lib/home-repository';
import { getPublishedArticles, groupArticlesByShamsiDate } from '@/lib/articles';
import { ArticlesArchiveView } from '@/components/articles-archive-view';

export const metadata: Metadata = {
  title: 'آرشیو مقالات و اخبار | رادینت',
  description: 'آرشیو کامل مقالات، اخبار و راهنماهای تخصصی تله‌رادیولوژی و تصویربرداری پزشکی رادینت بر اساس تاریخ انتشار',
};

export const revalidate = 60;

export default async function ArticlesPage() {
  const [repo, articles] = await Promise.all([
    createHomeRepository(),
    getPublishedArticles(),
  ]);

  const footer = await repo.getFooter();
  const groups = groupArticlesByShamsiDate(articles);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800" dir="rtl">
      <SiteHeader activePath="/articles" />
      <main className="flex-1">
        <ArticlesArchiveView initialGroups={groups} initialArticles={articles} />
      </main>
      <SiteFooter footer={footer || fallbackData.footer} />
    </div>
  );
}
