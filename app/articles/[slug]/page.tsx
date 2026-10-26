import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronLeft,
  Clock,
  Share2,
  Tag,
  User,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { fallbackData } from '@/lib/home-data';
import { createHomeRepository } from '@/lib/home-repository';
import {
  getArticleBySlug,
  getPublishedArticles,
  toShamsiDate,
} from '@/lib/articles';

type PageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) {
    return {
      title: 'مقاله یافت نشد | رادینت',
    };
  }
  return {
    title: `${article.title} | رادینت`,
    description: article.summary || article.title,
    openGraph: {
      title: article.title,
      description: article.summary,
      images: article.imageUrl ? [article.imageUrl] : [],
    },
  };
}

export const revalidate = 60;

export default async function ArticleDetailPage({ params }: PageProps) {
  const [article, allArticles, repo] = await Promise.all([
    getArticleBySlug(params.slug),
    getPublishedArticles(4),
    createHomeRepository(),
  ]);

  if (!article || (!article.isPublished && process.env.NODE_ENV === 'production')) {
    notFound();
  }

  const footer = await repo.getFooter();
  const relatedArticles = allArticles
    .filter((a) => a.id !== article.id)
    .slice(0, 3);

  // Split content by paragraphs or headers
  const contentBlocks = article.content.split('\n\n');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800" dir="rtl">
      <SiteHeader activePath="/articles" />

      <main className="flex-1 py-10 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-blue-600 transition">
              خانه
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <Link href="/articles" className="hover:text-blue-600 transition">
              آرشیو مقالات
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-800 font-medium truncate max-w-xs">
              {article.title}
            </span>
          </nav>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-semibold">
                {article.category || 'عمومی'}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {toShamsiDate(article.publishedAt || article.createdAt)}
              </span>
              {article.author && (
                <span className="flex items-center gap-1.5 text-xs text-slate-600">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {article.author}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug mb-6">
              {article.title}
            </h1>

            {/* Summary Box */}
            {article.summary && (
              <div className="bg-blue-50/70 border-r-4 border-blue-600 p-4 md:p-5 rounded-l-xl text-slate-700 text-sm md:text-base leading-relaxed">
                <p className="font-medium">{article.summary}</p>
              </div>
            )}
          </header>

          {/* Featured Image */}
          {article.imageUrl && (
            <div className="rounded-2xl overflow-hidden mb-10 shadow-sm border border-slate-200/80 bg-slate-100 aspect-16/9">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Body Content */}
          <article className="bg-white rounded-2xl p-6 md:p-10 border border-slate-200/80 shadow-xs leading-relaxed space-y-6 text-slate-700 text-base md:text-lg">
            {contentBlocks.map((block, idx) => {
              const trimmed = block.trim();
              if (trimmed.startsWith('### ')) {
                return (
                  <h3
                    key={idx}
                    className="text-xl md:text-2xl font-bold text-slate-900 mt-8 mb-3 pt-3 border-t border-slate-100"
                  >
                    {trimmed.replace('### ', '')}
                  </h3>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h2
                    key={idx}
                    className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-10 mb-4 pt-4 border-t border-slate-100"
                  >
                    {trimmed.replace('## ', '')}
                  </h2>
                );
              }
              if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
                const items = trimmed.split('\n');
                return (
                  <ul key={idx} className="list-disc list-inside space-y-2 mr-2">
                    {items.map((item, itemIdx) => (
                      <li key={itemIdx} className="text-slate-700 text-base">
                        {item.replace(/^[-•]\s*/, '')}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={idx} className="leading-loose text-slate-700 whitespace-pre-line">
                  {trimmed}
                </p>
              );
            })}
          </article>

          {/* Author & Footer info box */}
          <div className="mt-8 bg-white rounded-2xl p-6 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                {article.author ? article.author[0] : 'ر'}
              </div>
              <div>
                <span className="text-xs text-slate-400 block">نویسنده مقاله</span>
                <strong className="text-sm text-slate-800">{article.author || 'تیم تحریریه رادینت'}</strong>
              </div>
            </div>
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به همه مقالات</span>
            </Link>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-14">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  سایر مقالات جدید
                </h3>
                <Link
                  href="/articles"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>مشاهده همه</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/articles/${rel.slug || rel.id}`}
                    className="group bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md hover:border-blue-200 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-16/10 rounded-lg overflow-hidden bg-slate-100 mb-3">
                        <img
                          src={rel.imageUrl || '/assets/images/hero-radinat-radiology.png.png'}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-blue-600 mb-1 block">
                        {rel.category || 'عمومی'}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 line-clamp-2 leading-snug mb-2">
                        {rel.title}
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-2">
                      <Calendar className="w-3 h-3" />
                      {toShamsiDate(rel.publishedAt || rel.createdAt)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter footer={footer || fallbackData.footer} />
    </div>
  );
}
