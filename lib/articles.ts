import { BACKEND_URL as backendUrl } from './auth-client';
export type { Article, RealStats, ArticleGroup } from './articles-types';
export {
  toShamsiDate,
  toShamsiDayMonth,
  isDateToday,
  getArticleGroupTitle,
  groupArticlesByShamsiDate,
} from './articles-types';
import type { Article, RealStats } from './articles-types';

export async function getPublishedArticles(limit?: number): Promise<Article[]> {
  try {
    const url = `${backendUrl}/articles${limit ? `?limit=${limit}` : ''}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (err) {
    console.error('Error fetching published articles from backend:', err);
  }
  return [];
}

export async function getAllArticles(auth?: string): Promise<Article[]> {
  try {
    const res = await fetch(`${backendUrl}/admin/articles`, {
      headers: auth ? { Authorization: auth } : {},
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (err) {
    console.error('Error fetching all articles:', err);
  }
  return getPublishedArticles();
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${backendUrl}/articles/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      return res.json();
    }
  } catch (err) {
    console.error('Error fetching article by slug from backend:', err);
  }
  return null;
}

export async function createArticle(input: Partial<Article>, auth?: string): Promise<Article | null> {
  try {
    const res = await fetch(`${backendUrl}/admin/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(input),
    });
    if (res.ok) {
      return res.json();
    }
  } catch (err) {
    console.error('Error creating article in backend:', err);
  }
  return null;
}

export async function updateArticle(id: string, input: Partial<Article>, auth?: string): Promise<Article | null> {
  try {
    const res = await fetch(`${backendUrl}/admin/articles/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(input),
    });
    if (res.ok) {
      return res.json();
    }
  } catch (err) {
    console.error('Error updating article in backend:', err);
  }
  return null;
}

export async function deleteArticle(id: string, auth?: string): Promise<boolean> {
  try {
    const res = await fetch(`${backendUrl}/admin/articles/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: auth ? { Authorization: auth } : {},
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getRealDatabaseStats(): Promise<RealStats> {
  try {
    const res = await fetch(`${backendUrl}/articles/stats`, { cache: 'no-store' });
    if (res.ok) {
      return res.json();
    }
  } catch (err) {
    console.error('Error fetching stats from backend:', err);
  }
  return {
    requests: 0,
    doctors: 0,
    centers: 0,
    activeUsers: 0,
  };
}
