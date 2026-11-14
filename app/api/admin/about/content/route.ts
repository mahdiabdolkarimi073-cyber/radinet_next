import { NextResponse } from 'next/server';
import { getAllAboutContent, updateAboutContent } from '@/lib/about-data';
import { getAuthorizationHeader } from '@/lib/server-auth';

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
    const auth = getAuthorizationHeader(req, 'admin');
    const updated = await updateAboutContent(body.key, body, auth);
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
