import { NextResponse } from 'next/server';
import { generateRequestId, postAuth } from '@/lib/auth-client';
import { recordFrontendAuthLog } from '@/lib/auth-logger';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const startedAt = new Date().toISOString();
  const startMs = Date.now();
  const incomingRequestId = req.headers.get('x-request-id')?.trim() || generateRequestId();
  const incomingHost = req.headers.get('host');

  let body: Record<string, unknown> | null = null;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    const durationMs = Date.now() - startMs;
    const errorMsg = 'فرمت داده‌های ارسالی به مسیر ورود معتبر نیست (Invalid JSON).';
    await recordFrontendAuthLog({
      requestId: incomingRequestId,
      source: 'frontend-proxy',
      level: 'WARN',
      operation: 'LOGIN',
      method: 'POST',
      routePath: '/api/auth/login',
      targetUrl: '/api/auth/login',
      statusCode: 400,
      durationMs,
      backendReached: false,
      dtoValidationPassed: false,
      operationResult: 'FAILED',
      connectionStatus: 'HTTP_ERROR',
      failureStage: 'FRONTEND_JSON_PARSE',
      errorCategory: 'VALIDATION',
      errorMessage: errorMsg,
      responseType: 'json',
      startedAt,
      completedAt: new Date().toISOString(),
      incomingHost,
    });

    const badRes = NextResponse.json(
      {
        ok: false,
        statusCode: 400,
        requestId: incomingRequestId,
        backendReached: false,
        stage: 'FRONTEND_JSON_PARSE',
        error: errorMsg,
      },
      { status: 400 },
    );
    badRes.headers.set('X-Request-ID', incomingRequestId);
    return badRes;
  }

  const rawEmail = typeof body?.email === 'string' ? body.email : null;
  const result = await postAuth('login', body, {
    requestId: incomingRequestId,
    incomingHost,
  });

  const finalRequestId = result.requestId || incomingRequestId;
  const telemetry = result.telemetry;
  const statusCode =
    typeof result.statusCode === 'number' && result.statusCode >= 200
      ? result.statusCode
      : result.ok
        ? 200
        : 400;

  await recordFrontendAuthLog({
    requestId: finalRequestId,
    source: 'frontend-proxy',
    level: result.ok ? 'INFO' : statusCode >= 500 || !result.backendReached ? 'ERROR' : 'WARN',
    operation: 'LOGIN',
    method: 'POST',
    routePath: '/api/auth/login',
    targetUrl: telemetry?.targetUrl ?? '/api/auth/login',
    statusCode: telemetry?.statusCode ?? statusCode,
    durationMs: telemetry?.durationMs ?? Date.now() - startMs,
    backendReached: Boolean(result.backendReached),
    dtoValidationPassed:
      result.stage === 'DTO_VALIDATION'
        ? false
        : result.backendReached
          ? true
          : null,
    operationResult: result.ok ? 'SUCCESS' : 'FAILED',
    connectionStatus: telemetry?.connectionStatus ?? (result.ok ? 'CONNECTED' : 'HTTP_ERROR'),
    failureStage: result.stage ?? telemetry?.failureStage ?? (result.ok ? 'NONE' : 'UNKNOWN'),
    errorCategory: telemetry?.errorCategory ?? (result.ok ? 'NONE' : 'AUTH'),
    errorMessage: result.ok ? null : result.error ?? 'ورود ناموفق بود',
    rawIdentifier: rawEmail,
    responseType: telemetry?.responseType ?? 'json',
    metadata: {
      responseKeys: telemetry?.responseKeys ?? [],
      payloadFields: body && typeof body === 'object' ? Object.keys(body) : [],
      code: result.code ?? null,
    },
    startedAt: telemetry?.startedAt ?? startedAt,
    completedAt: telemetry?.completedAt ?? new Date().toISOString(),
    incomingHost,
  });

  const response = NextResponse.json(
    {
      ok: result.ok,
      statusCode,
      requestId: finalRequestId,
      backendReached: Boolean(result.backendReached),
      code: result.code,
      stage: result.stage,
      token: result.token,
      user: result.user,
      error: result.error,
    },
    { status: statusCode },
  );

  response.headers.set('X-Request-ID', finalRequestId);

  if (result.ok && result.token) {
    response.cookies.set('radinet_auth_token', result.token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });
  }

  return response;
}
