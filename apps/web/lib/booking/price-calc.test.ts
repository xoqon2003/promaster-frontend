/**
 * T4.02 — `calculatePriceRange` unit tests.
 *
 * Qamrov:
 *  - Bilingan kategoriya — to'g'ri range
 *  - Notanish kategoriya — default estimate
 *  - 1000 ga round qilish
 *  - Buffer koeffitsienti (1.5×) max'ga qo'llaniladi
 *  - currency har doim 'UZS'
 */
import { describe, expect, it } from 'vitest';

import { getCategoryEstimate } from './category-estimates';
import { calculatePriceRange } from './price-calc';

describe('calculatePriceRange', () => {
  it('elektrik (1-3h, 50000/h) → from=50000, to=225000', () => {
    // 50_000 × 3 × 1.5 = 225_000
    const range = calculatePriceRange(50_000, 'elektrik');
    expect(range.from).toBe(50_000);
    expect(range.to).toBe(225_000);
    expect(range.currency).toBe('UZS');
  });

  it('remont (4-8h, 80000/h) → from=320000, to=960000', () => {
    // 80_000 × 4 = 320_000
    // 80_000 × 8 × 1.5 = 960_000
    const range = calculatePriceRange(80_000, 'remont');
    expect(range.from).toBe(320_000);
    expect(range.to).toBe(960_000);
  });

  it('repetitor (1-2h, 100000/h) → from=100000, to=300000', () => {
    const range = calculatePriceRange(100_000, 'repetitor');
    expect(range.from).toBe(100_000);
    expect(range.to).toBe(300_000);
  });

  it("notanish kategoriya (default 2-4h) — default estimate qo'llaniladi", () => {
    // 60_000 × 2 = 120_000
    // 60_000 × 4 × 1.5 = 360_000
    const range = calculatePriceRange(60_000, 'unknown_category_xyz');
    expect(range.from).toBe(120_000);
    expect(range.to).toBe(360_000);
  });

  it('1000 ga round qilish ishlaydi', () => {
    // 33_333 × 1 = 33_333 → 33_000
    // 33_333 × 3 × 1.5 = 149_998.5 → 150_000
    const range = calculatePriceRange(33_333, 'elektrik');
    expect(range.from % 1000).toBe(0);
    expect(range.to % 1000).toBe(0);
  });

  it('to >= from har doim (har kategoriya uchun)', () => {
    const categories = [
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
      'unknown',
    ];
    for (const cat of categories) {
      const range = calculatePriceRange(50_000, cat);
      expect(range.to).toBeGreaterThanOrEqual(range.from);
    }
  });
});

describe('getCategoryEstimate', () => {
  it('mavjud kategoriya — aniq estimate', () => {
    const est = getCategoryEstimate('elektrik');
    expect(est.minHours).toBe(1);
    expect(est.maxHours).toBe(3);
  });

  it('notanish kategoriya — default 2-4', () => {
    const est = getCategoryEstimate('quantum-physicist');
    expect(est.minHours).toBe(2);
    expect(est.maxHours).toBe(4);
  });

  it('barcha kategoriyalar minHours <= maxHours', () => {
    const ids = [
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
    for (const id of ids) {
      const est = getCategoryEstimate(id);
      expect(est.minHours).toBeLessThanOrEqual(est.maxHours);
    }
  });
});
