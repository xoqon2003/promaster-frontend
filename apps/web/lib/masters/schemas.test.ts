/**
 * T3.01 — Zod schemas acceptance tests.
 *
 * Qamrov:
 *  - happy path (valid input → parse success)
 *  - boundary (min/max, required/optional)
 *  - invalid shapes (missing fields, wrong types)
 *  - cross-field refinement (priceFrom <= priceTo)
 *  - default qiymatlar (sort='rating', page=1, pageSize=20)
 */
import { describe, expect, it } from 'vitest';
import {
  BoundsSchema,
  CategorySchema,
  CurrencySchema,
  FilterableTrustLevelSchema,
  LocationSchema,
  MasterSchema,
  SearchFilterSchema,
  SearchResponseSchema,
  SortOptionSchema,
  TrustLevelSchema,
} from './schemas';
import type { Master } from './schemas';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const VALID_MASTER: Master = {
  id: 'm_1',
  name: 'Bobur Aliyev',
  avatarUrl: 'https://example.com/avatar.jpg',
  rating: 4.8,
  reviewCount: 127,
  trustLevel: 'verified',
  categoryId: 'elektrik',
  categoryName: 'Elektrik',
  priceFrom: 50_000,
  currency: 'UZS',
  isOnline: true,
  responseTime: '~15 daqiqa',
  distanceKm: 2.4,
  location: {
    lat: 41.31,
    lng: 69.28,
    address: 'Toshkent, Chilonzor tumani',
  },
};

// ─── Enum schemas ────────────────────────────────────────────────────────────

describe('TrustLevelSchema', () => {
  it.each(['basic', 'verified', 'pro', 'premium'] as const)(
    '%s darajasini qabul qiladi',
    (level) => {
      expect(TrustLevelSchema.safeParse(level).success).toBe(true);
    },
  );

  it("noma'lum darajani rad etadi", () => {
    expect(TrustLevelSchema.safeParse('god').success).toBe(false);
  });
});

describe('FilterableTrustLevelSchema', () => {
  it("`basic`'ni rad etadi (filter semantikasi — default hamma)", () => {
    expect(FilterableTrustLevelSchema.safeParse('basic').success).toBe(false);
  });

  it.each(['verified', 'pro', 'premium'] as const)('%s uchun filter', (level) => {
    expect(FilterableTrustLevelSchema.safeParse(level).success).toBe(true);
  });
});

describe('CurrencySchema', () => {
  it("faqat 'UZS'ni qabul qiladi", () => {
    expect(CurrencySchema.safeParse('UZS').success).toBe(true);
    expect(CurrencySchema.safeParse('USD').success).toBe(false);
    expect(CurrencySchema.safeParse('RUB').success).toBe(false);
  });
});

describe('SortOptionSchema', () => {
  it.each(['rating', 'price', 'distance', 'newest'] as const)(
    "'%s' saralash variantini qabul qiladi",
    (sort) => {
      expect(SortOptionSchema.safeParse(sort).success).toBe(true);
    },
  );

  it("noma'lum saralashni rad etadi", () => {
    expect(SortOptionSchema.safeParse('popularity').success).toBe(false);
  });
});

// ─── Location & Bounds ───────────────────────────────────────────────────────

describe('LocationSchema', () => {
  it('Toshkent koordinatalarini qabul qiladi', () => {
    expect(LocationSchema.safeParse({ lat: 41.31, lng: 69.28, address: 'Toshkent' }).success).toBe(
      true,
    );
  });

  it('lat diapazondan tashqari (-90..90) rad etadi', () => {
    expect(LocationSchema.safeParse({ lat: 91, lng: 69, address: 'x' }).success).toBe(false);
    expect(LocationSchema.safeParse({ lat: -91, lng: 69, address: 'x' }).success).toBe(false);
  });

  it('lng diapazondan tashqari (-180..180) rad etadi', () => {
    expect(LocationSchema.safeParse({ lat: 41, lng: 181, address: 'x' }).success).toBe(false);
  });

  it("bo'sh manzilni rad etadi", () => {
    expect(LocationSchema.safeParse({ lat: 41, lng: 69, address: '' }).success).toBe(false);
  });
});

describe('BoundsSchema', () => {
  it("4 yo'nalishli chegarani qabul qiladi", () => {
    expect(
      BoundsSchema.safeParse({ north: 41.5, south: 41.1, east: 69.5, west: 69.0 }).success,
    ).toBe(true);
  });

  it("yetishmayotgan yo'nalishni rad etadi", () => {
    expect(BoundsSchema.safeParse({ north: 41.5, south: 41.1, east: 69.5 }).success).toBe(false);
  });
});

// ─── MasterSchema ────────────────────────────────────────────────────────────

describe('MasterSchema', () => {
  it("to'liq valid ustani qabul qiladi", () => {
    const result = MasterSchema.safeParse(VALID_MASTER);
    expect(result.success).toBe(true);
  });

  it('avatarUrl va distanceKm ixtiyoriyligi', () => {
    const { avatarUrl, distanceKm, ...minimal } = VALID_MASTER;
    // sentinel — fixture haqiqatan bu maydonlarga ega ekanini tasdiqlaymiz
    expect(avatarUrl).toBeDefined();
    expect(distanceKm).toBeDefined();
    expect(MasterSchema.safeParse(minimal).success).toBe(true);
  });

  it("rating 0 dan kichik bo'lsa rad etadi", () => {
    expect(MasterSchema.safeParse({ ...VALID_MASTER, rating: -0.1 }).success).toBe(false);
  });

  it("rating 5 dan katta bo'lsa rad etadi", () => {
    expect(MasterSchema.safeParse({ ...VALID_MASTER, rating: 5.1 }).success).toBe(false);
  });

  it('rating chegaralari 0 va 5 — qabul qilinadi', () => {
    expect(MasterSchema.safeParse({ ...VALID_MASTER, rating: 0 }).success).toBe(true);
    expect(MasterSchema.safeParse({ ...VALID_MASTER, rating: 5 }).success).toBe(true);
  });

  it("reviewCount manfiy bo'lsa rad etadi", () => {
    expect(MasterSchema.safeParse({ ...VALID_MASTER, reviewCount: -1 }).success).toBe(false);
  });

  it("reviewCount kasr bo'lsa rad etadi (integer)", () => {
    expect(MasterSchema.safeParse({ ...VALID_MASTER, reviewCount: 3.5 }).success).toBe(false);
  });

  it("priceFrom 0 bo'lsa rad etadi (positive)", () => {
    expect(MasterSchema.safeParse({ ...VALID_MASTER, priceFrom: 0 }).success).toBe(false);
  });

  it("priceFrom kasr bo'lsa rad etadi", () => {
    expect(MasterSchema.safeParse({ ...VALID_MASTER, priceFrom: 50_000.5 }).success).toBe(false);
  });

  it("currency UZS bo'lmasa rad etadi", () => {
    expect(MasterSchema.safeParse({ ...VALID_MASTER, currency: 'USD' }).success).toBe(false);
  });

  it("noto'g'ri trustLevel'ni rad etadi", () => {
    expect(MasterSchema.safeParse({ ...VALID_MASTER, trustLevel: 'vip' }).success).toBe(false);
  });

  it("avatarUrl URL emas bo'lsa rad etadi", () => {
    expect(MasterSchema.safeParse({ ...VALID_MASTER, avatarUrl: 'not-a-url' }).success).toBe(false);
  });

  it("bo'sh id'ni rad etadi", () => {
    expect(MasterSchema.safeParse({ ...VALID_MASTER, id: '' }).success).toBe(false);
  });

  it("majburiy maydon yo'q bo'lsa aniq xato qaytaradi", () => {
    const { name, ...withoutName } = VALID_MASTER;
    expect(name).toBeDefined();
    const result = MasterSchema.safeParse(withoutName);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('name'));
      expect(issue).toBeDefined();
    }
  });
});

// ─── CategorySchema ──────────────────────────────────────────────────────────

describe('CategorySchema', () => {
  it('valid kategoriyani qabul qiladi', () => {
    expect(
      CategorySchema.safeParse({
        id: 'elektrik',
        name: 'Elektrik',
        emoji: '⚡',
        masterCount: 42,
      }).success,
    ).toBe(true);
  });

  it('masterCount 0 — qabul qilinadi (yangi kategoriya)', () => {
    expect(
      CategorySchema.safeParse({
        id: 'new',
        name: 'Yangi',
        emoji: '✨',
        masterCount: 0,
      }).success,
    ).toBe(true);
  });

  it("bo'sh emoji'ni rad etadi", () => {
    expect(
      CategorySchema.safeParse({
        id: 'x',
        name: 'X',
        emoji: '',
        masterCount: 1,
      }).success,
    ).toBe(false);
  });

  it('50 harfdan uzun nomni rad etadi', () => {
    expect(
      CategorySchema.safeParse({
        id: 'x',
        name: 'A'.repeat(51),
        emoji: '⚡',
        masterCount: 1,
      }).success,
    ).toBe(false);
  });
});

// ─── SearchFilterSchema ──────────────────────────────────────────────────────

describe('SearchFilterSchema', () => {
  it("faqat q bilan acceptance — default'lar to'ldiriladi", () => {
    const result = SearchFilterSchema.safeParse({ q: 'usta' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe('usta');
      expect(result.data.sort).toBe('rating');
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(20);
    }
  });

  it("bo'sh obyektni qabul qiladi (hamma default)", () => {
    const result = SearchFilterSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sort).toBe('rating');
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(20);
    }
  });

  it("to'liq filter kombinatsiyasini qabul qiladi", () => {
    const result = SearchFilterSchema.safeParse({
      q: 'kir yuvish',
      categoryId: 'ta-mirlash',
      rating: 4.5,
      priceFrom: 50_000,
      priceTo: 300_000,
      online: true,
      trustLevel: 'pro',
      sort: 'price',
      page: 2,
      pageSize: 30,
    });
    expect(result.success).toBe(true);
  });

  it("priceFrom > priceTo bo'lsa rad etadi (refinement)", () => {
    const result = SearchFilterSchema.safeParse({
      priceFrom: 500_000,
      priceTo: 100_000,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('priceFrom');
    }
  });

  it('priceFrom === priceTo — qabul qilinadi', () => {
    expect(SearchFilterSchema.safeParse({ priceFrom: 100_000, priceTo: 100_000 }).success).toBe(
      true,
    );
  });

  it("faqat priceFrom (priceTo yo'q) — refinement tushmaydi", () => {
    expect(SearchFilterSchema.safeParse({ priceFrom: 50_000 }).success).toBe(true);
  });

  it('pageSize chegaralari: 10 min, 50 max', () => {
    expect(SearchFilterSchema.safeParse({ pageSize: 9 }).success).toBe(false);
    expect(SearchFilterSchema.safeParse({ pageSize: 10 }).success).toBe(true);
    expect(SearchFilterSchema.safeParse({ pageSize: 50 }).success).toBe(true);
    expect(SearchFilterSchema.safeParse({ pageSize: 51 }).success).toBe(false);
  });

  it('page 0 yoki manfiy — rad etiladi', () => {
    expect(SearchFilterSchema.safeParse({ page: 0 }).success).toBe(false);
    expect(SearchFilterSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it('bounds bilan filter', () => {
    const result = SearchFilterSchema.safeParse({
      bounds: { north: 41.5, south: 41.1, east: 69.5, west: 69.0 },
    });
    expect(result.success).toBe(true);
  });

  it('q maksimal 100 belgi', () => {
    expect(SearchFilterSchema.safeParse({ q: 'a'.repeat(100) }).success).toBe(true);
    expect(SearchFilterSchema.safeParse({ q: 'a'.repeat(101) }).success).toBe(false);
  });

  it("filter trustLevel 'basic' ni rad etadi", () => {
    expect(SearchFilterSchema.safeParse({ trustLevel: 'basic' }).success).toBe(false);
  });
});

// ─── SearchResponseSchema ────────────────────────────────────────────────────

describe('SearchResponseSchema', () => {
  it("bo'sh javob — 0 usta topildi", () => {
    expect(
      SearchResponseSchema.safeParse({
        masters: [],
        total: 0,
        page: 1,
        pageSize: 20,
        hasMore: false,
      }).success,
    ).toBe(true);
  });

  it('paginated javob', () => {
    const result = SearchResponseSchema.safeParse({
      masters: [VALID_MASTER],
      total: 47,
      page: 1,
      pageSize: 20,
      hasMore: true,
    });
    expect(result.success).toBe(true);
  });

  it("masters massivida invalid element bo'lsa rad etadi", () => {
    const result = SearchResponseSchema.safeParse({
      masters: [VALID_MASTER, { ...VALID_MASTER, rating: 999 }],
      total: 2,
      page: 1,
      pageSize: 20,
      hasMore: false,
    });
    expect(result.success).toBe(false);
  });

  it("total manfiy bo'lsa rad etadi", () => {
    expect(
      SearchResponseSchema.safeParse({
        masters: [],
        total: -1,
        page: 1,
        pageSize: 20,
        hasMore: false,
      }).success,
    ).toBe(false);
  });
});
