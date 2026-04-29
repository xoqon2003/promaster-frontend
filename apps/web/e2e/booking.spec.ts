/**
 * T4.14 — Sprint 4 Booking Wizard smoke tests (Playwright).
 *
 * Bu testlar mock booking-api (in-memory store) va mock auth (MOCK_OTP=123456)
 * ustida ishlaydi — backend hali tayyor emas. Yandex Maps SDK yuklash tashqi
 * tarmoqqa bog'liq, shuning uchun manzil pin bilan o'zaro ta'sir tekshirilmaydi
 * — `addressSlot` ma'lumotlari `?draft=<JSON>` URL parami orqali to'g'ridan-
 * to'g'ri seed qilinadi (S03 namuna: `e2e/search.spec.ts`).
 *
 * Senariylar:
 *  1. Login`li mijoz happy path: pre-seeded draft → submit → /orders/[id]
 *  2. Mehmon → step 5 auth gate → login`dan keyin form ko'rinadi (R04 mitigation)
 *  3. Submit error UI: master-not-found → alert + action tugma (T4.11)
 *  4. Browser back/forward → wizard `?step=` URL state saqlanadi
 *  5. Step 1 validation: bo'sh form Davom etish → inline xato + step o'zgarmas
 */
import { expect, test, type Page } from '@playwright/test';

// ─── Constants ───────────────────────────────────────────────────────────────

const MOCK_OTP = '123456';
const TEST_PHONE_E164 = '+998901112233';
const TEST_NAME = 'E2E Booking Test';

/** MOCK_MASTERS[0] — `m_1` `elektrik` kategoriyasiga tegishli (i % 10 === 0). */
const M1 = 'm_1';

// ─── Test data builders ──────────────────────────────────────────────────────

interface TestDraft {
  masterId?: string;
  service?: { categoryId: string; subServiceId: string; description: string };
  addressSlot?: {
    location: { lat: number; lng: number; address: string };
    slotAt: string;
  };
  photos?: Array<{ id: string; url: string; mimeType: string; bytes: number }>;
  contact?: { fullName: string; phone: string; alternativePhone?: string };
}

/** ISO datetime — ertaga tushda. SLOT_LEAD_MINUTES=120 talabidan kafolatli o'tadi. */
function tomorrowAtNoonIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

/** `?step=N&draft=...` URL'ini tuzadi. step=1 default — URL'ga yozilmaydi. */
function buildBookingUrl(opts: { step?: number; draft?: TestDraft } = {}): string {
  const params = new URLSearchParams();
  if (opts.step && opts.step !== 1) params.set('step', String(opts.step));
  if (opts.draft) params.set('draft', JSON.stringify(opts.draft));
  const qs = params.toString();
  return qs ? `/booking?${qs}` : '/booking';
}

/** To'liq draft — submit happy path uchun. */
function makeCompleteDraft(masterId: string = M1): TestDraft {
  return {
    masterId,
    service: {
      categoryId: 'elektrik',
      subServiceId: 'rozetka-almashtirish',
      description: 'E2E test buyurtma — 3 ta rozetka almashtirish',
    },
    addressSlot: {
      location: { lat: 41.31, lng: 69.28, address: 'Toshkent, Chilonzor 12-uy' },
      slotAt: tomorrowAtNoonIso(),
    },
    photos: [],
    contact: {
      fullName: TEST_NAME,
      phone: TEST_PHONE_E164,
    },
  };
}

// ─── Auth helper ─────────────────────────────────────────────────────────────

/**
 * NextAuth `otp` credentials provider'iga to'g'ridan-to'g'ri POST orqali
 * login qiladi (UI flow'siz).
 *
 * App Router route group'lar (`(auth)`, `(client)`) URL prefiks'ni
 * stripsdir → haqiqiy URL'lar flat: `/login`, `/otp`, `/signup`, `/home`,
 * `/booking`. NextAuth API'ni to'g'ridan ishlatamiz (UI flow ham endi
 * mavjud, lekin API bypass tezroq va test isolation'ga yaxshi mos keladi).
 *
 * Cookie'lar `page.request` orqali browser context'iga yoziladi —
 * keyingi `page.goto()` chaqiruvlari avtomatik authenticated.
 */
async function loginAsMockClient(page: Page): Promise<void> {
  const csrfRes = await page.request.get('/api/auth/csrf');
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

  const signInRes = await page.request.post('/api/auth/callback/otp', {
    form: {
      csrfToken,
      phone: TEST_PHONE_E164,
      code: MOCK_OTP,
      callbackUrl: '/',
      json: 'true',
    },
  });

  // NextAuth muvaffaqiyatda 200 (json:true) yoki 302 redirect qaytaradi
  if (signInRes.status() >= 400) {
    throw new Error(`NextAuth signIn failed: ${signInRes.status()} ${await signInRes.text()}`);
  }

  // Sanity check: session cookie o'rnatilganmi?
  const sessionRes = await page.request.get('/api/auth/session');
  const session = (await sessionRes.json()) as { user?: { id?: string } };
  if (!session.user?.id) {
    throw new Error('NextAuth session not established after signIn');
  }
}

/**
 * `useSession()` hydration tugashini kutadi (page-context fetch).
 *
 * `loginAsMockClient` cookie'ni o'rnatadi, lekin `<SessionProvider>` mount'da
 * `/api/auth/session` ga fetch qiladi va React state shu javobdan keyin
 * yangilanadi. Bu tugamasdan submit tugmasi'ni bossak, `useCurrentUser().user`
 * `undefined` bo'lib, `step-6-confirm` `handleSubmit` jim qaytib ketadi.
 */
async function waitForAuthHydration(page: Page): Promise<void> {
  await page.waitForFunction(
    async () => {
      const res = await fetch('/api/auth/session', { cache: 'no-store' });
      const data = (await res.json()) as { user?: { id?: string } };
      return Boolean(data?.user?.id);
    },
    null,
    { timeout: 5_000, polling: 100 },
  );
}

// ─── Tests ───────────────────────────────────────────────────────────────────

test.describe('Booking wizard — smoke', () => {
  test("login'li mijoz happy path: pre-seeded draft → submit → /orders/[id]", async ({ page }) => {
    // Arrange — login + complete draft
    await loginAsMockClient(page);

    // Act — step 6 ga seeded draft bilan kirish
    await page.goto(buildBookingUrl({ step: 6, draft: makeCompleteDraft() }));

    // Step 6 render bo'ldi
    await expect(page.getByTestId('step-6-confirm')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('summary-service-line')).toBeVisible();
    await expect(page.getByTestId('summary-address-line')).toBeVisible();
    await expect(page.getByTestId('summary-contact-name')).toContainText(TEST_NAME);

    // SessionProvider fetch tugashini kutamiz — handleSubmit `user` ga bog'liq
    await waitForAuthHydration(page);

    // Submit tugmasi yoqilgan
    const submitBtn = page.getByTestId('step-6-submit-btn');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Assert — /orders/bk_<id> ga redirect
    await page.waitForURL(/\/orders\/bk_/, { timeout: 10_000 });
    expect(page.url()).toMatch(/\/orders\/bk_/);
  });

  test("mehmon step 5'da auth gate ko'radi, login'dan keyin form ko'rinadi", async ({ page }) => {
    // Mehmon — masterId + service + addressSlot bilan step 5 ga keladi
    const partial: TestDraft = {
      masterId: M1,
      service: {
        categoryId: 'elektrik',
        subServiceId: 'rozetka-almashtirish',
        description: '',
      },
      addressSlot: {
        location: { lat: 41.31, lng: 69.28, address: 'Toshkent, Chilonzor' },
        slotAt: tomorrowAtNoonIso(),
      },
      photos: [],
    };
    const stepFiveUrl = buildBookingUrl({ step: 5, draft: partial });

    // 1) Mehmon → auth gate
    await page.goto(stepFiveUrl);
    await expect(page.getByTestId('step-5-auth-gate')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByTestId('step-5-contact-form')).toBeHidden();

    // 2) Login (auth flow callbackUrl ni hozircha qaytarmaydi → manual qaytamiz)
    await loginAsMockClient(page);

    // 3) Step 5'ga qaytamiz — endi form ko'rinadi, auth gate yo'q
    await page.goto(stepFiveUrl);
    await expect(page.getByTestId('step-5-contact-form')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByTestId('step-5-auth-gate')).toBeHidden();
    // Draft URL'da edi — submit tugma uchun form mavjudligi yetarli
  });

  test('submit error UI: master-not-found → alert + action tugma', async ({ page }) => {
    await loginAsMockClient(page);

    // Mavjud bo'lmagan master — bookingApi.create() throw qiladi
    const badDraft = { ...makeCompleteDraft(), masterId: 'm_999_invalid' };
    await page.goto(buildBookingUrl({ step: 6, draft: badDraft }));

    await expect(page.getByTestId('step-6-confirm')).toBeVisible({ timeout: 10_000 });

    // Session hydration — handleSubmit `user` ga bog'liq
    await waitForAuthHydration(page);

    // Submit qilamiz
    await page.getByTestId('step-6-submit-btn').click();

    // Error alert paydo bo'ladi
    const errorAlert = page.getByTestId('submit-error');
    await expect(errorAlert).toBeVisible({ timeout: 10_000 });
    await expect(errorAlert).toHaveAttribute('data-error-kind', 'master-not-found');

    // Action tugma — "Qidiruvga qaytish"
    const actionBtn = page.getByTestId('submit-error-action');
    await expect(actionBtn).toBeVisible();
    await expect(actionBtn).toContainText(/qidiruv/i);

    // Submit tugma'sini qayta yoqish kerakmas — error xolatda qoladi
    await expect(page.getByTestId('step-6-submit-btn')).toBeEnabled();
  });

  test('browser back/forward navigatsiyasi — ?step= URL state saqlanadi', async ({ page }) => {
    // Step 1 form valid bo'lishi uchun service prefill qilamiz
    const partial: TestDraft = {
      masterId: M1,
      service: {
        categoryId: 'elektrik',
        subServiceId: 'rozetka-almashtirish',
        description: '',
      },
    };

    await page.goto(buildBookingUrl({ step: 1, draft: partial }));
    await expect(page.getByTestId('step-1-service-form')).toBeVisible({ timeout: 5_000 });

    // step 1 → 2 (Davom etish RHF form submit qiladi → goNext)
    await page.getByTestId('wizard-next-btn').click();
    await expect(page).toHaveURL(/[?&]step=2/, { timeout: 5_000 });

    // Browser back → step=1 (clearOnDefault sababli URL'dan tushadi)
    await page.goBack();
    await expect(page).not.toHaveURL(/[?&]step=2/);
    await expect(page.getByTestId('step-1-service-form')).toBeVisible();

    // Browser forward → step=2 qaytadi
    await page.goForward();
    await expect(page).toHaveURL(/[?&]step=2/, { timeout: 5_000 });
  });

  test("step 1 validation: bo'sh form Davom etish → inline xato, step o'zgarmas", async ({
    page,
  }) => {
    await page.goto('/booking');
    await expect(page.getByTestId('step-1-service-form')).toBeVisible({ timeout: 5_000 });

    // Bo'sh form bilan Davom etish — RHF validatsiya xatolari ko'rsatadi
    await page.getByTestId('wizard-next-btn').click();

    // Kamida bitta `role="alert"` paydo bo'ldi (kategoriya yoki sub-xizmat)
    await expect(page.getByRole('alert').first()).toBeVisible({ timeout: 3_000 });

    // Step 2 ga o'tib ketmadi
    await expect(page).not.toHaveURL(/[?&]step=2/);
    await expect(page.getByTestId('step-1-service-form')).toBeVisible();
  });
});
