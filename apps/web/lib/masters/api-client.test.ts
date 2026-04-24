/**
 * T3.03 — Mock adapter (mockMastersApi) tests.
 *
 * Qamrov:
 *  - search() — filter, sort, paginate
 *  - getById() — topildi / topilmadi
 *  - getCategories() — MOCK_CATEGORIES aynan
 *  - getRecommended() — verified+ filter + rating sort + limit
 *  - Adapter shartnoma (interface mos kelishi — typecheck-level)
 */
import { describe, expect, it } from 'vitest';

import { mockMastersApi } from './api-client';
import { MOCK_CATEGORIES, MOCK_MASTERS } from './mock-data';
import { SearchResponseSchema } from './schemas';

// ─── search() — happy path + schema ──────────────────────────────────────────

describe('mockMastersApi.search()', () => {
  it('default qiymatlar bilan to`liq javob qaytaradi (schema valid)', async () => {
    const res = await mockMastersApi.search({});

    const parsed = SearchResponseSchema.safeParse(res);
    expect(parsed.success).toBe(true);
    expect(res.page).toBe(1);
    expect(res.pageSize).toBe(20);
    expect(res.total).toBe(MOCK_MASTERS.length);
  });

  it('default sort `rating` desc — birinchi element eng yuqori reytingli', async () => {
    const res = await mockMastersApi.search({ pageSize: 50 });
    for (let i = 1; i < res.masters.length; i++) {
      expect(res.masters[i - 1]!.rating).toBeGreaterThanOrEqual(res.masters[i]!.rating);
    }
  });
});

// ─── search() — filters ──────────────────────────────────────────────────────

describe('mockMastersApi.search() — filters', () => {
  it('categoryId — faqat shu kategoriya ustalari', async () => {
    const res = await mockMastersApi.search({
      categoryId: 'elektrik',
      pageSize: 50,
    });
    expect(res.masters.length).toBeGreaterThan(0);
    for (const m of res.masters) {
      expect(m.categoryId).toBe('elektrik');
    }
  });

  it('rating — minimal threshold ishlaydi', async () => {
    const threshold = 4.5;
    const res = await mockMastersApi.search({ rating: threshold, pageSize: 50 });
    for (const m of res.masters) {
      expect(m.rating).toBeGreaterThanOrEqual(threshold);
    }
  });

  it('priceFrom/priceTo — diapazon ishlaydi', async () => {
    const res = await mockMastersApi.search({
      priceFrom: 80_000,
      priceTo: 150_000,
      pageSize: 50,
    });
    for (const m of res.masters) {
      expect(m.priceFrom).toBeGreaterThanOrEqual(80_000);
      expect(m.priceFrom).toBeLessThanOrEqual(150_000);
    }
  });

  it('online=true — faqat onlayn ustalar', async () => {
    const res = await mockMastersApi.search({ online: true, pageSize: 50 });
    for (const m of res.masters) {
      expect(m.isOnline).toBe(true);
    }
  });

  it('online=false — faqat offlayn ustalar', async () => {
    const res = await mockMastersApi.search({ online: false, pageSize: 50 });
    for (const m of res.masters) {
      expect(m.isOnline).toBe(false);
    }
  });

  it('trustLevel=`verified` — verified, pro, premium qaytadi (basic chiqib ketadi)', async () => {
    const res = await mockMastersApi.search({
      trustLevel: 'verified',
      pageSize: 50,
    });
    for (const m of res.masters) {
      expect(['verified', 'pro', 'premium']).toContain(m.trustLevel);
    }
  });

  it('trustLevel=`pro` — faqat pro va premium', async () => {
    const res = await mockMastersApi.search({ trustLevel: 'pro', pageSize: 50 });
    for (const m of res.masters) {
      expect(['pro', 'premium']).toContain(m.trustLevel);
    }
  });

  it('trustLevel=`premium` — faqat premium', async () => {
    const res = await mockMastersApi.search({
      trustLevel: 'premium',
      pageSize: 50,
    });
    for (const m of res.masters) {
      expect(m.trustLevel).toBe('premium');
    }
  });

  it('q — usta ismi bo`yicha qidiradi (case-insensitive)', async () => {
    // MOCK_MASTERS deterministic (seed=42), shuning uchun real name uchraydi
    const sample = MOCK_MASTERS[0]!;
    const firstWord = sample.name.split(' ')[0]!.toLowerCase();

    const res = await mockMastersApi.search({ q: firstWord, pageSize: 50 });
    expect(res.masters.length).toBeGreaterThan(0);

    // Kamida bitta natija shu "word"ni o'z ichida saqlaydi
    const anyMatch = res.masters.some(
      (m) =>
        m.name.toLowerCase().includes(firstWord) ||
        m.categoryName.toLowerCase().includes(firstWord),
    );
    expect(anyMatch).toBe(true);
  });

  it("q — categoryName bo'yicha ham qidiradi (`elektrik`)", async () => {
    const res = await mockMastersApi.search({ q: 'Elektrik', pageSize: 50 });
    expect(res.masters.length).toBeGreaterThan(0);
    for (const m of res.masters) {
      const hit =
        m.name.toLowerCase().includes('elektrik') ||
        m.categoryName.toLowerCase().includes('elektrik');
      expect(hit).toBe(true);
    }
  });

  it('q bo`sh string — hamma ustani qaytaradi', async () => {
    const res = await mockMastersApi.search({ q: '', pageSize: 50 });
    expect(res.total).toBe(MOCK_MASTERS.length);
  });

  it('bounds — Toshkent markaziga yaqin bbox faqat shu hududdagilarni qaytaradi', async () => {
    const bounds = {
      north: 41.35,
      south: 41.28,
      east: 69.32,
      west: 69.24,
    };
    const res = await mockMastersApi.search({ bounds, pageSize: 50 });
    for (const m of res.masters) {
      expect(m.location.lat).toBeGreaterThanOrEqual(bounds.south);
      expect(m.location.lat).toBeLessThanOrEqual(bounds.north);
      expect(m.location.lng).toBeGreaterThanOrEqual(bounds.west);
      expect(m.location.lng).toBeLessThanOrEqual(bounds.east);
    }
  });

  it('bir nechta filter kombinatsiyasi (AND semantika)', async () => {
    const res = await mockMastersApi.search({
      categoryId: 'santexnik',
      rating: 4.0,
      online: true,
      pageSize: 50,
    });
    for (const m of res.masters) {
      expect(m.categoryId).toBe('santexnik');
      expect(m.rating).toBeGreaterThanOrEqual(4.0);
      expect(m.isOnline).toBe(true);
    }
  });

  it("noto'g'ri priceFrom > priceTo — schema refinement xatosi", async () => {
    await expect(mockMastersApi.search({ priceFrom: 500_000, priceTo: 100_000 })).rejects.toThrow();
  });
});

// ─── search() — sort ─────────────────────────────────────────────────────────

describe('mockMastersApi.search() — sort', () => {
  it('sort=`price` asc', async () => {
    const res = await mockMastersApi.search({ sort: 'price', pageSize: 50 });
    for (let i = 1; i < res.masters.length; i++) {
      expect(res.masters[i - 1]!.priceFrom).toBeLessThanOrEqual(res.masters[i]!.priceFrom);
    }
  });

  it('sort=`rating` desc', async () => {
    const res = await mockMastersApi.search({ sort: 'rating', pageSize: 50 });
    for (let i = 1; i < res.masters.length; i++) {
      expect(res.masters[i - 1]!.rating).toBeGreaterThanOrEqual(res.masters[i]!.rating);
    }
  });

  it('sort=`newest` — m_100 > m_99 > ... (ID descending raqamli)', async () => {
    const res = await mockMastersApi.search({ sort: 'newest', pageSize: 10 });
    expect(res.masters[0]?.id).toBe('m_100');
    expect(res.masters[1]?.id).toBe('m_99');
    expect(res.masters[9]?.id).toBe('m_91');
  });

  it('sort=`distance` — undefined distance oxiriga tushadi', async () => {
    // MOCK_MASTERS da distanceKm undefined barchasida — sort stable qoladi
    const res = await mockMastersApi.search({ sort: 'distance', pageSize: 50 });
    expect(res.masters.length).toBeGreaterThan(0);
  });
});

// ─── search() — pagination ───────────────────────────────────────────────────

describe('mockMastersApi.search() — pagination', () => {
  it('1-sahifa 20 ta natija qaytaradi', async () => {
    const res = await mockMastersApi.search({ page: 1, pageSize: 20 });
    expect(res.masters).toHaveLength(20);
    expect(res.page).toBe(1);
    expect(res.pageSize).toBe(20);
    expect(res.hasMore).toBe(true);
  });

  it('oxirgi sahifada hasMore=false', async () => {
    const res = await mockMastersApi.search({ page: 5, pageSize: 20 });
    expect(res.masters).toHaveLength(20);
    expect(res.hasMore).toBe(false);
  });

  it("diapazondan tashqari sahifa — bo'sh massiv + hasMore=false", async () => {
    const res = await mockMastersApi.search({ page: 100, pageSize: 20 });
    expect(res.masters).toHaveLength(0);
    expect(res.hasMore).toBe(false);
    expect(res.total).toBe(MOCK_MASTERS.length);
  });

  it("pageSize=10 — 10 ta sahifaga bo'linadi", async () => {
    const res = await mockMastersApi.search({ page: 3, pageSize: 10 });
    expect(res.masters).toHaveLength(10);
    expect(res.hasMore).toBe(true);
  });

  it('har sahifa unikal ustalarga ega (overlap yo`q)', async () => {
    const page1 = await mockMastersApi.search({ page: 1, pageSize: 20 });
    const page2 = await mockMastersApi.search({ page: 2, pageSize: 20 });

    const ids1 = new Set(page1.masters.map((m) => m.id));
    const ids2 = new Set(page2.masters.map((m) => m.id));
    const intersect = [...ids1].filter((id) => ids2.has(id));
    expect(intersect).toHaveLength(0);
  });

  it('pageSize chegarasi: min=10, max=50 (schema validatsiya)', async () => {
    await expect(mockMastersApi.search({ pageSize: 5 })).rejects.toThrow();
    await expect(mockMastersApi.search({ pageSize: 100 })).rejects.toThrow();
  });
});

// ─── getById() ───────────────────────────────────────────────────────────────

describe('mockMastersApi.getById()', () => {
  it('mavjud ID uchun ustani qaytaradi', async () => {
    const m = await mockMastersApi.getById('m_1');
    expect(m).not.toBeNull();
    expect(m?.id).toBe('m_1');
  });

  it("mavjud bo'lmagan ID uchun null", async () => {
    const m = await mockMastersApi.getById('m_9999');
    expect(m).toBeNull();
  });

  it("bo'sh string uchun null", async () => {
    const m = await mockMastersApi.getById('');
    expect(m).toBeNull();
  });
});

// ─── getCategories() ─────────────────────────────────────────────────────────

describe('mockMastersApi.getCategories()', () => {
  it('MOCK_CATEGORIES ni aynan qaytaradi', async () => {
    const cats = await mockMastersApi.getCategories();
    expect(cats).toEqual(MOCK_CATEGORIES);
    expect(cats).toHaveLength(10);
  });
});

// ─── getRecommended() ────────────────────────────────────────────────────────

describe('mockMastersApi.getRecommended()', () => {
  it('default limit=8 — 8 ta tavsiya', async () => {
    const recs = await mockMastersApi.getRecommended();
    expect(recs).toHaveLength(8);
  });

  it('custom limit ishlaydi', async () => {
    const recs = await mockMastersApi.getRecommended({ limit: 5 });
    expect(recs).toHaveLength(5);
  });

  it('faqat verified/pro/premium (basic chiqib ketadi)', async () => {
    const recs = await mockMastersApi.getRecommended({ limit: 50 });
    for (const m of recs) {
      expect(['verified', 'pro', 'premium']).toContain(m.trustLevel);
    }
  });

  it("rating bo'yicha descending saralangan", async () => {
    const recs = await mockMastersApi.getRecommended({ limit: 10 });
    for (let i = 1; i < recs.length; i++) {
      expect(recs[i - 1]!.rating).toBeGreaterThanOrEqual(recs[i]!.rating);
    }
  });

  it('userId parameteri qabul qilinadi (hozircha ignored, future ML hook)', async () => {
    const recs = await mockMastersApi.getRecommended({
      userId: 'usr_1',
      limit: 3,
    });
    expect(recs).toHaveLength(3);
  });
});
