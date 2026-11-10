'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Search,
  Sparkles,
  Tag,
  User,
} from 'lucide-react';
import type { Article, ArticleGroup } from '@/lib/articles-types';
import { groupArticlesByShamsiDate, toShamsiDate } from '@/lib/articles-types';

type ArticlesArchiveViewProps = {
  initialGroups: ArticleGroup[];
  initialArticles: Article[];
};

export function ArticlesArchiveView({
  initialGroups,
  initialArticles,
}: ArticlesArchiveViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const set = new Set<string>();
    initialArticles.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return ['all', ...Array.from(set)];
  }, [initialArticles]);

  const filteredArticles = useMemo(() => {
    return initialArticles.filter((article) => {
      const matchSearch =
        searchQuery === '' ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === 'all' || article.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [initialArticles, searchQuery, selectedCategory]);

  const activeGroups = useMemo(() => {
    return groupArticlesByShamsiDate(filteredArticles);
  }, [filteredArticles]);

  return (
    <div className="py-10 md:py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4 border border-blue-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>دانستنی‌ها و اخبار تخصصی</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            آرشیو مقالات و اخبار رادینت
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed">
            مطالب و تحلیل‌های تخصصی در حوزه تله‌رادیولوژی، هوش مصنوعی در سلامت، پروتکل‌های بالینی و راهنمای تجهیزات پزشکی، طبقه‌بندی‌شده بر اساس تاریخ انتشار شمسی.
          </p>

          {/* Search Bar */}
          <div className="mt-8 relative max-w-xl mx-auto">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در عنوان یا متن مقالات..."
              className="w-full pr-12 pl-4 py-3.5 rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-800 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded"
              >
                پاک کردن
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          {categories.length > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'all' ? 'همه مقالات' : cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grouped Articles List */}
        {activeGroups.length > 0 ? (
          <div className="space-y-14">
            {activeGroups.map((group) => (
              <section key={group.groupKey} className="relative">
                {/* Group Header Badge */}
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-200/80">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                    {group.groupTitle}
                  </h2>
                  <span className="text-xs text-slate-500 font-normal mr-auto flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {group.displayDate}
                  </span>
                </div>

                {/* Articles Grid for this Day */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.articles.map((article) => (
                    <article
                      key={article.id}
                      className="group flex flex-col bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-blue-200 transition-all duration-200"
                    >
                      {/* Image */}
                      <Link
                        href={`/articles/${article.slug || article.id}`}
                        className="relative block aspect-16/10 overflow-hidden bg-slate-100"
                      >
                        <img
                          src={article.imageUrl || '/assets/images/hero-radinat-radiology.png.png'}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                          loading="lazy"
                        />
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-xs text-xs font-semibold text-blue-700 shadow-xs border border-white/40">
                          {article.category || 'عمومی'}
                        </span>
                      </Link>

                      {/* Content */}
                      <div className="flex-1 p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {toShamsiDate(article.publishedAt || article.createdAt)}
                            </span>
                            {article.author && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-slate-500">
                                  <User className="w-3 h-3" />
                                  {article.author}
                                </span>
                              </>
                            )}
                          </div>

                          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-2.5">
                            <Link href={`/articles/${article.slug || article.id}`}>
                              {article.title}
                            </Link>
                          </h3>

                          <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 mb-4">
                            {article.summary}
                          </p>
                        </div>

                        {/* Read more button */}
                        <div className="pt-3 border-t border-slate-100 mt-auto flex items-center justify-between">
                          <Link
                            href={`/articles/${article.slug || article.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 group-hover:text-blue-700 transition"
                          >
                            <span>مطالعه مقاله</span>
                            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                          </Link>
                          <span className="text-[11px] text-slate-400">
                            مطالعه ۵ دقیقه
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 p-8">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-2">
              مقاله‌ای یافت نشد
            </h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-4">
              با عبارت جستجوی فعلی یا دسته‌بندی انتخاب‌شده مقاله‌ای وجود ندارد.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              پاک کردن فیلترها و مشاهده همه
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
