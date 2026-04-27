/**
 * Masters + Search API contract — Zod schemas.
 *
 * Source of truth: docs/sprints/S03/PRD.md#zod-api-contract
 * Task: T3.01
 *
 * Backend hali tayyor emas — bu fayl mock adapter (`mock-data.ts`) uchun
 * shartnoma bo'lib xizmat qiladi. Real API tayyor bo'lganda `api-client.ts`
 * da `.safeParse()` bilan validatsiya qilinadi — schema drift avtomatik
 * aniqlanadi (R08 mitigation).
 */
import { z } from 'zod';

// ─── Reusable sub-schemas ────────────────────────────────────────────────────

/** Master ishonch darajasi (profil verifikatsiya bosqichi). */
export const TrustLevelSchema = z.enum(['basic', 'verified', 'pro', 'premium']);

/**
 * Filter trustLevel — "bundan past bo'lmasin" semantikasi.
 *
 * `basic` filter ro'yxatda yo'q, chunki u default (hamma) — filter
 * o'rnatilmagan bo'lsa hamma trust level ustalar ko'rsatiladi.
 */
export const FilterableTrustLevelSchema = z.enum(['verified', 'pro', 'premium']);

/** Platforma valyutasi. Hozircha faqat UZS (O'zbek so'mi). */
export const CurrencySchema = z.literal('UZS');

/** Qidiruv natijalarini saralash variantlari. */
export const SortOptionSchema = z.enum(['rating', 'price', 'distance', 'newest']);

/** Usta joylashuvi (xaritada pin va manzil matni). */
export const LocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().min(1),
});

/** Xarita viewport chegaralari (Yandex Maps `getBounds()` natijasi). */
export const BoundsSchema = z.object({
  north: z.number().min(-90).max(90),
  south: z.number().min(-90).max(90),
  east: z.number().min(-180).max(180),
  west: z.number().min(-180).max(180),
});

// ─── Domain schemas ──────────────────────────────────────────────────────────

/**
 * Usta — xizmat ko'rsatuvchining to'liq profil ma'lumoti.
 *
 * `MasterCard` komponenti shu tipni to'liq iste'mol qiladi. `distanceKm`
 * faqat geolocation mavjud bo'lganda to'ldiriladi (client-side enrich).
 */
export const MasterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  avatarUrl: z.string().url().optional(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  trustLevel: TrustLevelSchema,
  categoryId: z.string().min(1),
  categoryName: z.string().min(1),
  priceFrom: z.number().int().positive(),
  currency: CurrencySchema,
  isOnline: z.boolean(),
  /** Odatiy javob vaqti — "~15 daqiqa", "1 soat ichida". Frontend i18n qilmaydi. */
  responseTime: z.string().min(1),
  distanceKm: z.number().nonnegative().optional(),
  location: LocationSchema,
});

/**
 * Kategoriya — bosh sahifadagi rail va filter panelidagi ro'yxat.
 *
 * `masterCount` — kategoriyaga tegishli faol ustalar soni (cache, 5 daqiqa TTL).
 */
export const CategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(50),
  emoji: z.string().min(1),
  masterCount: z.number().int().nonnegative(),
});

/**
 * Qidiruv filteri — URL state (nuqs) bilan aynan bir xil shakl.
 *
 * Default qiymatlar URL'ga yozilmaydi (nuqs `skipDefault`) — link qisqaroq
 * va toza bo'ladi. `priceFrom <= priceTo` refinement xato filter'larni
 * darhol tutadi.
 */
export const SearchFilterSchema = z
  .object({
    q: z.string().max(100).optional(),
    categoryId: z.string().optional(),
    rating: z.number().min(0).max(5).optional(),
    priceFrom: z.number().int().nonnegative().optional(),
    priceTo: z.number().int().nonnegative().optional(),
    online: z.boolean().optional(),
    trustLevel: FilterableTrustLevelSchema.optional(),
    bounds: BoundsSchema.optional(),
    sort: SortOptionSchema.default('rating'),
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(10).max(50).default(20),
  })
  .refine((f) => f.priceFrom === undefined || f.priceTo === undefined || f.priceFrom <= f.priceTo, {
    message: "priceFrom priceTo'dan katta bo'la olmaydi",
    path: ['priceFrom'],
  });

/**
 * Qidiruv javobi — paginated natijalar.
 *
 * `hasMore` server hisoblab beradi (total > page * pageSize) — client
 * o'zi hisoblamasin, backend autoritet.
 */
export const SearchResponseSchema = z.object({
  masters: z.array(MasterSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(10).max(50),
  hasMore: z.boolean(),
});

// ─── Types (z.infer re-export) ───────────────────────────────────────────────

export type TrustLevel = z.infer<typeof TrustLevelSchema>;
export type FilterableTrustLevel = z.infer<typeof FilterableTrustLevelSchema>;
export type Currency = z.infer<typeof CurrencySchema>;
export type SortOption = z.infer<typeof SortOptionSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Bounds = z.infer<typeof BoundsSchema>;
export type Master = z.infer<typeof MasterSchema>;
export type Category = z.infer<typeof CategorySchema>;
/** Parsed (resolved defaults applied) — TanStack queryFn uchun */
export type SearchFilter = z.infer<typeof SearchFilterSchema>;
/** Input (all defaults optional) — useSearchFilters setter uchun */
export type SearchFilterInput = z.input<typeof SearchFilterSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
