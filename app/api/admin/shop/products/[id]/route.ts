import { NextResponse } from 'next/server';
import {
  adminDeleteShopProductServer,
  adminUpdateShopProductServer,
  getShopProductBySlugServer,
} from '@/lib/shop-storage';
import { getAuthorizationHeader } from '@/lib/server-auth';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    const product = await getShopProductBySlugServer(id);
    if (!product) {
      return NextResponse.json({ error: 'محصول یافت نشد.' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطا در دریافت محصول';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    const body = await req.json();
    const auth = getAuthorizationHeader(req, 'admin');
    const updated = await adminUpdateShopProductServer(id, body, auth);
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ویرایش محصول با خطا مواجه شد.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    const body = await req.json();
    const auth = getAuthorizationHeader(req, 'admin');
    const updated = await adminUpdateShopProductServer(id, body, auth);
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ویرایش محصول با خطا مواجه شد.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    const auth = getAuthorizationHeader(req, 'admin');
    const ok = await adminDeleteShopProductServer(id, auth);
    if (!ok) {
      return NextResponse.json({ error: 'محصول یافت نشد.' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'حذف محصول با خطا مواجه شد.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
