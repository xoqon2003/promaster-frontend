# Eskiz.uz Aktivatsiya Runbook

> S05 T5.06. Stack qaror: [`docs/sprints/S05/planning.md`](../../../docs/sprints/S05/planning.md)

S05 fazasida **Eskiz aktivatsiya defer** (Q1 javob) — kod tayyor, lekin
prod tier yoqilmaydi. Bu runbook **kelajakda real SMS yoqish** kerak
bo'lganda bajariladi (S06+ yoki dastlabki real foydalanuvchilar paydo
bo'lganda).

---

## Tezkor xulosa

| Parametr             | Qiymat                                        |
| -------------------- | --------------------------------------------- |
| Provider             | Eskiz.uz                                      |
| Provider type        | OTP SMS adapter                               |
| Prod tier xarajat    | ~$0.005/SMS (UZ raqamlar)                     |
| Sandbox tier xarajat | $0/oy (test SMS faqat)                        |
| API base URL         | `https://notify.eskiz.uz/api`                 |
| Aktivatsiya vaqti    | ~30 daqiqa kod + 3-5 ish kuni sender approval |

---

## Hozirgi holati (T5.03 yopilgandan keyin)

✅ Kod tayyor:

- `lib/auth/eskiz-client.ts` — HTTP client (timeout, retry, token cache)
- `lib/auth/eskiz-adapter.ts` — `OtpAdapter` implementation (bcrypt + DB)
- `lib/auth/otp-adapter.ts` — env switcher factory

✅ Env template:

- `apps/web/.env.example` — barcha Eskiz env'lar template'da

✅ Default:

- `OTP_PROVIDER=mock` barcha env'larda (Vercel + lokal)

❌ Hali yo'q:

- Eskiz akkaunt (sandbox yoki prod)
- Sender ID approval ("Promaster")
- Production env'da `OTP_PROVIDER=eskiz`

---

## Aktivatsiya bosqichlari

### 1. Eskiz sandbox akkaunt (1 kun, $0)

> Bu bosqich istalgan vaqtda bajarilishi mumkin — adapter sandbox URL'da
> ham ishlaydi.

1. https://eskiz.uz/ → **Ro'yxatdan o'tish** (Email + Parol)
2. Hisob tasdiqlash (email orqali)
3. **Dashboard → API** sahifasiga kiring
4. **Sandbox tier** default — bepul, faqat test raqamlarga SMS
5. **API Token** olish:
   - Email + parol bilan POST `/api/auth/login` qilib token oling, yoki
   - Dashboard'dan ko'rsatilgan `email` + `password`'ni ishlatamiz
6. **Test raqamlar** — Eskiz docs (`https://documenter.getpostman.com/view/663428/RzfmES4z`):
   - Sandbox tier'da har kuni cheklangan SMS (taxminan 5-10 ta)
   - Test sender ID: `4546` (default, approval kerakmas)

**Lokal sinov:**

```bash
# .env.local ga vaqtinchalik qo'shing
OTP_PROVIDER=eskiz
ESKIZ_EMAIL=siz@email.com
ESKIZ_PASSWORD=<parolingiz>
ESKIZ_SENDER=4546

# Dev server qayta ishga tushiring
pnpm dev

# Browser'da: /login → telefoningiz → SMS keladi
```

**Smoke test (CLI):**

```bash
pnpm exec tsx --env-file=.env.local -e "
import { getEskizClient } from './lib/auth/eskiz-client.ts';
const client = getEskizClient();
client.sendSms('+998901234567', 'Test SMS — Promaster').then(r => console.log('OK:', r));
"
```

---

### 2. Production tier upgrade (~$5-10 boshlang'ich balans)

> Real foydalanuvchilar kelganda zarur. Sandbox tier `4546` raqamdan
> SMS yuboradi (default), bu professional emas — "Promaster" sender
> approval kerak.

1. **Eskiz dashboard → Tarif** → **Asosiy** yoki **Korporativ** plan
   - Asosiy: $5 boshlang'ich balans, $0.005/SMS
   - Korporativ: $20+ balans, $0.004/SMS, custom features
2. **Bank kartasi yoki Click/Payme** orqali to'lov
3. **API limits ortadi** (kun/oy bo'yicha SMS)

---

### 3. Sender ID approval — "Promaster"

> O'zbek operatorlari (Beeline, Ucell, UMS) sender ID sertifikatsiyasi
> talab qiladi. Eskiz bu jarayonni boshqaradi.

1. **Dashboard → Sender ID** → **Yangi so'rov**
2. Forma to'ldirish:
   - **Sender ID:** `Promaster`
   - **Tashkilot:** "Smart technologies group" (Q3 javob — Sentry org bilan bir xil)
   - **Faoliyat turi:** Marketplace / Online services
   - **Hujjatlar:** Tashkilot guvohnomasi (PDF), STIR
3. Eskiz so'rovni operatorlarga yuboradi
4. **3-5 ish kuni** ichida har 3 operator (Beeline, Ucell, UMS) tasdiqlaydi
5. Sender ID aktivlashganda email keladi

> **Approval'gacha:** sandbox tier'dagi `4546` ID ishlatamiz. Foydalanuvchi
> "4546 raqamidan SMS keldi — ProMaster: kod 123456" matnini ko'radi.

---

### 4. Vercel env aktivatsiya

> Bu eng oxirgi qadam — Eskiz akkaunt + sender approved bo'lgandan keyin.

1. **Vercel Dashboard → Project (`promaster-frontend`) → Settings → Environment Variables**
2. Quyidagilarni qo'shing/yangilang:

| Key              | Value                                        | Environments         |
| ---------------- | -------------------------------------------- | -------------------- |
| `OTP_PROVIDER`   | `eskiz`                                      | Production           |
| `OTP_PROVIDER`   | `mock`                                       | Preview, Development |
| `ESKIZ_EMAIL`    | (Eskiz akkaunt email)                        | Production           |
| `ESKIZ_PASSWORD` | (Eskiz akkaunt parol)                        | Production           |
| `ESKIZ_SENDER`   | `Promaster` (approved) yoki `4546` (sandbox) | Production           |

**Diqqat:** Preview va Development env'larda **`OTP_PROVIDER=mock`** qoldiring
— preview deploy'lar Eskiz quota'ni iste'mol qilmasligi kerak.

3. **Deployments → Redeploy** (env o'zgarishi avtomatik trigger qiladi)
4. Smoke test:
   - https://promaster.vercel.app/login
   - Telefoningiz → "Kod yuborish"
   - Real SMS keladi (~5-15 sekund)
   - OTP'ni kiriting → /signup yoki /home

---

### 5. Monitoring

**Eskiz dashboard:**

- **Statistika** — kun/oy bo'yicha SMS soni
- **Delivery rate** — yetib borgan SMS foizi (R11)
- **Balans** — qoldiq summa, low-balance alert

**Vercel/Sentry:**

- Sentry'da `Eskiz API` error'lar (T5.09 tag'lari bilan)
- Eskiz API timeout/network → 502 response → frontend toast

**Alert'lar (qo'lda sozlash):**

- Eskiz balansi < $5 → email
- Delivery rate < 90% → manual investigation (PlayMobile fallback?)
- Daily SMS soni > kutilgan + 50% → abuse signal (rate limit qo'shish)

---

## Rollback (xato yuz bersa)

Real SMS bilan muammo (Eskiz down, balans tugadi, sender ID buzildi):

1. Vercel env'da `OTP_PROVIDER=eskiz` → `OTP_PROVIDER=mock` qaytaring
2. **Redeploy** — 1-2 daqiqa
3. Mock provider mode'da `MOCK_OTP=123456` ishlaydi
4. Foydalanuvchilarga: "SMS muammosi vaqtinchalik — kod 123456 ishlatamiz"
   matnini support'da/banner'da ko'rsating
5. Eskiz problem'ini hal qiling, keyin yana `eskiz`'ga qaytaring

---

## Fallback provider — PlayMobile (R02 mitigation)

Eskiz uzoq down bo'lsa yoki delivery rate 90% dan past bo'lsa, alternativ
provider sifatida PlayMobile tayyorlash mumkin. Kod o'zgartirish'ga oz vaqt
ketadi (~2 soat):

1. `lib/auth/playmobile-client.ts` yaratish (eskiz-client.ts namuna)
2. `lib/auth/playmobile-adapter.ts` (eskiz-adapter.ts pattern)
3. `otp-adapter.ts` factory'ga `'playmobile'` case qo'shish
4. `OTP_PROVIDER=playmobile` env'ga set
5. PlayMobile akkaunt + sender approval (Eskiz'dan alohida)

**Hozirda ushbu fallback rejalashtirilgan emas** — Eskiz S05-S07 davomida
yetarli. Real ehtiyoj bo'lganda S08+ ga qo'shiladi.

---

## Aktivatsiya checklist (yopilishi)

- [ ] Eskiz akkaunt yaratilgan
- [ ] Sandbox API token olingan
- [ ] Local smoke test (`tsx --env-file=.env.local`) — token + SMS test
- [ ] Production tier (agar real foydalanuvchilar) — balans yuklab qo'yilgan
- [ ] Sender ID `Promaster` approved (3-5 ish kuni)
- [ ] Vercel env'larga `ESKIZ_EMAIL`, `ESKIZ_PASSWORD`, `ESKIZ_SENDER`
- [ ] Vercel `OTP_PROVIDER=eskiz` (Production env)
- [ ] Vercel redeploy yashil
- [ ] Production smoke test: real telefonga SMS keldi
- [ ] Eskiz dashboard'i monitoring uchun bookmark qilingan
- [ ] Sentry alert sozlangan (T5.09 da)

---

## Troubleshooting

### `Eskiz API 401: invalid credentials`

Email yoki parol noto'g'ri. `.env.local` yoki Vercel env'da
`ESKIZ_EMAIL`/`ESKIZ_PASSWORD` qiymatlarini tekshiring.

### `Eskiz API 403: sender not approved`

Sender ID hali approval'da. Vaqtincha `ESKIZ_SENDER=4546` qo'ying
(default test sender — UZ regulatorlarga approval kerakmas).

### SMS yuborildi, lekin foydalanuvchi olmadi

R11 — delivery rate operator'larga bog'liq. Tekshiring:

1. Eskiz dashboard'da "delivered" status
2. Telefon raqami formati `+998XXXXXXXXX` (E.164)
3. Operator filter'i (Beeline ba'zan international SMS bloklaydi)
4. SMS matni ichida URL bo'lmasligi (filter)

### Eskiz balansi tugadi

1. Vercel'da `OTP_PROVIDER=mock` qaytaring (rollback)
2. Eskiz dashboard → Balans qo'shish (Click/Payme)
3. Balans yangilangach, Vercel'da `OTP_PROVIDER=eskiz` qaytaring

---

## Ma'lumotnomalar

- Eskiz API docs: https://documenter.getpostman.com/view/663428/RzfmES4z
- Eskiz dashboard: https://my.eskiz.uz/
- O'z stack qarori: [`docs/sprints/S05/planning.md`](../../../docs/sprints/S05/planning.md)
- Risk register: [`docs/sprints/S05/risks.md`](../../../docs/sprints/S05/risks.md) (R02, R11)
- Adapter kod: [`apps/web/lib/auth/eskiz-client.ts`](../../apps/web/lib/auth/eskiz-client.ts)
