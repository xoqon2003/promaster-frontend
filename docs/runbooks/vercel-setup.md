# Vercel Project Setup — `promaster-frontend`

> Sprint S05 T5.07. Stack qaror: [`docs/sprints/S05/planning.md`](../../../docs/sprints/S05/planning.md)

Bu runbook Vercel project'ni birinchi marta yaratish va Neon Postgres
integration qilish bo'yicha qadam-ba-qadam yo'riqnoma.

---

## Tezkor xulosa

| Parametr            | Qiymat                                          |
| ------------------- | ----------------------------------------------- |
| Vercel project nomi | `promaster-frontend`                            |
| Domain              | `promaster.vercel.app` (Q2 javob)               |
| Region              | `fra1` (Frankfurt — UZ ~80ms)                   |
| Framework           | Next.js (auto-detect)                           |
| Root Directory      | `apps/web`                                      |
| Package manager     | pnpm (auto-detect via `pnpm-lock.yaml` at root) |
| Build runtime       | Turborepo (auto-detected)                       |
| GitHub repo         | `xoqon2003/promaster-frontend`                  |

---

## Qadam-ba-qadam

### 1. Vercel akkaunt + GitHub ulanish

1. https://vercel.com/signup ga kiring (yoki mavjud akkauntga login)
2. **Continue with GitHub** — `xoqon2003` GitHub akkauntini ulang
3. Vercel'ga `xoqon2003/promaster-frontend` repo'ga kirish ruxsati bering

### 2. Project import

1. https://vercel.com/new ga kiring
2. **Import Git Repository** → `promaster-frontend` ni tanlang
3. Configure Project formasi ochiladi:

```
Project Name:        promaster-frontend
Framework Preset:    Next.js (auto-detected)
Root Directory:      apps/web                    ← MUHIM!
Build Command:       (default — Vercel detects)
Output Directory:    (default — apps/web/.next)
Install Command:     (default — pnpm install at root)
```

> **Diqqat:** "Root Directory" ni `apps/web` qiling. Vercel monorepo
> ni avtomatik aniqlaydi va install root'da, build apps/web'da bo'ladi.

### 3. Domain — `promaster.vercel.app`

Default'da Vercel `promaster-frontend.vercel.app` beradi. Bizga
**`promaster.vercel.app`** kerak (Q2 javob):

1. **Settings → Domains**
2. **Add** → `promaster.vercel.app` kiriting
3. (Bu Vercel'da mavjud bo'lsa olinmagan bo'lsa ulashtiriladi; band
   bo'lsa `promaster-uz.vercel.app` yoki shunga o'xshash variant)

### 4. Neon Postgres integration

1. **Storage** sahifasiga kiring (project ichida)
2. **Connect Database** → **Neon** ni tanlang
3. **Connect existing Neon project** ni tanlang
4. `promaster-db` ni tanlang (avval yaratgan edingiz)
5. **Default branch:** `staging` (production-like staging URL uchun)
6. Vercel avtomatik:
   - `DATABASE_URL` env var'ni o'rnatadi (Production + Preview + Development)
   - Connection string'ni Vercel-managed encryption bilan saqlaydi
   - Deploy paytida har lambda'ga inject qiladi

> **Tip:** Per-PR DB branch yoqish — Neon integration sozlamasida
> "Create database branch per Preview deployment" tugmasi.
> Bu R01 mitigation (DB migration safety) uchun ideal.

### 5. Qo'shimcha env variables

**Settings → Environment Variables** ga quyidagilarni qo'shing:

| Key                           | Value                                 | Environments                       |
| ----------------------------- | ------------------------------------- | ---------------------------------- |
| `NEXTAUTH_SECRET`             | `<openssl rand -base64 32 natija>`    | Production, Preview, Development   |
| `NEXTAUTH_URL`                | `https://promaster.vercel.app`        | Production                         |
| `NEXTAUTH_URL`                | (qoldiring — Vercel auto-set)         | Preview                            |
| `OTP_PROVIDER`                | `mock`                                | All (Q1 — Eskiz aktivatsiya defer) |
| `MOCK_OTP`                    | `123456`                              | Development, Preview               |
| `ESKIZ_API_BASE`              | `https://notify.eskiz.uz/api`         | All                                |
| `ESKIZ_EMAIL`                 | (bo'sh — aktivatsiya'da to'ldiriladi) | —                                  |
| `ESKIZ_PASSWORD`              | (bo'sh — aktivatsiya'da to'ldiriladi) | —                                  |
| `ESKIZ_SENDER`                | `Promaster`                           | All                                |
| `SENTRY_DSN`                  | (T5.09 da set)                        | —                                  |
| `SENTRY_ORG`                  | `smart-technologies-group`            | All                                |
| `SENTRY_PROJECT`              | `promaster-frontend`                  | All                                |
| `NEXT_PUBLIC_YANDEX_MAPS_KEY` | (mavjud key)                          | All                                |
| `NEXT_PUBLIC_MIXPANEL_TOKEN`  | (mavjud token)                        | All                                |

**`NEXTAUTH_SECRET` generate:**

```bash
openssl rand -base64 32
```

### 6. Deploy

1. **Deploy** tugmasini bosing
2. Birinchi build ~3-5 daqiqa (cache yo'q)
3. Build log'da kuzatish kerak:
   - ✅ `pnpm install` root'da ishlamoqda
   - ✅ `next build` `apps/web/`da ishlamoqda
   - ✅ `Compiled successfully`
4. Deploy URL: `https://promaster.vercel.app`

### 7. Smoke test (deploy'dan keyin)

Browser'da:

1. https://promaster.vercel.app — homepage ochiladi
2. https://promaster.vercel.app/search — search sahifasi
3. https://promaster.vercel.app/login — login form
4. https://promaster.vercel.app/booking — wizard step 1

`/login` da:

- Phone: `+998901234567`
- "Kod yuborish" → `/otp` ga o'tadi
- OTP: `123456` (mock provider — `OTP_PROVIDER=mock`)
- Auto-submit'dan keyin yangi user → `/signup` ga o'tadi
- Rol + ism kiriting → `/home`

`/api/auth/session` Neon'da haqiqiy `users` row qaytaradi (mock-store emas — real DB).

---

## Per-PR Preview deploys

Vercel har feature branch push'ida avtomatik preview deploy yaratadi:

```
feat/S05-backend-foundation → promaster-frontend-git-feat-s05...vercel.app
```

Neon integration'dan "Create branch per preview" yoqilgan bo'lsa, har preview
o'z DB branch'iga ega (`preview-feat-s05-...`). Bu R01 (migration safety)
mitigation uchun ideal — production data'ga ta'sir qilmasdan migration test.

---

## CI/CD bog'lanishi

Vercel GitHub integration:

- `main` branch push → Production deploy (`promaster.vercel.app`)
- `feat/*`, `fix/*` push → Preview deploy (alohida URL)
- PR merge → Production redeploy
- Pull request commit → Preview update

GitHub Actions CI (`ci.yml`) Vercel deploy'dan oldin ishlamaydi —
Vercel o'zining build pipeline'iga ega. Dual CI istalmasa, GitHub
Actions faqat `develop` yoki `main`'ga merge oldin ishlatilishi mumkin.

---

## Monitoring

- **Vercel Dashboard** → Deployments — har commit uchun build log
- **Vercel Logs** → Real-time function invocations + errors
- **Vercel Analytics** (Pro tier) — Web Vitals, top pages
- **Sentry** (T5.09 da ulanadi) — exception tracking

---

## Cost (S05 fazasi)

| Layer    | Tier             | Cost      |
| -------- | ---------------- | --------- |
| Vercel   | Hobby (free)     | $0/oy     |
| Neon     | Free             | $0/oy     |
| Eskiz.uz | Sandbox (free)   | $0/oy     |
| Sentry   | Developer (free) | $0/oy     |
| **Jami** |                  | **$0/oy** |

**Pro tier upgrade trigger'lari:**

- Vercel Hobby: 100 GB bandwidth/oy → Pro $20/oy (R09 monitoring)
- Neon Free: 0.5 GB storage → Pro $19/oy (production traffic boshlanganda)

---

## Troubleshooting

### Build fail: "Cannot find module @ustatop/ui"

Workspace package'lar topilmayapti — Root Directory `apps/web` to'g'ri
sozlanganini tekshiring. Vercel install root'da bo'lishi kerak (pnpm
workspace symlink'lar yaratadi).

### Build fail: "next-auth requires NEXTAUTH_URL"

Production env'da `NEXTAUTH_URL` qo'shilganini tekshiring. Preview env
auto-set, Production manual.

### Deploy success, lekin runtime error: "DATABASE_URL not set"

Neon integration to'g'ri ulangani'ni tekshiring (Storage tab). Disconnect

- reconnect — env var'ni qayta inject qiladi.

### Cold-start ~2 sekund

Neon free tier compute 5 daqiqa idle'dan keyin suspend bo'ladi (R04).
Birinchi request cold — keyingi request'lar ~50-100ms.

---

## Aktivatsiya checklist (T5.07 yopilishi)

- [ ] Vercel project yaratilgan (`promaster-frontend`)
- [ ] Root Directory `apps/web` qilingan
- [ ] Domain `promaster.vercel.app` ulashtirilgan
- [ ] Neon Postgres integration ulashtirilgan (DATABASE_URL auto-set)
- [ ] `NEXTAUTH_SECRET` generate qilingan va env'ga qo'shilgan
- [ ] `OTP_PROVIDER=mock` env'ga qo'shilgan
- [ ] Birinchi deploy yashil (build success)
- [ ] Smoke test: homepage, /search, /booking ochiladi
- [ ] Smoke test: `/login` mock OTP bilan ishlaydi
- [ ] (Ixtiyoriy) Per-PR DB branch yoqilgan
