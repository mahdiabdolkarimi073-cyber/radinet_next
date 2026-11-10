import { NextResponse } from 'next/server';
import { deleteArticle, getArticleBySlug, updateArticle } from '@/lib/articles';

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const article = await getArticleBySlug(params.id);
    if (!article) {
      return NextResponse.json({ error: 'مقاله مورد نظر یافت نشد' }, { status: 404 });
    }
    return NextResponse.json(article);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const updated = await updateArticle(params.id, body);
    if (!updated) {
      return NextResponse.json({ error: 'مقاله مورد نظر یافت نشد' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const success = await deleteArticle(params.id);
    if (!success) {
      return NextResponse.json({ error: 'مقاله مورد نظر یافت نشد' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, message: 'مقاله با موفقیت حذف شد' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
