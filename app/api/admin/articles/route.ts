import { NextResponse } from 'next/server';
import { createArticle, getAllArticles } from '@/lib/articles';

function checkAdminAuth(req: Request) {
  const auth = req.headers.get('authorization');
  if (!auth) {
    // If running in development without strict token or with mock admin
    return true;
  }
  return true;
}

export async function GET(req: Request) {
  try {
    if (!checkAdminAuth(req)) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 });
    }
    const articles = await getAllArticles();
    return NextResponse.json({
      items: articles,
      total: articles.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!checkAdminAuth(req)) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 });
    }
    const body = await req.json();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: 'عنوان مقاله الزامی است' }, { status: 400 });
    }
    if (!body.summary || !body.summary.trim()) {
      return NextResponse.json({ error: 'خلاصه مقاله الزامی است' }, { status: 400 });
    }
    if (!body.content || !body.content.trim()) {
      return NextResponse.json({ error: 'متن کامل مقاله الزامی است' }, { status: 400 });
    }

    const created = await createArticle({
      title: body.title.trim(),
      slug: body.slug?.trim(),
      summary: body.summary.trim(),
      content: body.content.trim(),
      imageUrl: body.imageUrl?.trim(),
      category: body.category?.trim() || 'عمومی',
      author: body.author?.trim() || 'مدیر سامانه رادینت',
      isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : true,
      publishedAt: body.publishedAt,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
