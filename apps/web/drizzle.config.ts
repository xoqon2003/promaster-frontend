/**
 * Drizzle Kit konfiguratsiyasi.
 *
 * Task: T5.01 (S05 — Backend Foundation), T6.02 (env loader)
 *
 * - Schema: `lib/db/schema/` ostidagi barcha `.ts` fayllar
 * - Migration: `lib/db/migrations/` da SQL fayllar saqlanadi
 * - Driver: `neon-http` (Vercel Edge Runtime'da ham, Node'da ham ishlaydi)
 *
 * Ishlatish:
 *   pnpm exec drizzle-kit generate   # schema diff'dan migration SQL
 *   pnpm exec drizzle-kit migrate    # Neon DB'ga apply (dev/staging)
 *   pnpm exec drizzle-kit studio     # browser-based DB inspector
 *   pnpm exec drizzle-kit check      # CI: schema vs migration files drift
 *
 * Env yuklash (T6.02): drizzle-kit `.env.local` ni avtomatik o'qimaydi,
 * shuning uchun shu config ichida fs orqali yuklaymiz. Tartib:
 *   1. Mavjud `process.env.DATABASE_URL` (CI/yoki shell `export`)
 *   2. `.env.local` (lokal dev — gitignore'da)
 *   3. `.env` (umumiy default — agar bor bo'lsa)
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { defineConfig } from 'drizzle-kit';

function loadEnvFile(file: string): void {
  try {
    const content = readFileSync(resolve(process.cwd(), file), 'utf8');
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      if (key in process.env) continue; // shell override muhim
      let value = line.slice(eq + 1).trim();
      // Surround quotes (single or double) ni olib tashlash.
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  } catch {
    // Fayl yo'q — OK (CI da `.env.local` bo'lmaydi).
  }
}

if (!process.env.DATABASE_URL) loadEnvFile('.env.local');
if (!process.env.DATABASE_URL) loadEnvFile('.env');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && process.env.NODE_ENV !== 'test') {
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
