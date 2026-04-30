/**
 * Drizzle Kit konfiguratsiyasi.
 *
 * Task: T5.01 (S05 — Backend Foundation)
 *
 * - Schema: `lib/db/schema/` ostidagi barcha `.ts` fayllar
 * - Migration: `lib/db/migrations/` da SQL fayllar saqlanadi
 * - Driver: `neon-http` (Vercel Edge Runtime'da ham, Node'da ham ishlaydi)
 *
 * Ishlatish:
 *   pnpm exec drizzle-kit generate   # schema diff'dan migration SQL
 *   pnpm exec drizzle-kit push       # Neon DB'ga apply (dev/staging)
 *   pnpm exec drizzle-kit studio     # browser-based DB inspector
 *   pnpm exec drizzle-kit check      # CI: schema vs migration files drift
 */
import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && process.env.NODE_ENV !== 'test') {
  // Fail-fast: drizzle-kit ishlatish DATABASE_URL talab qiladi.
  // Test/CI da .env.example dan template ishlatiladi (drift check uchun).
  console.warn('[drizzle.config] DATABASE_URL not set. Set it in .env.local or pass via CLI.');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './lib/db/schema/*',
  out: './lib/db/migrations',
  dbCredentials: {
    url: databaseUrl ?? 'postgresql://placeholder',
  },
  // Migration konventsiyasi — additive-only (R01 mitigation)
  strict: true,
  verbose: true,
});
