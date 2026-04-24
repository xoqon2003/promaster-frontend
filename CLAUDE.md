# UstaTop.uz — Claude Code Context

Bu fayl Claude Code agentiga loyihani tushuntirish uchun mo'ljallangan.
Loyiha ildiziga ko'chirib qo'ying (`D:\Loyihalar 2026 yil\ProMaster\Promaster\CLAUDE.md`).

---

## 1. Loyiha Haqida

**UstaTop.uz** — O'zbekistondagi xizmat ko'rsatish marketplace platformasi.
Raqobatchilar: OLX.uz (xizmatlar bo'limi), Profi.ru, Youdo, Avito.

Asosiy qiymat: har bir usta — professional sifatida profilli (portfolio, reyting,
sertifikat, narx, kalendar, escrow). OLX.uz'dagi 43 000+ e'londan 90%+ hech
qanday profilga ega emas.

### Foydalanuvchi toifalari
- **Mijoz** — xizmat qidiruvchi
- **Usta / Xizmatchi** — jismoniy shaxs-mutaxassis
- **Kompaniya** — ro'yxatdan o'tgan tashkilot
- **Administrator** — moderator

---

## 2. Arxitektura

### Monorepo
- `apps/web` — Next.js 14 App Router (client + pro + admin)
- `apps/mobile` — Expo (React Native)
- `packages/ui` — shadcn/ui-based design system, semantic tokens
- `packages/api-client` — Zod schemas + TanStack Query hooks
- `packages/i18n` — UZ (default), RU, EN
- `packages/config` — ESLint, TS, Tailwind presets

### Kritik texnologiyalar
- **Framework**: Next.js 14 (App Router), TypeScript strict
- **State**: TanStack Query v5 (server), Zustand (client)
- **Forms**: React Hook Form + Zod
- **UI**: Tailwind CSS + shadcn/ui
- **i18n**: next-intl
- **Maps**: Yandex Maps JS API (MDH uchun)
- **Auth**: NextAuth v5 (custom OTP + MyID.uz OAuth)
- **Payments**: Payme, Click, Uzcard SDK
- **Realtime**: Pusher / Socket.io
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Analytics**: Mixpanel + Sentry

---

## 3. Coding Conventions

### Fayl va nomlash
- Fayllar: `kebab-case` (`master-card.tsx`)
- Komponentlar: `PascalCase` (`MasterCard`)
- Hooks: `useCamelCase` (`useMasterProfile`)
- Constants: `SCREAMING_SNAKE_CASE`

### Har bir komponent uchun 3 ta fayl
```
master-card.tsx        # Component
master-card.test.tsx   # Unit test
master-card.stories.tsx # Storybook
```

### Imports tartib
```ts
// 1. React/Next
import { useState } from 'react'

// 2. Third-party
import { useQuery } from '@tanstack/react-query'

// 3. Internal packages
import { Button } from '@ustatop/ui'

// 4. Relative
import { formatPrice } from '../utils'
```

### TypeScript
- `strict: true` — `any` taqiqlangan
- API types — har doim Zod schema'dan `z.infer<>`
- Props — interface (component'lar), type (discriminated unions)
- Export — named (default emas, Next sahifalaridan tashqari)

### Styling
- Faqat Tailwind utility class'lari
- Rang/spacing — semantic tokens orqali (`text-brand-500` emas, `text-foreground`)
- Conditional — `cn()` util (`clsx + tailwind-merge`)
- Hech qachon inline style

### Accessibility
- Interaktiv element — `aria-label` yoki text content
- Form input — `<label>` bilan bog'langan
- Modal/Dialog — focus trap + Esc close
- `prefers-reduced-motion` respect

### i18n
- Hech qachon hardcoded string — har doim `t('domain.key')`
- Kalit formati: `features.booking.submitButton`
- Birlik/ko'plik: `{count, plural, one {# usta} other {# usta}}`

---

## 4. Scripts (Root)

```bash
pnpm dev           # Barcha apps parallel (web:3000, storybook:6006)
pnpm build         # Barcha apps build
pnpm test          # Unit tests (Vitest)
pnpm e2e           # Playwright E2E (apps/web)
pnpm lint          # ESLint + Prettier
pnpm typecheck     # tsc --noEmit
pnpm analyze       # Bundle analyzer
pnpm lighthouse    # LHCI
pnpm a11y          # axe-core scan
```

---

## 5. Git Workflow

### Branches
- `main` — production (protected)
- `develop` — staging
- `feat/<ticket>-<slug>` — yangi funksiya
- `fix/<ticket>-<slug>` — bug
- `chore/<slug>` — refactor, docs
- `hotfix/<slug>` — production fix

### Commit format (Conventional Commits)
```
feat(booking): add 6-step wizard with URL state
fix(auth): handle OTP resend cooldown correctly
chore(ci): upgrade playwright to v1.42
```

### PR checklist
- [ ] Unit tests pass (coverage ≥ 70%)
- [ ] E2E happy path (agar UI)
- [ ] Storybook story qo'shildi
- [ ] a11y — 0 critical
- [ ] i18n keys UZ + RU
- [ ] Mobile 320px + Desktop 1440px screenshots
- [ ] Bundle size diff < +10KB

---

## 6. Directory Map (apps/web/src)

```
app/
├── (marketing)/      # Landing, pricing, blog
├── (auth)/           # login, otp, signup
├── (client)/         # Mijoz panel
│   ├── home/
│   ├── search/
│   ├── booking/[...wizard]/
│   ├── orders/
│   ├── tracking/[id]/
│   ├── chat/
│   ├── wallet/
│   └── profile/
├── (pro)/            # Usta panel
│   ├── dashboard/
│   ├── portfolio/
│   ├── calendar/
│   ├── academy/
│   └── wallet/
├── (admin)/          # Moderator
│   ├── moderation/
│   ├── disputes/
│   └── verifications/
└── api/              # Webhooks, server actions

components/
├── ui/               # Primitives (Button, Input, Card...)
├── features/         # Domain (BookingWizard, OrderTracker, MasterCard)
├── layout/           # Headers, Sidebars, Nav
└── providers/        # QueryClient, Theme, Intl

lib/
├── api/              # Axios client, interceptors
├── auth/             # NextAuth config
├── hooks/            # Global hooks
├── stores/           # Zustand stores
├── validations/      # Zod schemas
└── utils/
```

---

## 7. Bitta Sprint Ish Uslubi

```bash
# 1. PRD yozish
# docs/sprints/S05/PRD.md

# 2. Plan
claude
> /plan Sprint 5: Realtime Tracking
  - GPS every 15s
  - Timeline status component
  - Photo upload per status
  - Push notification hooks
  - Yandex Maps integration

# 3. Implement
> /implement

# 4. Review
> /review

# 5. Test
pnpm test --coverage
pnpm e2e

# 6. Ship
git push origin feat/T-123-realtime-tracking
gh pr create
```

---

## 8. Do / Don't

### DO
- Sever Components where possible (no client bundle)
- Suspense + streaming
- Image optimization (next/image, AVIF)
- Dynamic import for heavy components
- Memoize expensive derived state
- Prefetch on hover (Link prefetch)

### DON'T
- `'use client'` global — faqat interactive kerak bo'lganda
- Fetch directly in components — TanStack Query orqali
- Hardcode strings — i18n
- Inline styles — Tailwind classes
- `any` type
- `fetch` client-side bilan secret key
- Re-render heavy trees — split context

---

## 9. Priority Roadmap

Joriy sprint holati uchun `docs/sprints/CURRENT.md` ni ko'ring.

Umumiy yo'nalish:
1. **S0** — Foundation (done?)
2. **S1** — Design System
3. **S2** — Auth 2.0
4. **S3** — Home + Search 2.0
5. **S4** — Smart Booking Wizard
6. **S5** — Realtime Tracking
7. **S6** — Chat 2.0
8. **S7** — Portfolio 2.0
9. **S8** — Wallet + Escrow
10. **S9** — Rating 2.0 + Badges
11. **S10** — AI Assistant + TG Bot
12. **S11** — Academy + Community
13. **S12** — B2B + Admin

---

## 10. Stakeholder Kontakt

- Mahsulot egasi: @xoqon (aliqobilovmadiyor@gmail.com)
- Frontend Lead: siz
- Backend: (to'ldiring)
- Dizayn: Figma Make loyihasi

Barcha qarorlar `docs/decisions/ADR-XXX.md` da yoziladi (Architecture Decision Records).
