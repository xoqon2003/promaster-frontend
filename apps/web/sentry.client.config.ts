/**
 * Sentry client SDK init — browser bundle.
 *
 * Task: T5.09 (S05 Backend Foundation)
 *
 * Bu fayl client tomonida (`window`) avtomatik yuklanadi. Next.js 15 da
 * `instrumentation-client.ts` muqobil — biz eski `sentry.client.config.ts`
 * pattern'ni saqlab qoldik (kamroq disruption, build pipeline avval ishlagan).
 *
 * PII filter (R: GDPR/UZ qonun): O'zbek telefon raqami (+998XXXXXXXXX)
 * `+998*********` ga maskalanadi `beforeSend` va `beforeBreadcrumb` ichida.
 */
import * as Sentry from '@sentry/nextjs';

import { scrubPhoneDeep } from '@/lib/sentry/scrub-pii';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Faqat staging/prod'da error yuborish — local dev'da quiet
  enabled: process.env.NODE_ENV === 'production',

  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,

  // Tracing — barcha tranzaktsiyalar emas, 10% sample (cost limit)
  tracesSampleRate: 0.1,

  // Replay — error'da 100%, normal session'da 0% (privacy + cost)
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  beforeSend(event) {
    return scrubPhoneDeep(event);
  },

  beforeBreadcrumb(breadcrumb) {
    return scrubPhoneDeep(breadcrumb);
  },
});
