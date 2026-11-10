import type { HomeSlide, HomeService, HomeStat, HomeNews, FooterSettings, HomeData } from '@/lib/home-data';
import { fallbackData } from '@/lib/home-data';

export type HomeRepository = {
  getSlide: () => Promise<HomeSlide | null>;
  getServices: () => Promise<HomeService[]>;
  getStats: () => Promise<HomeStat[]>;
  getNews: () => Promise<HomeNews[]>;
  getFooter: () => Promise<FooterSettings>;
  getAll: () => Promise<HomeData>;
};

export async function createHomeRepository(): Promise<HomeRepository> {
  return createApiRepository();
}

function createApiRepository(): HomeRepository {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  async function fetchTable<T>(table: string, queryParams?: string): Promise<T[]> {
    if (!baseUrl || !apiKey) return [];
    const url = `${baseUrl}/rest/v1/${table}?${queryParams ?? ''}`;
    const res = await fetch(url, {
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  return {
    async getSlide() {
      const rows = await fetchTable<HomeSlide>(
        'home_slides',
        'is_published=eq.true&order=display_order.asc&limit=1',
      );
      return rows[0] ?? null;
    },

    async getServices() {
      return fetchTable<HomeService>(
        'home_services',
        'is_published=eq.true&order=display_order.asc',
      );
    },

    async getStats() {
      try {
        const { getRealDatabaseStats } = await import('@/lib/articles');
        const stats = await getRealDatabaseStats();
        return [
          { label: 'تعداد درخواست‌ها', value: stats.requests.toLocaleString('fa-IR'), icon_key: 'activity' },
          { label: 'پزشکان', value: stats.doctors.toLocaleString('fa-IR'), icon_key: 'users' },
          { label: 'مراکز طرف قرارداد', value: stats.centers.toLocaleString('fa-IR'), icon_key: 'building' },
          { label: 'کاربران فعال', value: stats.activeUsers.toLocaleString('fa-IR'), icon_key: 'user-check' },
        ];
      } catch {
        return [
          { label: 'تعداد درخواست‌ها', value: '۰', icon_key: 'activity' },
          { label: 'پزشکان', value: '۰', icon_key: 'users' },
          { label: 'مراکز طرف قرارداد', value: '۰', icon_key: 'building' },
          { label: 'کاربران فعال', value: '۰', icon_key: 'user-check' },
        ];
      }
    },

    async getNews() {
      try {
        const { getPublishedArticles, toShamsiDate } = await import('@/lib/articles');
        const articles = await getPublishedArticles(4);
        if (articles.length > 0) {
          return articles.map((art) => ({
            id: art.id,
            title: art.title,
            slug: art.slug,
            summary: art.summary,
            content: art.content,
            date_label: toShamsiDate(art.publishedAt || art.createdAt),
            image_url: art.imageUrl,
            category: art.category,
            author: art.author,
            published_at: art.publishedAt,
          }));
        }
      } catch (err) {
        console.error('Error fetching articles from db:', err);
      }
      return [];
    },

    async getFooter() {
      if (!baseUrl || !apiKey) return fallbackData.footer;
      const url = `${baseUrl}/rest/v1/site_settings?setting_key=eq.footer&limit=1`;
      const res = await fetch(url, {
        headers: {
          apikey: apiKey,
          Authorization: `Bearer ${apiKey}`,
        },
        next: { revalidate: 60 },
      });
      if (!res.ok) return fallbackData.footer;
      const rows = await res.json();
      if (!Array.isArray(rows) || !rows[0]) return fallbackData.footer;
      return { ...fallbackData.footer, ...rows[0].setting_value };
    },

    async getAll() {
      const [slide, services, stats, news, footer] = await Promise.all([
        this.getSlide(),
        this.getServices(),
        this.getStats(),
        this.getNews(),
        this.getFooter(),
      ]);
      return {
        slide: slide ?? fallbackData.slide,
        services: services.length ? services : fallbackData.services,
        stats: stats.length ? stats : fallbackData.stats,
        news: news.length ? news : fallbackData.news,
        footer,
      };
    },
  };
}
