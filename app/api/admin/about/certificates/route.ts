import { NextResponse } from 'next/server';
import { addCertificate, getAllCertificates } from '@/lib/about-data';
import { getAuthorizationHeader } from '@/lib/server-auth';

export async function GET() {
  try {
    const list = await getAllCertificates();
    return NextResponse.json(list);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || !body.imageUrl) {
      return NextResponse.json({ error: 'عنوان و تصویر گواهینامه الزامی است' }, { status: 400 });
    }
    const auth = getAuthorizationHeader(req, 'admin');
    const created = await addCertificate(body, auth);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
