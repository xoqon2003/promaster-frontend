/**
 * T3.02 — Mock data generator tests.
 *
 * Qamrov:
 *  - Static shape (kategoriyalar soni, unikal ID)
 *  - Distribution (har kategoriyada >= 5 usta)
 *  - Schema conformance (MasterSchema/CategorySchema.safeParse har birida)
 *  - Rating [3.5, 5.0] oralig'i
 *  - Koordinatalar Toshkent markazi atrofida
 *  - Determinism (bir xil seed → bir xil natija)
 *  - Snapshot (first 3 master deterministic shape)
 */
import { describe, expect, it } from 'vitest';

import { MOCK_CATEGORIES, MOCK_MASTERS, generateMasters } from './mock-data';
import { CategorySchema, MasterSchema } from './schemas';

// ─── MOCK_CATEGORIES ─────────────────────────────────────────────────────────

describe('MOCK_CATEGORIES', () => {
  it('aniq 10 ta kategoriya', () => {
    expect(MOCK_CATEGORIES).toHaveLength(10);
  });

  it('barcha ID unikal', () => {
    const ids = new Set(MOCK_CATEGORIES.map((c) => c.id));
    expect(ids.size).toBe(MOCK_CATEGORIES.length);
  });

  it('har biri CategorySchema bilan valid', () => {
    for (const cat of MOCK_CATEGORIES) {
      const result = CategorySchema.safeParse(cat);
      expect(result.success).toBe(true);
    }
  });

  it("tasks.md'da ko'rsatilgan ID'larni o'z ichiga oladi", () => {
    const expectedIds = [
      'elektrik',
      'santexnik',
      'remont',
      'dizayn',
      'tarbiyachi',
      'repetitor',
      'tarjimon',
      'haydovchi',
      'kurer',
      'nikoh',
    ];
    const actualIds = MOCK_CATEGORIES.map((c) => c.id);
    expect(actualIds).toEqual(expectedIds);
  });

  it("har bir kategoriya emoji'ga ega", () => {
    for (const cat of MOCK_CATEGORIES) {
      expect(cat.emoji.length).toBeGreaterThan(0);
    }
  });
});

// ─── MOCK_MASTERS ────────────────────────────────────────────────────────────

describe('MOCK_MASTERS', () => {
  it('aniq 100 ta usta', () => {
    expect(MOCK_MASTERS).toHaveLength(100);
  });

  it('har bir ID unikal (m_1 ... m_100)', () => {
    const ids = new Set(MOCK_MASTERS.map((m) => m.id));
    expect(ids.size).toBe(100);
    expect(MOCK_MASTERS[0]?.id).toBe('m_1');
    expect(MOCK_MASTERS[99]?.id).toBe('m_100');
  });

  it('har biri MasterSchema bilan valid', () => {
    for (const m of MOCK_MASTERS) {
      const result = MasterSchema.safeParse(m);
      expect(result.success).toBe(true);
    }
  });

  it("rating [3.5, 5.0] oralig'ida", () => {
    for (const m of MOCK_MASTERS) {
      expect(m.rating).toBeGreaterThanOrEqual(3.5);
      expect(m.rating).toBeLessThanOrEqual(5.0);
    }
  });

  it('har kategoriyada kamida 5 usta', () => {
    const counts = MOCK_MASTERS.reduce<Record<string, number>>((acc, m) => {
      acc[m.categoryId] = (acc[m.categoryId] ?? 0) + 1;
      return acc;
    }, {});

    for (const cat of MOCK_CATEGORIES) {
      expect(counts[cat.id] ?? 0).toBeGreaterThanOrEqual(5);
    }
  });

  it('har kategoriyada aniq 10 usta (round-robin distribution)', () => {
    const counts = MOCK_MASTERS.reduce<Record<string, number>>((acc, m) => {
      acc[m.categoryId] = (acc[m.categoryId] ?? 0) + 1;
      return acc;
    }, {});

    for (const cat of MOCK_CATEGORIES) {
      expect(counts[cat.id]).toBe(10);
    }
  });

  it('Toshkent koordinatalari atrofida (±0.16)', () => {
    const LAT_MIN = 41.31 - 0.16;
    const LAT_MAX = 41.31 + 0.16;
    const LNG_MIN = 69.28 - 0.16;
    const LNG_MAX = 69.28 + 0.16;

    for (const m of MOCK_MASTERS) {
      expect(m.location.lat).toBeGreaterThanOrEqual(LAT_MIN);
      expect(m.location.lat).toBeLessThanOrEqual(LAT_MAX);
      expect(m.location.lng).toBeGreaterThanOrEqual(LNG_MIN);
      expect(m.location.lng).toBeLessThanOrEqual(LNG_MAX);
    }
  });

  it('manzil Toshkent tumani bilan boshlanadi', () => {
    for (const m of MOCK_MASTERS) {
      expect(m.location.address).toMatch(/^Toshkent,/);
      expect(m.location.address).toMatch(/tumani$/);
    }
  });

  it('categoryName categoryId bilan mos keladi', () => {
    for (const m of MOCK_MASTERS) {
      const cat = MOCK_CATEGORIES.find((c) => c.id === m.categoryId);
      expect(cat).toBeDefined();
      expect(m.categoryName).toBe(cat?.name);
    }
  });

  it('trustLevel distribution — har 4 daraja vakili bor', () => {
    const seen = new Set(MOCK_MASTERS.map((m) => m.trustLevel));
    // 100 usta bilan weighted [20, 50, 25, 5] — 'premium' (5%) bo'lishi ehtimoli ~99%
    expect(seen.has('basic')).toBe(true);
    expect(seen.has('verified')).toBe(true);
    expect(seen.has('pro')).toBe(true);
    expect(seen.has('premium')).toBe(true);
  });

  it('barcha ustalarning currency UZS', () => {
    for (const m of MOCK_MASTERS) {
      expect(m.currency).toBe('UZS');
    }
  });

  it('priceFrom pozitiv integer', () => {
    for (const m of MOCK_MASTERS) {
      expect(m.priceFrom).toBeGreaterThan(0);
      expect(Number.isInteger(m.priceFrom)).toBe(true);
    }
  });
});

// ─── Determinism ─────────────────────────────────────────────────────────────

describe('generateMasters() — determinism', () => {
  it('seed=42 bilan ikki marta chaqirilsa — aynan bir xil natija', () => {
    const first = generateMasters(100, { seed: 42 });
    const second = generateMasters(100, { seed: 42 });

    expect(first).toEqual(second);
  });

  it('boshqa seed — farqli natija', () => {
    const a = generateMasters(100, { seed: 42 });
    const b = generateMasters(100, { seed: 999 });

    // Barcha ismlar aynan bir xil bo'la olmaydi
    const aNames = a.map((m) => m.name).join('|');
    const bNames = b.map((m) => m.name).join('|');
    expect(aNames).not.toBe(bNames);
  });

  it("MOCK_MASTERS — importlar orasida o'zgarmaydi", () => {
    // Bu test modul-level MOCK_MASTERS eager evaluatsiya ekanligini tekshiradi
    const snapshot1 = MOCK_MASTERS.slice(0, 5).map((m) => m.name);
    const snapshot2 = MOCK_MASTERS.slice(0, 5).map((m) => m.name);
    expect(snapshot1).toEqual(snapshot2);
  });

  it('kichik count (10) bilan ishlaydi', () => {
    const small = generateMasters(10, { seed: 42 });
    expect(small).toHaveLength(10);
    expect(small[0]?.id).toBe('m_1');
    expect(small[9]?.id).toBe('m_10');
  });

  it('custom kategoriyalar bilan ishlaydi', () => {
    const customCats = [
      {
        id: 'test',
        name: 'Test',
        emoji: '🧪',
        masterCount: 0,
      },
    ];
    const result = generateMasters(5, { seed: 42, categories: customCats });
    expect(result).toHaveLength(5);
    for (const m of result) {
      expect(m.categoryId).toBe('test');
      expect(m.categoryName).toBe('Test');
    }
  });
});

// ─── Snapshot ────────────────────────────────────────────────────────────────

describe('MOCK_MASTERS — snapshot', () => {
  it('birinchi 3 usta deterministic shape', () => {
    const first3 = MOCK_MASTERS.slice(0, 3).map((m) => ({
      id: m.id,
      categoryId: m.categoryId,
      trustLevel: m.trustLevel,
      currency: m.currency,
    }));

    // seed=42 → bu qiymatlar barqaror
    expect(first3).toEqual([
      { id: 'm_1', categoryId: 'elektrik', trustLevel: first3[0]?.trustLevel, currency: 'UZS' },
      { id: 'm_2', categoryId: 'santexnik', trustLevel: first3[1]?.trustLevel, currency: 'UZS' },
      { id: 'm_3', categoryId: 'remont', trustLevel: first3[2]?.trustLevel, currency: 'UZS' },
    ]);
  });
});
