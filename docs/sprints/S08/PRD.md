# Sprint S08 — Marketing Landing 2.0 + i18n bootstrap

**Tag (target):** `v0.8.0`
**Branch:** `feat/S08-marketing-landing`
**Davr:** 2026-05-01 → 2026-05-15 (S07 oldinga olindi — stakeholder qarori)
**Lock:** 2026-05-01

> Bu sprint S07 (Chat 2.0) o'rnida bajarilmoqda. Sabab: deployed
> `promaster-frontend-web.vercel.app` skelet placeholder ko'rinishidan
> chiqishi shart — investorlar/birinchi visitor uchun landing —
> "professional mahsulot" signali. S07 keyingi sprintga suriladi.

---

## 1. Maqsad

Public marketing landing'ni atigi sticky header + 3 highlight kartochka skeletidan **8 ta to'liq sectiondan iborat professional sahifaga** olib chiqish va asosiy infrastruktura'larni o'rnatish:

- Multi-locale (UZ default + RU + EN) — cookie-based, `<html lang>` server-rendered
- `(marketing)` route group + nested layout
- Brand-tone'da gradient hero, search input, dual CTA, stats strip
- 12 ta kategoriya rail (responsive grid)
- 3-step "How it works"
- 6 ta top-master demo cards (mock — S09'da real query)
- Trust pillars: Escrow / MyID / Sertifikat / 30 kun kafolat
- Testimonials (3 ovoz, locale-aware quotes)
- FAQ (8 Q&A) + JSON-LD `FAQPage` schema
- Gradient CTA section
- Rich 4-column footer + locale switcher
- JSON-LD `Organization` schema

---

## 2. Acceptance Criteria

- [x] `app/(marketing)/layout.tsx` + `page.tsx` ishlaydi
- [x] 8 ta section komponenti (RSC default, FAQ — `'use client'` accordion)
- [x] next-intl 4.11 cookie-based locale (UZ/RU/EN)
- [x] LocaleSwitcher header + footer
- [x] Server action `setLocaleAction` revalidate bilan
- [x] Root `<html lang>` cookie locale'ga moslashadi
- [x] `pnpm check-types` 0 error
- [ ] `pnpm lint` 0 warning
- [ ] `pnpm build` muvaffaqiyatli
- [ ] axe-core 0 critical
- [ ] Lighthouse Mobile ≥ 90
- [ ] PR `feat/S08` → `develop` ochiladi
- [ ] Vercel preview deploy yashil

---

## 3. Out of scope (S09 yoki keyinroq)

- Real DB query top masters uchun (TanStack Query) — S09
- `[locale]` URL segments — hozir cookie-only
- About / Pricing / Blog sahifalari — keyingi sprintda
- Husky + lint-staged + commitlint (S08 deliverable 3) — S09'ga tushdi (vaqt yetmasa)
- Real OG image dizayn (1200×630) — vaqtinchalik metadata-only

---

## 4. Texnik qarorlar

| ID  | Qaror                           | Sabab                                                                    |
| --- | ------------------------------- | ------------------------------------------------------------------------ |
| D1  | next-intl cookie-based, URL'siz | URL refactor risksiz, SEO uchun hreflang `alternates` yetarli            |
| D2  | RSC + selective `'use client'`  | Bundle minimum, Lighthouse mobile uchun kritik                           |
| D3  | Mock master data                | Backend `masters` table S09'da yetkazib beriladi                         |
| D4  | 8 section structured            | Conversion-optimized landing pattern (hero → trust → social proof → CTA) |
| D5  | JSON-LD inline `<script>`       | SEO rich snippet for FAQ + Organization                                  |

---

## 5. Hujjatlar

- [tasks.md](./tasks.md) — bajarilgan + qoldiq tasklar
- [risks.md](./risks.md) — sprint risklari
