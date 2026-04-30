import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 15 (webpack, stable) — Turbopack faqat dev uchun
};

// T5.09 — Sentry source map upload + tunnel.
// `SENTRY_AUTH_TOKEN` Vercel env'da set qilingan bo'lishi kerak (build paytda).
// Lokal build'da auth token yo'q bo'lsa, source map upload skip bo'ladi
// (silent: true).
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG ?? 'smart-technologies-group',
  project: process.env.SENTRY_PROJECT ?? 'promaster-frontend',

  // CI build log'ini iflos qilmaslik
  silent: !process.env.CI,

  // Build paytida source map yuklash
  widenClientFileUpload: true,

  // Ad-blocker'lardan o'tish uchun — `/monitoring` route'i tunnel qiladi
  tunnelRoute: '/monitoring',

  // SDK paketini qisqartirish — debug logger productionda kerak emas
  disableLogger: true,
});
