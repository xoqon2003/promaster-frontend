/**
 * `POST /api/auth/send-otp` — OTP yuborish endpoint (S05 T5.05).
 *
 * `OTP_PROVIDER` env switcher orqali mock yoki eskiz adapter chaqiriladi
 * (default mock — Eskiz aktivatsiya defer Q1).
 *
 * Mock mode'da: console'ga `123456` kod yoziladi, real SMS yuborilmaydi.
 * Eskiz mode'da: DB'ga otp_codes INSERT + Eskiz API'ga sendSms.
 *
 * Frontend `login-form.tsx` va `otp-form.tsx` (resend) shu endpoint'ni
 * fetch qiladi — mockAdapter direct import o'rniga.
 *
 * Rate limiting: S05'da yo'q (R02 mitigation: Eskiz tier limit yetarli).
 * S08+ da Upstash Ratelimit qo'shiladi (per-phone N/min).
 */
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getOtpAdapter } from '@/lib/auth/otp-adapter';
import { PhoneSchema } from '@/lib/auth/schemas';

// ─── Request schema ──────────────────────────────────────────────────────────

const SendOtpRequestSchema = z.object({
  phone: PhoneSchema,
});

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = SendOtpRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const { expiresAt } = await getOtpAdapter().sendOtp(parsed.data.phone);
    return NextResponse.json({ ok: true, expiresAt });
  } catch (err) {
    // Eskiz API timeout / network error — adapter ichidan o'tib chiqqan.
    // PII filter Sentry config'da `beforeSend` orqali telefon raqamni maskaga
    // almashtiradi (lib/sentry/scrub-pii.ts).
    Sentry.captureException(err, {
      tags: { area: 'auth-send-otp', provider: process.env.OTP_PROVIDER ?? 'mock' },
    });
    return NextResponse.json(
      { error: "SMS yuborib bo'lmadi, biroz keyin urinib ko'ring" },
      { status: 502 },
    );
  }
}
