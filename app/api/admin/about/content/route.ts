import { NextResponse } from 'next/server';
import { getAllAboutContent, updateAboutContent } from '@/lib/about-data';

export async function GET() {
  try {
    const list = await getAllAboutContent();
    return NextResponse.json(list);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.key) {
      return NextResponse.json({ error: 'کلید محتوا الزامی است' }, { status: 400 });
    }
    const updated = await updateAboutContent(body.key, body);
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
