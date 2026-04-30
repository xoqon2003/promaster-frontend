/**
 * Sentry smoke test endpoint — T5.09 acceptance criterion #2.
 *
 * `GET /api/sentry-smoke?phone=+998901234567` — intentional throw + PII.
 * Sentry'ga error keladi, telefon raqami `+998*********` ko'rinishida
 * masklangan bo'lishi kerak.
 *
 * Production'da o'chirilgan: env `SENTRY_SMOKE_ENABLED=true` bo'lsa ishlaydi.
 * Default — 404 (pre-prod tasodifiy hit'lardan himoya).
 */
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (process.env.SENTRY_SMOKE_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const url = new URL(request.url);
  const phone = url.searchParams.get('phone') ?? '+998901234567';

  // PII filter test — bu xato Sentry'da ko'rinishida raqam masklangan bo'ladi
  throw new Error(`Sentry smoke test — user ${phone} triggered intentional error`);
}
