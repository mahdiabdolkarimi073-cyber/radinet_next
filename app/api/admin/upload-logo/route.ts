import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'فایل لوگو ارسال نشده است.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate size (max 5MB)
    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'حجم فایل لوگو نباید بیشتر از ۵ مگابایت باشد.' }, { status: 400 });
    }

    // Determine extension
    let ext = '.png';
    const name = file.name || '';
    const dotIdx = name.lastIndexOf('.');
    if (dotIdx !== -1) {
      const parsedExt = name.slice(dotIdx).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.svg', '.webp'].includes(parsedExt)) {
        ext = parsedExt;
      }
    }

    const filename = `logo-${Date.now()}${ext}`;

    // Target public/uploads folder
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({ ok: true, url: publicUrl });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'خطا در بارگذاری فایل لوگو.' },
      { status: 500 },
    );
  }
}
