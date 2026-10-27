import { NextResponse } from 'next/server';
import { getPublishedArticles, getRealDatabaseStats } from '@/lib/articles';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
    const category = searchParams.get('category');
    const includeStats = searchParams.get('includeStats') === 'true';

    const articles = await getPublishedArticles(limit);
    const filtered = category && category !== 'all'
      ? articles.filter((a) => a.category === category)
      : articles;

    let stats = null;
    if (includeStats) {
      stats = await getRealDatabaseStats();
    }

    return NextResponse.json({
      articles: filtered,
      total: filtered.length,
      stats,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
