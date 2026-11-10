import { NextResponse } from 'next/server';
import { generateRequestId } from '@/lib/auth-client';
import { recordFrontendAuthLog } from '@/lib/auth-logger';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const incomingHost = req.headers.get('host');
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const requestId =
      (typeof body.requestId === 'string' && body.requestId.trim()) ||
      req.headers.get('x-request-id')?.trim() ||
      generateRequestId();

    const operation = typeof body.operation === 'string' ? body.operation : 'LOGIN';
    const statusCode = typeof body.statusCode === 'number' ? body.statusCode : 0;
    const durationMs = typeof body.durationMs === 'number' ? body.durationMs : 0;
    const backendReached = Boolean(body.backendReached);
    const operationResult = body.operationResult === 'SUCCESS' ? 'SUCCESS' : 'FAILED';

    await recordFrontendAuthLog({
      requestId,
      source: 'frontend-client',
      level: operationResult === 'SUCCESS' ? 'INFO' : statusCode >= 500 || statusCode === 0 ? 'ERROR' : 'WARN',
      operation,
      method: 'POST',
      routePath: typeof body.routePath === 'string' ? body.routePath : '/api/auth/login',
      targetUrl: typeof body.targetUrl === 'string' ? body.targetUrl : '/api/auth/login',
      statusCode,
      durationMs,
      backendReached,
      dtoValidationPassed:
        typeof body.dtoValidationPassed === 'boolean' ? body.dtoValidationPassed : null,
      operationResult,
      connectionStatus:
        typeof body.connectionStatus === 'string' ? body.connectionStatus : 'NETWORK_ERROR',
      failureStage: typeof body.failureStage === 'string' ? body.failureStage : 'CLIENT_NETWORK',
      errorCategory: typeof body.errorCategory === 'string' ? body.errorCategory : 'NETWORK',
      errorMessage: typeof body.errorMessage === 'string' ? body.errorMessage : null,
      responseType: typeof body.responseType === 'string' ? body.responseType : 'network_error',
      metadata:
        body.metadata && typeof body.metadata === 'object'
          ? (body.metadata as Record<string, unknown>)
          : {},
      startedAt: typeof body.startedAt === 'string' ? body.startedAt : undefined,
      completedAt: typeof body.completedAt === 'string' ? body.completedAt : undefined,
      incomingHost,
    });

    return NextResponse.json({ ok: true, requestId });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
