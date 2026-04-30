/**
 * S06 T6.10 — Realtime tracking security boundary smoke tests.
 *
 * **Scope:** Yangi endpoint'lar (T6.03 SSE, T6.05 tracking + status, T6.09
 * order detail page) auth/authz boundary'larini tekshiradi. Auth bypass
 * yo'q — barcha so'rovlar session'siz amalga oshiriladi va 401/redirect
 * kutiladi.
 *
 * **To'liq dual-tab senariylar (happy path, gps tracking, offline resume,
 * race condition)** OTP UI testability blokeri sabab kechiktirilgan
 * (`docs/sprints/S06/T6.10b-deferred.md`). Bu blokerni hal qilish — auth
 * helper yozish — alohida task (T6.10b).
 */
import { expect, test } from '@playwright/test';

const SAMPLE_UUID = '00000000-0000-0000-0000-000000000001';

test.describe('S06 — endpoint auth boundaries', () => {
  test("GET /api/orders/[id]/events session'siz 401 qaytaradi", async ({ request }) => {
    const response = await request.get(`/api/orders/${SAMPLE_UUID}/events`);
    expect(response.status()).toBe(401);
  });

  test("POST /api/orders/[id]/status session'siz 401 qaytaradi", async ({ request }) => {
    const response = await request.post(`/api/orders/${SAMPLE_UUID}/status`, {
      data: {
        status: 'cancelled',
        etag: new Date().toISOString(),
      },
    });
    expect(response.status()).toBe(401);
  });

  test("POST /api/tracking session'siz 401 qaytaradi", async ({ request }) => {
    const response = await request.post('/api/tracking', {
      data: {
        orderId: SAMPLE_UUID,
        lat: 41.31,
        lng: 69.27,
        accuracy: 15,
      },
    });
    expect(response.status()).toBe(401);
  });
});

test.describe('S06 — page redirects when unauthenticated', () => {
  test('GET /orders/[id] login sahifasiga redirect qiladi', async ({ page }) => {
    await page.goto(`/orders/${SAMPLE_UUID}`);
    // RSC redirect → /login?callbackUrl=/orders/...
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('S06 — body validation', () => {
  test("POST /api/tracking noto'g'ri JSON 401/400 qaytaradi (5xx emas)", async ({ request }) => {
    // Auth check oldin — 401 birinchi. Lekin testning maqsadi: server crash
    // qilmaydi va 5xx qaytarmaydi noto'g'ri body bilan.
    const response = await request.post('/api/tracking', {
      headers: { 'Content-Type': 'application/json' },
      data: 'not-valid-json{{',
    });
    expect([400, 401]).toContain(response.status());
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe('S06 — regression: existing routes still work', () => {
  test('homepage 200 qaytaradi', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/UstaTop/i);
  });
});
