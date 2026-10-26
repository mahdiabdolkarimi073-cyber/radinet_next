import { NextResponse } from 'next/server';
import { getAboutData } from '@/lib/about-data';

export const revalidate = 30;

export async function GET() {
  try {
    const data = await getAboutData();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
