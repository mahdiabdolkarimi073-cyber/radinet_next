import { NextResponse } from 'next/server';
import {
  getPublishedFaqsServer,
  getSupportContactInfoServer,
} from '@/lib/support-storage';
import { defaultFaqCategories } from '@/lib/support-data';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [contact_info, faqs] = await Promise.all([
      getSupportContactInfoServer(),
      getPublishedFaqsServer(),
    ]);

    // Extract unique categories from published FAQs
    const rawCategories = Array.from(new Set(faqs.map((f) => f.category).filter(Boolean)));
    const categories = ['همه دسته‌ها', ...rawCategories];

    return NextResponse.json({
      contact_info,
      faqs,
      categories: categories.length > 1 ? categories : defaultFaqCategories,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
