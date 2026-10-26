import { NextResponse } from 'next/server';
import { getArticleBySlug } from '@/lib/articles';

export async function GET(
  req: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const article = await getArticleBySlug(params.slug);
    if (!article || !article.isPublished) {
      return NextResponse.json(
        { error: 'مقاله مورد نظر یافت نشد' },
        { status: 404 },
      );
    }
    return NextResponse.json(article);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
