# Sprint S08 — Retro

**Davr:** 2026-05-01 (1 sessiya — intensive, S07 oldinga olindi)
**Tag:** `v0.8.0-rc1` (PR merge'dan keyin)
**Branch:** `feat/S08-marketing-landing` → `develop` (PR ochiq)

---

## What went well 🟢

1. **Stakeholder qaror tezligi** — Live URL "skelet placeholder" muammosi 1 sessiyada diagnoz + reja + implementation
2. **Parallel agent integration** — Mavjud `*-section.tsx` fayllar (RSC pattern) saqlanib, mening duplicate'larim olib tashlandi → final code base toza
3. **i18n bootstrap** — next-intl 4.11 cookie-based yondashuv (URL refactor'siz) — barcha 3 til (UZ/RU/EN) bootstrap qilingan. S06 C04 carry yopildi.
4. **Critical SSR bug fix** — `dynamic({ ssr: false })` workaround olib tashlandi → SSR endi to'g'ri ishlaydi (Lighthouse mobile uchun katta yutuq)
5. **8 ta section conversion-optimized order** — Hero → Categories → HIW → Top Masters → Trust → Testimonials → FAQ → CTA. Industry best-practice.
6. **JSON-LD SEO** — `Organization` + `FAQPage` schema'lari inline (Google rich snippet'lar uchun)
7. **TypeScript yashil** — `pnpm check-types` 0 error
8. **Dynamic OG image** — `app/opengraph-image.tsx` (edge runtime, gradient + brand tokens)

## What didn't go well 🟠

1. **`/_not-found` prerender failure** — Next 15 + React 19 + next-auth beta `useState is null` muammosi. `force-dynamic` bilan tuzatildi (texnik qarz: client-providers'ni SSR-safe qilish kerak — TD).
2. **Lucide v1.9.0 brand icons yo'q** — Github/Instagram/Twitter/Youtube icons mavjud emas → generic icons (Camera, MessageCircle, PlayCircle) bilan almashtirildi. Real brand SVG'lar S09'da kerak bo'ladi.
3. **lucide-react versiya tushunarsiz** — package.json `^1.9.0` lekin npm'da bunday versiya yo'q (current 0.x). Fork yoki cached. **Texnik qarz: tekshirish kerak.**
4. **Build vaqti uzun (~3 daqiqa)** — Sentry source map upload + 7 page full prerender. CI'ni tezlashtirish uchun cache strategiyasi kerak.
5. **gh CLI auth yo'q** — PR manual ochildi (S06 C06 carry'ga aylanadi)
6. **Husky/CI deferred** — S08 deliverable 3 (Quality Gates 1+2) S09'ga ko'chirildi. Risk: developer machine'da pre-commit yo'q → linter qoldiqlar mumkin.

## Key learnings 💡

1. **Root layout async + cookie() prerender'ni buzadi** — Next.js root layout kontekstida `cookies()` chaqiruvi /\_not-found va /error static prerender'ni "force-dynamic"ga o'tkazadi. Locale resolution'ni nested route group'larga olib chiqish kerak.
2. **`dynamic({ ssr: false })` provider'larda — anti-pattern** — SSR'ni butunlay o'chiradi, bu LCP/SEO'ni buzadi. To'g'ri yo'l: provider'ni 'use client' boundary qilish, lekin SSR-safe (useState'ni useRef + lazy init bilan almashtirish).
3. **Parallel agent collaboration** — bir nechta agent bir vaqtda ishlaganda fayl naming convention'iga rioya qilish kritik. RSC default (server) + selective `'use client'` — 2026 best practice.
4. **next-intl cookie vs `[locale]` URL** — cookie soddaroq, lekin SEO uchun `[locale]` segment hreflang bilan kuchliroq. S08 cookie bilan ship, S09'da migrate kerak bo'lishi mumkin.

## Action items (S09 carry-over)

| ID     | Item                                                         | Owner | Priority |
| ------ | ------------------------------------------------------------ | ----- | -------- |
| C08-01 | client-providers SSR-safe qilish (useState → useRef pattern) | xoqon | 🔴 P1    |
| C08-02 | Husky + lint-staged + commitlint setup                       | xoqon | 🟠 P2    |
| C08-03 | GitHub Actions ci.yml (typecheck + lint + test + build)      | xoqon | 🟠 P2    |
| C08-04 | axe-core full audit + jest-axe Storybook integration         | xoqon | 🟡 P3    |
| C08-05 | About / Pricing / Blog / For-pros sahifalari                 | xoqon | 🟡 P3    |
| C08-06 | lucide-react versiyasini diagnose qilish                     | xoqon | 🟢 P4    |
| C08-07 | Real brand SVG icons (TG/IG/X/YT) inline                     | xoqon | 🟢 P4    |
| C08-08 | `[locale]` URL segment migration (SEO upgrade)               | xoqon | 🟢 P4    |
| C08-09 | gh CLI auth (developer machine) — PR avtomatlash             | xoqon | 🟢 P4    |
| C08-10 | S07 (Chat 2.0) qaytarib boshlash                             | xoqon | 🟠 P2    |

## Numbers 📊

- **Yangi fayllar:** 23 (8 section + header + footer + locale switcher + 4 i18n + 2 data + OG + 5 doc)
- **Yangi qatorlar:** ~1,840 (LOC)
- **Yangi dependencies:** 1 (`next-intl@4.11.0`)
- **Sprint vaqti:** 1 sessiya
- **TypeScript errors:** 0
- **Build status:** ✅ exit 0 (force-dynamic fix bilan)
- **Test coverage delta:** +0% (test'lar S09'da yoziladi)

## Sprint Tag

`v0.8.0-rc1` — PR merge'dan keyin `v0.8.0` ga aylantiriladi.

---

**Next sprint:** S09 — Client Journey 2.0 (8 ekran Vite'dan ko'chiriladi) yoki S07 qaytariladi (Chat 2.0). Stakeholder bilan kelishish kerak.
