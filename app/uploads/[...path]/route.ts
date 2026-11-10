import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { BACKEND_ORIGIN } from '@/lib/auth-client';

export const dynamic = 'force-dynamic';

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

function resolveUploadFile(segments: string[]): string | null {
  const safeSegments = segments.filter((s) => s && !s.includes('..') && !s.includes('/') && !s.includes('\\'));
  if (safeSegments.length === 0) return null;

  const cwd = process.cwd();
  const candidateRoots = [
    path.join(cwd, 'public', 'uploads'),
    path.join(cwd, 'frontend', 'public', 'uploads'),
    path.join(cwd, 'uploads'),
    path.join(cwd, 'backend', 'uploads'),
    path.resolve(cwd, '..', 'backend', 'uploads'),
  ];

  for (const root of candidateRoots) {
    const candidate = path.join(root, ...safeSegments);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
}

export async function GET(
  _req: NextRequest,
  context: { params: { path: string[] } },
) {
  const segments = Array.isArray(context.params?.path) ? context.params.path : [];
  const safeSegments = segments.filter((s) => s && !s.includes('..') && !s.includes('/') && !s.includes('\\'));
  if (safeSegments.length === 0) {
    return new NextResponse('File not found', { status: 404 });
  }

  const filePath = resolveUploadFile(safeSegments);
  if (filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_BY_EXT[ext] || 'application/octet-stream';
    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }

  try {
    const upstreamUrl = `${BACKEND_ORIGIN}/uploads/${safeSegments.map(encodeURIComponent).join('/')}`;
    const upstream = await fetch(upstreamUrl, { cache: 'no-store' });
    if (upstream.ok) {
      const arrayBuffer = await upstream.arrayBuffer();
      const ext = path.extname(safeSegments[safeSegments.length - 1] || '').toLowerCase();
      const contentType =
        upstream.headers.get('content-type') || MIME_BY_EXT[ext] || 'application/octet-stream';
      return new NextResponse(Buffer.from(arrayBuffer), {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }
  } catch {
    // Ignore upstream fetch error and return 404 below
  }

  return new NextResponse('File not found', { status: 404 });
}
