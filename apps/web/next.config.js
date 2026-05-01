import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 15 (webpack, stable) — Turbopack faqat dev uchun
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
    ],
  },
};

// T5.09 — Sentry source map upload + tunnel.
// `SENTRY_AUTH_TOKEN` Vercel env'da set qilingan bo'lishi kerak (build paytda).
// Lokal build'da auth token yo'q bo'lsa, source map upload skip bo'ladi
// (silent: true).
export default withSentryConfig(withNextIntl(nextConfig), {
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
