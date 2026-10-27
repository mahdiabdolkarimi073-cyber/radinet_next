import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE =
  process.env.BACKEND_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  'http://localhost:4000/api';

async function proxy(
  req: NextRequest,
  context: { params: { path: string[] } },
) {
  try {
    const pathSegments = context.params?.path ?? [];
    const subPath = pathSegments.join('/');
    const search = req.nextUrl.search || '';
    const targetUrl = `${BACKEND_BASE}/org/${subPath}${search}`;

    const headers: Record<string, string> = {};
    const auth = req.headers.get('authorization');
    if (auth) headers['Authorization'] = auth;

    const contentType = req.headers.get('content-type');
    let body: BodyInit | undefined = undefined;

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (contentType && contentType.includes('multipart/form-data')) {
        headers['Content-Type'] = contentType;
        const arrayBuffer = await req.arrayBuffer();
        body = Buffer.from(arrayBuffer);
      } else {
        if (contentType) headers['Content-Type'] = contentType;
        const text = await req.text();
        if (text) body = text;
      }
    }

    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      cache: 'no-store',
    });

    const responseText = await upstream.text();
    let parsed: unknown = null;
    try {
      parsed = responseText ? JSON.parse(responseText) : {};
    } catch {
      parsed = { message: responseText };
    }

    return NextResponse.json(parsed, { status: upstream.status });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'خطا در ارتباط با سرور سازمان',
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx);
}

export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx);
}

export async function PUT(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx);
}

export async function PATCH(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx);
}
