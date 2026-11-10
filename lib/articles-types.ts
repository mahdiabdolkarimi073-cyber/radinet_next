// Client-safe types and Shamsi date utilities for articles (Zero Node.js 'fs' dependencies)

export type Article = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  imageUrl: string;
  category: string;
  author: string;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type RealStats = {
  requests: number;
  doctors: number;
  centers: number;
  activeUsers: number;
};

export type ArticleGroup = {
  groupKey: string;
  groupTitle: string;
  displayDate: string;
  articles: Article[];
};

export function toShamsiDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  } catch {
    return '—';
  }
}

export function toShamsiDayMonth(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      day: 'numeric',
      month: 'long',
    }).format(d);
  } catch {
    return '';
  }
}

export function isDateToday(dateInput: string | Date): boolean {
  try {
    const d = new Date(dateInput);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  } catch {
    return false;
  }
}

export function getArticleGroupTitle(dateInput: string | Date): string {
  if (isDateToday(dateInput)) {
    return 'مقالات امروز';
  }
  const dayMonth = toShamsiDayMonth(dateInput);
  return dayMonth ? `مقالات ${dayMonth}` : 'مقالات';
}

export function groupArticlesByShamsiDate(articles: Article[]): ArticleGroup[] {
  const groupsMap = new Map<string, ArticleGroup>();

  for (const article of articles) {
    const dateSource = article.publishedAt || article.createdAt;
    const d = new Date(dateSource);
    const dateKey = !isNaN(d.getTime())
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      : 'other';

    const groupTitle = getArticleGroupTitle(dateSource);
    const displayDate = toShamsiDate(dateSource);

    if (!groupsMap.has(dateKey)) {
      groupsMap.set(dateKey, {
        groupKey: dateKey,
        groupTitle,
        displayDate,
        articles: [],
      });
    }

    groupsMap.get(dateKey)!.articles.push(article);
  }

  // Sort groups by date descending
  return Array.from(groupsMap.values()).sort((a, b) => {
    if (a.groupKey === 'other') return 1;
    if (b.groupKey === 'other') return -1;
    return b.groupKey.localeCompare(a.groupKey);
  });
}
