import { NextRequest, NextResponse } from 'next/server';
import {
  getPublishedFaqsServer,
  getSupportContactInfoServer,
} from '@/lib/support-storage';
import { defaultFaqCategories } from '@/lib/support-data';
import {
  createSupportReviewServer,
  getApprovedSupportReviewsServer,
} from '@/lib/shop-storage';
import { extractRequestUser } from '@/lib/server-auth';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [contact_info, faqs, supportReviews] = await Promise.all([
      getSupportContactInfoServer(),
      getPublishedFaqsServer(),
      getApprovedSupportReviewsServer(),
    ]);

    // Extract unique categories from published FAQs
    const rawCategories = Array.from(new Set(faqs.map((f) => f.category).filter(Boolean)));
    const categories = ['همه دسته‌ها', ...rawCategories];

    return NextResponse.json({
      contact_info,
      faqs,
      categories: categories.length > 1 ? categories : defaultFaqCategories,
      reviews: supportReviews.items,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = extractRequestUser(req);
  if (!authUser) {
    return NextResponse.json(
      { message: 'برای ثبت نظر در بخش پشتیبانی، لطفاً ابتدا وارد حساب کاربری خود شوید.' },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    const created = await createSupportReviewServer({
      userId: authUser.userId,
      userName: authUser.fullName || 'کاربر رادینت',
      userEmail: authUser.email,
      rating: body?.rating,
      content: body?.content,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در ثبت نظر پشتیبانی' },
      { status: 400 },
    );
  }
}
