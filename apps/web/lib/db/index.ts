/**
 * Drizzle DB instance — Neon serverless driver.
 *
 * Task: T5.01 (S05 — Backend Foundation)
 *
 * `@neondatabase/serverless` HTTP-fetch driver — Vercel Edge Runtime'da
 * ham ishlaydi (cold-start ~50ms). Node Runtime'da ham bir xil API.
 *
 * @example
 *   import { db } from '@/lib/db';
 *   import { users } from '@/lib/db/schema';
 *
 *   const allUsers = await db.select().from(users);
 *
 * Connection management:
 *   - Neon serverless driver har request'da yangi connection ochmaydi
 *     (HTTP fetch transport orqali). Pool kerakmas.
 *   - DATABASE_URL `.env.local` (dev) yoki Vercel env (prod/staging) dan
 *     o'qiladi.
 */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from './schema';

// ─── Env validation ──────────────────────────────────────────────────────────

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
        'Add it to .env.local (dev) or Vercel env vars (prod/staging). ' +
        'See lib/db/README.md for setup instructions.',
    );
  }
  return url;
}

// ─── Drizzle instance ────────────────────────────────────────────────────────

/**
 * Drizzle DB client — schema bilan typed query'lar uchun.
 *
 * Lazy init — DATABASE_URL faqat birinchi query paytida o'qiladi
 * (build-time SSG'da chaqirilmaydi, build crash bo'lmasin).
 */
export const db = drizzle(neon(getDatabaseUrl()), { schema });

export type DbClient = typeof db;

// Schema export — komponentlar `import { users } from '@/lib/db'` qilishi mumkin
export * from './schema';
