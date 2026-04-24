import { expect, test } from '@playwright/test';

/**
 * Sprint 2 — Auth 2.0 smoke tests.
 *
 * Bu testlar mock adapter (MOCK_OTP=123456) bilan ishlaydi — `dev` env.
 */

test.describe('Auth flow', () => {
  test('login → OTP → signup full happy path', async ({ page }) => {
    await page.goto('/auth/login');

    // Login sahifasi
    await expect(page.getByRole('heading', { name: /kirish/i })).toBeVisible();
    await expect(page.getByLabel('Telefon raqam')).toBeVisible();

    // Telefon raqam kiritish
    await page.getByLabel('Telefon raqam').fill('901234567');
    await page.getByRole('button', { name: /SMS kod yuborish/i }).click();

    // OTP sahifasi
    await expect(page).toHaveURL(/\/auth\/otp/);
    await expect(page.getByRole('heading', { name: /tasdiqlash/i })).toBeVisible();

    // OTP kod kiritish (6 raqam)
    const otpInput = page.locator('input[autocomplete="one-time-code"]');
    await otpInput.fill('123456');

    // Auto-submit kutish yoki Button bosish
    await page.waitForURL(/\/auth\/signup/, { timeout: 5000 });

    // Signup sahifasi
    await expect(page.getByRole('heading', { name: /akkaunt/i })).toBeVisible();

    // Rol tanlash
    await page.getByRole('radio', { name: /mijoz/i }).click();

    // Ism kiritish (rol tanlangan keyin paydo bo'ladi)
    await page.getByLabel(/ismingiz/i).fill('Bobur Test');
    await page.getByRole('button', { name: /davom etish/i }).click();

    // Client home sahifasiga yo'naltiriladi
    await page.waitForURL(/\/client\/home/, { timeout: 5000 });
    await expect(page.getByText(/Bobur Test|Salom/i).first()).toBeVisible();
  });

  test("noto'g'ri telefon raqami xatolik beradi", async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByLabel('Telefon raqam').fill('12');
    await page.getByRole('button', { name: /SMS kod yuborish/i }).click();

    // Xatolik xabari ko'rinadi
    await expect(page.getByRole('alert')).toBeVisible();
  });

  test("noto'g'ri OTP — xatolik, urinish kamayadi", async ({ page }) => {
    // Avval phone raqamga o'tish uchun login qilamiz
    await page.goto('/auth/otp?phone=%2B998901234567');

    const otpInput = page.locator('input[autocomplete="one-time-code"]');
    await otpInput.fill('000000');

    // Noto'g'ri kod — error xabari
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/urinish qoldi/i)).toBeVisible();
  });

  test("himoyalangan sahifaga login'siz kirsa — /auth/login'ga redirect", async ({ page }) => {
    await page.goto('/client/home');
    await page.waitForURL(/\/auth\/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("signup'dan 'raqamni o'zgartirish' link login'ga olib boradi", async ({ page }) => {
    await page.goto('/auth/otp?phone=%2B998901234567');
    await page.getByRole('link', { name: /raqamni o.zgartirish/i }).click();
    await page.waitForURL(/\/auth\/login/);
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
