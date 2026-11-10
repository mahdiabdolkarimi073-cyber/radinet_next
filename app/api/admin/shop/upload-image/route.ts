import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { extractAdminUser } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

function hasValidMagicBytes(buf: Buffer, ext: string): boolean {
  if (buf.length < 12) return false;
  if (ext === '.jpg') {
    return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  }
  if (ext === '.png') {
    return (
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47 &&
      buf[4] === 0x0d &&
      buf[5] === 0x0a &&
      buf[6] === 0x1a &&
      buf[7] === 0x0a
    );
  }
  if (ext === '.webp') {
    const riff = buf.subarray(0, 4).toString('ascii');
    const webp = buf.subarray(8, 12).toString('ascii');
    return riff === 'RIFF' && webp === 'WEBP';
  }
  return false;
}

function getUploadDirs(): string[] {
  const dirs: string[] = [];
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, 'frontend'))) {
    dirs.push(path.join(cwd, 'frontend', 'public', 'uploads', 'products'));
    dirs.push(path.join(cwd, 'backend', 'uploads', 'products'));
  } else {
    dirs.push(path.join(cwd, 'public', 'uploads', 'products'));
    const siblingBackend = path.resolve(cwd, '..', 'backend', 'uploads', 'products');
    dirs.push(siblingBackend);
  }
  return dirs;
}

export async function POST(req: NextRequest) {
  const admin = extractAdminUser(req);
  if (!admin) {
    return NextResponse.json({ message: 'دسترسی غیرمجاز؛ فقط مدیر سیستم مجاز به آپلود تصویر است.' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string' || !('arrayBuffer' in file)) {
      return NextResponse.json({ message: 'فایل تصویر ارسال نشده است.' }, { status: 400 });
    }

    const mimeType = (file.type || '').toLowerCase().trim();
    const safeExt = ALLOWED_MIME_TYPES[mimeType];
    if (!safeExt) {
      return NextResponse.json(
        { message: 'فرمت تصویر مجاز نیست. فقط فرمت‌های JPG، PNG و WebP پشتیبانی می‌شوند.' },
        { status: 400 },
      );
    }

    if (file.size <= 0) {
      return NextResponse.json({ message: 'فایل تصویر خالی است.' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: 'حجم تصویر بیش از حد مجاز است (حداکثر ۵ مگابایت).' },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!hasValidMagicBytes(buffer, safeExt)) {
      return NextResponse.json(
        { message: 'محتوای فایل با فرمت تصویر مطابقت ندارد یا فایل آسیب دیده است.' },
        { status: 400 },
      );
    }

    const fileName = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 9)}${safeExt}`;
    const targetDirs = getUploadDirs();

    for (const dir of targetDirs) {
      try {
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, fileName), buffer);
      } catch {
        // Ignore secondary directory write errors if primary succeeds
      }
    }

    return NextResponse.json(
      {
        url: `/uploads/products/${fileName}`,
        fileName,
      },
      { status: 201 },
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در آپلود تصویر محصول' },
      { status: 400 },
    );
  }
}
