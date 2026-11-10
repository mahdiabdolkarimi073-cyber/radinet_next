import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { resolveBackendApiUrlForRequest } from '@/lib/auth-client';

export const dynamic = 'force-dynamic';

function getDbFilePath(): string {
  const localData = path.join(process.cwd(), 'data', 'radinet_db.json');
  if (fs.existsSync(localData)) return localData;
  const frontendData = path.join(process.cwd(), 'frontend', 'data', 'radinet_db.json');
  if (fs.existsSync(frontendData)) return frontendData;
  return localData;
}

export async function GET(req: NextRequest) {
  try {
    const backendUrl = resolveBackendApiUrlForRequest(req.headers.get('host'));
    const res = await fetch(`${backendUrl}/admin/settings/public`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.siteName === 'string') {
        return NextResponse.json(data);
      }
    }
  } catch {}

  try {
    const file = getDbFilePath();
    if (fs.existsSync(file)) {
      const db = JSON.parse(fs.readFileSync(file, 'utf-8'));
      if (db.generalSettings) {
        return NextResponse.json({
          siteName: db.generalSettings.siteName || 'رادینت',
          logoUrl: db.generalSettings.logoUrl || '',
        });
      }
    }
  } catch {}

  return NextResponse.json({ siteName: 'رادینت', logoUrl: '' });
}
