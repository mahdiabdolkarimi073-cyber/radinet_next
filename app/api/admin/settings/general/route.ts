import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { BACKEND_URL as backendUrl } from '@/lib/auth-client';

export const dynamic = 'force-dynamic';

function getDbFilePath(): string {
  const localData = path.join(process.cwd(), 'data', 'radinet_db.json');
  if (fs.existsSync(localData)) return localData;
  const frontendData = path.join(process.cwd(), 'frontend', 'data', 'radinet_db.json');
  if (fs.existsSync(frontendData)) return frontendData;
  return localData;
}

function readLocalSettings(): Record<string, unknown> {
  try {
    const file = getDbFilePath();
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      return data.generalSettings || { siteName: 'رادینت', logoUrl: '' };
    }
  } catch {}
  return { siteName: 'رادینت', logoUrl: '' };
}

function writeLocalSettings(settings: Record<string, unknown>): void {
  try {
    const file = getDbFilePath();
    let data: any = {};
    if (fs.existsSync(file)) {
      data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
    data.generalSettings = { ...(data.generalSettings || {}), ...settings };
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
}

export async function GET(req: Request) {
  const authorization = req.headers.get('authorization');
  try {
    const response = await fetch(`${backendUrl}/admin/settings/general`, {
      headers: authorization ? { Authorization: authorization } : {},
      cache: 'no-store',
    });
    if (response.ok) {
      const data = await response.json();
      if (data && typeof data === 'object') {
        return NextResponse.json(data);
      }
    }
  } catch {
    // Proceed to local storage
  }

  const local = readLocalSettings();
  return NextResponse.json(local);
}

export async function PATCH(req: Request) {
  try {
    const authorization = req.headers.get('authorization');
    const body = await req.json();

    // 1. Persist locally to radinet_db.json to guarantee preservation
    writeLocalSettings(body);

    // 2. Also try syncing to NestJS backend if available
    try {
      const response = await fetch(`${backendUrl}/admin/settings/general`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(authorization ? { Authorization: authorization } : {}),
        },
        body: JSON.stringify(body),
        cache: 'no-store',
      });
      if (response.ok) {
        const backendData = await response.json().catch(() => null);
        if (backendData) {
          writeLocalSettings(backendData);
          return NextResponse.json(backendData);
        }
      }
    } catch {
      // Backend unavailable; local persistence succeeded
    }

    const current = readLocalSettings();
    return NextResponse.json(current);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'ذخیره تنظیمات ناموفق بود.' },
      { status: 500 },
    );
  }
}
