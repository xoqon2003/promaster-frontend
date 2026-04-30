# Drizzle DB Layer

> Sprint S05 — Backend Foundation. Mavzu: Postgres + Drizzle ORM.
> Stack qarorlari: [`docs/sprints/S05/planning.md`](../../../../../docs/sprints/S05/planning.md)

---

## Tarkib

- `index.ts` — Drizzle DB client (Neon serverless driver)
- `schema/` — table definitions (T5.02'da to'ldiriladi)
- `migrations/` — auto-generated SQL (drizzle-kit)

---

## Setup (T5.01 — bir martalik)

### 1. Neon project yaratish

1. https://console.neon.tech ga kiring
2. **Create project**:
   - Nom: `promaster-db`
   - Region: **EU Central (Frankfurt)** — UZ → ~80ms latency
   - PostgreSQL version: 16 (default)
3. Default branch `main` avtomatik yaratiladi
4. **Branches** sahifasiga kiring → `+ New branch` → nom `staging`
   (bu staging deploy uchun alohida DB bo'ladi)
5. Connection string'larni `Dashboard → Connection Details`'dan
   nusxalang:
   - `main` connection → **production-like** (S05 staging URL'i shu yerda)
   - `staging` connection → **development/test** (lokal va CI)

### 2. `.env.local` ga qo'shish

```bash
# apps/web/.env.local
DATABASE_URL="postgres://USER:PASSWORD@ep-XXX.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

> ⚠️ `.env.local` `.gitignore`'da — **commit qilmang**!

### 3. Smoke test

```bash
cd apps/web
pnpm exec tsx -e "import { db } from './lib/db'; import { sql } from 'drizzle-orm'; db.execute(sql\`SELECT 1\`).then(r => console.log('OK', r))"
```

Kutilgan natija: `OK [{ '?column?': 1 }]`

---

## Drizzle Kit komandalari

```bash
# Schema o'zgardi → migration SQL generate (lib/db/migrations/)
pnpm exec drizzle-kit generate

# Generated SQL'ni Neon DB'ga apply (dev only — prod'da migrations CI orqali)
pnpm exec drizzle-kit push

# Browser-based DB inspector (table'lar, ma'lumotlar, query runner)
pnpm exec drizzle-kit studio
# → https://local.drizzle.studio

# CI: schema vs migration files mosligini tekshirish
pnpm exec drizzle-kit check
```

---

## Konventsiyalar (R01 mitigation)

### Migration safety

- **Additive-only S05-S07 da:** no DROP COLUMN, no RENAME COLUMN, no
  ALTER TYPE incompatible
- **Tomb-stoning:** column'ni o'chirish o'rniga `deprecated_xxx` rename
  qilib qoldirish, keyingi sprint'da olib tashlash
- **Manual SQL review:** auto-generated `lib/db/migrations/*.sql`
  fayllar har doim PR'da ko'rib chiqiladi

### Branch DB per PR

Neon'da har feature branch o'z DB branch'iga ega bo'lishi mumkin
(Neon Pro tier'da auto-branching). S05'da manual:

```bash
# Yangi feature branch boshlanganda Neon'da branch yaratish:
neonctl branches create --name feat/S05-backend-foundation \
  --parent main --project-id PROJECT_ID
```

CI workflow `db-drift.yml` (T5.10) shu pattern'ni avtomatlashtiradi.

---

## Connection management

`@neondatabase/serverless` HTTP-fetch transport orqali ishlaydi:

- Pool kerakmas — har query alohida HTTPS request
- Edge Runtime mosligi (Vercel Edge Functions)
- Cold-start ~50ms (Frankfurt PoP'dan)

WebSocket transport (`drizzle-orm/neon-serverless`) ham bor — long-running
operatsiyalar uchun (S06+ realtime tracking'da kerak bo'lishi mumkin).
S05'da HTTP yetarli.

---

## Type sharing

Drizzle schema'lardan `drizzle-zod` orqali zod schema generate
qilinadi. Bu zod'lar `packages/api-client` (workspace) ichida
re-export qilinadi va frontend formslari iste'mol qiladi.

```ts
// lib/db/schema/users.ts (T5.02 da yaratiladi)
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const usersTable = pgTable('users', { ... });
export const UserInsertSchema = createInsertSchema(usersTable);
export const UserSelectSchema = createSelectSchema(usersTable);
```

R03 (schema drift) mitigation — frontend va backend bir xil zod
schema'larni iste'mol qiladi.

---

## Troubleshooting

### `DATABASE_URL environment variable is not set`

- `.env.local` faylida `DATABASE_URL=postgres://...` mavjudligini
  tekshiring
- Vercel deploy'da: Project → Settings → Environment Variables
- Build-time'da `DATABASE_URL` o'qilmaydi (lazy init) — bu OK,
  faqat runtime'da query paytida kerak

### Connection timeout (Neon free tier)

Neon free tier compute 5 daqiqa idle'dan keyin suspend bo'ladi.
Birinchi request ~1-2 sekund (cold-start). Subsequent fast.

Pro tier ($19/oy) — always-on compute. Trigger: prod traffic
boshlanganda (R09).

### Migration drift (CI red)

`drizzle-kit check` failure → kod schema va migration files mos
emas. Yechish:

```bash
pnpm exec drizzle-kit generate    # yangi migration generate
git add lib/db/migrations/
git commit -m "fix(db): regenerate migration after schema change"
```
