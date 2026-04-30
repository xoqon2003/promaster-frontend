/**
 * Next.js instrumentation hook — Sentry server/edge SDK'larini yuklaydi.
 *
 * Task: T5.09 (S05 Backend Foundation)
 *
 * Next.js 15 standart hook (https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation).
 * Server start'da bir marta chaqiriladi — runtime turiga qarab tegishli
 * Sentry config import qilinadi.
 */
import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
