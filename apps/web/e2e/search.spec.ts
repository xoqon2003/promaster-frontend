/**
 * T3.19 — Sprint 3 Search smoke tests (Playwright).
 *
 * Bu testlar mock api-client (MOCK_MASTERS, deterministic seed=42) ustida
 * ishlaydi — backend hali tayyor emas. Yandex Maps SDK skript yuklash
 * tashqi tarmoqqa bog'liq, shuning uchun map testida faqat ko'rinishni
 * almashtirish (view toggle) tekshiriladi — pin click yo'q.
 *
 * Senariylar:
 *  1. /search to'g'ridan-to'g'ri ochiladi, ResultGrid render bo'ladi
 *  2. URL'dagi ?q=... filteri persistent (shareable)
 *  3. Sort dropdown tanlovi URL'ga yoziladi
 *  4. Reyting filter chip URL'ga ?rating=4 ni yozadi
 *  5. Map ↔ Grid view toggle ishlaydi
 *  6. MasterCard bosilganda ?masterId=... URL'ga yoziladi va drawer ochiladi
 */
import { expect, test } from '@playwright/test';

test.describe('Search 2.0 — smoke', () => {
  test('/search to`g`ridan-to`g`ri ochiladi va MasterCard`lar render bo`ladi', async ({ page }) => {
    await page.goto('/search');

    // Top bar SearchBar mavjud
    await expect(page.getByRole('combobox', { name: /qidiruv/i })).toBeVisible();

    // Result grid yuklanguncha kutamiz — natijalar paydo bo'ladi
    const cards = page.locator('[data-slot="master-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });

    // Total label aria-live='polite' — bo'sh emas (Yuklanmoqda yoki "N ta usta topildi")
    const summary = page.getByTestId('search-result-summary');
    await expect(summary).toContainText(/usta topildi/i, { timeout: 10_000 });
  });

  test("URL'dagi ?q=elektrik filteri shareable — input default'i to`ldiriladi", async ({
    page,
  }) => {
    await page.goto('/search?q=elektrik');

    const searchInput = page.getByRole('combobox', { name: /qidiruv/i });
    await expect(searchInput).toHaveValue('elektrik');

    // Natija grid render bo'ladi
    await expect(page.locator('[data-slot="master-card"]').first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("sort dropdown tanlovi URL'ga ?sort=price yozadi", async ({ page }) => {
    await page.goto('/search');

    // Yuklanguncha kutamiz
    await expect(page.locator('[data-slot="master-card"]').first()).toBeVisible({
      timeout: 10_000,
    });

    // Sort trigger ochish
    await page.getByTestId('sort-dropdown-trigger').click();

    // 'Narx bo'yicha' (price) variantni tanlash
    await page.getByTestId('sort-option-price').click();

    // URL'ga sort=price yozildi
    await expect(page).toHaveURL(/sort=price/);

    // Trigger label yangilandi
    await expect(page.getByTestId('sort-current-label')).toContainText(/narx/i);
  });

  test("reyting filter chip URL'ga ?rating=4 ni yozadi (desktop sidebar)", async ({
    page,
    viewport,
  }) => {
    test.skip(
      Boolean(viewport && viewport.width < 1024),
      'Desktop sidebar test — mobile`da FilterPanelDrawer ishlatiladi',
    );

    await page.goto('/search');
    await expect(page.locator('[data-slot="master-card"]').first()).toBeVisible({
      timeout: 10_000,
    });

    // Sidebar'dagi "4+" reyting chip'ini bosish (FilterChip role=switch)
    const ratingChip = page.getByRole('switch', { name: '4+', exact: true });
    await ratingChip.first().click();

    await expect(page).toHaveURL(/rating=4/);
  });

  test("view toggle: grid → map → grid (Yandex SDK external'siz)", async ({ page }) => {
    await page.goto('/search');
    await expect(page.locator('[data-slot="master-card"]').first()).toBeVisible({
      timeout: 10_000,
    });

    // Map view'ga o'tish
    await page.getByRole('radio', { name: /xarita ko.rinishi/i }).click();
    await expect(page).toHaveURL(/view=map/);

    // MapView container ko'rinadi (Yandex SDK yuklanmasligi mumkin — bu OK,
    // wrapper element data-slot='search-main' ichida bo'ladi)
    await expect(page.locator('[data-slot="search-main"]')).toBeVisible();

    // Qaytib grid'ga
    await page.getByRole('radio', { name: /ro.yxat ko.rinishi/i }).click();
    // grid default — URL'dan view ochilib ketishi kerak (clearOnDefault)
    await expect(page).not.toHaveURL(/view=map/);
    await expect(page.locator('[data-slot="master-card"]').first()).toBeVisible();
  });

  test("MasterCard bosilganda drawer ochiladi va ?masterId URL'ga yoziladi", async ({ page }) => {
    await page.goto('/search');

    const firstCard = page.locator('[data-slot="master-card"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10_000 });

    await firstCard.click();

    // URL'da masterId paydo bo'ldi
    await expect(page).toHaveURL(/masterId=/);

    // Drawer ochildi
    const drawer = page.getByTestId('result-drawer');
    await expect(drawer).toBeVisible();

    // Drawer ichida usta nomi bor
    await expect(page.getByTestId('drawer-master-name')).toBeVisible();

    // Esc bilan yopish — masterId URL'dan tushadi
    await page.keyboard.press('Escape');
    await expect(page).not.toHaveURL(/masterId=/);
  });
});
