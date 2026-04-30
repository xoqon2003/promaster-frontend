/**
 * Sentry edge SDK init — Edge runtime (middleware, edge routes).
 *
 * Task: T5.09 (S05 Backend Foundation)
 *
 * Edge runtime — Vercel'da middleware va `runtime: 'edge'` API route'lar.
 * `instrumentation.ts` `register()` ichida `process.env.NEXT_RUNTIME === 'edge'`
 * shartida import qilinadi.
 */
import * as Sentry from '@sentry/nextjs';

import { scrubPhoneDeep } from '@/lib/sentry/scrub-pii';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  enabled: process.env.NODE_ENV === 'production',

  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,

  tracesSampleRate: 0.1,

  beforeSend(event) {
    return scrubPhoneDeep(event);
  },

  beforeBreadcrumb(breadcrumb) {
    return scrubPhoneDeep(breadcrumb);
  },
});
