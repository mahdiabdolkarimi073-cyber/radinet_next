import { NextResponse } from 'next/server';
import { createHomeRepository } from '@/lib/home-repository';

export const revalidate = 60;

export async function GET() {
  try {
    const repo = await createHomeRepository();
    const data = await repo.getAll();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
