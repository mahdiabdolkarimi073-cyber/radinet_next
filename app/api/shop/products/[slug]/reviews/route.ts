import { NextRequest, NextResponse } from 'next/server';
import {
  createProductReviewServer,
  getApprovedProductReviewsServer,
} from '@/lib/shop-storage';
import { extractRequestUser } from '@/lib/server-auth';
import { resolveBackendApiUrlForRequest } from '@/lib/auth-client';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: { slug: string } },
) {
  const slug = decodeURIComponent(context.params.slug || '');
  const backendUrl = resolveBackendApiUrlForRequest(req.headers.get('host'));

  try {
    const res = await fetch(`${backendUrl}/shop/products/${encodeURIComponent(slug)}/reviews`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Fall back to storage if backend unreachable
  }

  try {
    const data = await getApprovedProductReviewsServer(slug);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در دریافت نظرات محصول' },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: { slug: string } },
) {
  const user = extractRequestUser(req);
  if (!user) {
    return NextResponse.json(
      { message: 'برای ثبت نظر ابتدا وارد حساب کاربری خود شوید.' },
      { status: 401 },
    );
  }

  const slug = decodeURIComponent(context.params.slug || '');
  const body = await req.json();
  const backendUrl = resolveBackendApiUrlForRequest(req.headers.get('host'));
  const authHeader = req.headers.get('authorization') || '';

  try {
    const res = await fetch(`${backendUrl}/shop/products/${encodeURIComponent(slug)}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }
  } catch {
    // fallback
  }

  try {
    const userName =
      (typeof body?.userName === 'string' && body.userName.trim()) ||
      user.fullName ||
      (user.email ? user.email.split('@')[0] : 'کاربر رادینت');

    const result = await createProductReviewServer({
      userId: user.userId,
      userName,
      userEmail: user.email,
      productIdOrSlug: slug,
      rating: body?.rating,
      content: body?.content,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در ثبت نظر' },
      { status: 400 },
    );
  }
}
