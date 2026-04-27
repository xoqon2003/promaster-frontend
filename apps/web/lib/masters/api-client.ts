/**
 * Masters API client — adapter interface + mock implementation.
 *
 * Task: T3.03
 *
 * Arxitektura (R08 mitigation — schema drift):
 *
 *   ┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
 *   │  TanStack    │ →  │  MastersApi      │ →  │  Mock data   │
 *   │  Query hooks │    │  (interface)     │    │  (current)   │
 *   └──────────────┘    └──────────────────┘    └──────────────┘
 *                               │                       │
 *                               │   Real API tayyor     ▼
 *                               └──────────────── HTTP + fetch
 *
 * Backend tayyor bo'lganda faqat `mockMastersApi` eksporti yangi
 * `httpMastersApi` implementatsiyasi bilan almashtiriladi — UI layer
 * (hooks va komponentlar) umuman o'zgarmaydi.
 */
import { MOCK_CATEGORIES, MOCK_MASTERS } from './mock-data';
import {
  type Category,
  type Master,
  type SearchFilter,
  type SearchFilterInput,
  type SearchResponse,
  SearchFilterSchema,
} from './schemas';

// ─── Adapter interface ───────────────────────────────────────────────────────

/**
 * Masters API shartnomasi — mock va real implementatsiyalar mos kelishi shart.
 *
 * Har metod `Promise` — TanStack Query iste'moli uchun bir xil shakl.
 */
export interface MastersApi {
  search(filter: SearchFilterInput): Promise<SearchResponse>;
  getById(id: string): Promise<Master | null>;
  getCategories(): Promise<Category[]>;
  getRecommended(opts?: { userId?: string; limit?: number }): Promise<Master[]>;
}

// ─── Mock latency simulator ──────────────────────────────────────────────────

/** Real network feel — skeleton animatsiyasi ko'rinishi uchun kerak. */
async function sleep(ms: number): Promise<void> {
  if (process.env.NODE_ENV === 'test') return; // testlarni tezlashtirish
  await new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Filter logic ────────────────────────────────────────────────────────────

/** TrustLevel ierarxiyasi — "pro" filteri pro + premium ni o'z ichiga oladi. */
const TRUST_RANK: Record<Master['trustLevel'], number> = {
  basic: 0,
  verified: 1,
  pro: 2,
  premium: 3,
};

function matchesQuery(master: Master, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return (
    master.name.toLowerCase().includes(needle) || master.categoryName.toLowerCase().includes(needle)
  );
}

function matchesFilter(master: Master, filter: SearchFilter): boolean {
  if (filter.q !== undefined && !matchesQuery(master, filter.q)) return false;
  if (filter.categoryId && master.categoryId !== filter.categoryId) return false;
  if (filter.rating !== undefined && master.rating < filter.rating) return false;
  if (filter.priceFrom !== undefined && master.priceFrom < filter.priceFrom) return false;
  if (filter.priceTo !== undefined && master.priceFrom > filter.priceTo) return false;
  if (filter.online !== undefined && master.isOnline !== filter.online) return false;
  if (filter.trustLevel && TRUST_RANK[master.trustLevel] < TRUST_RANK[filter.trustLevel]) {
    return false;
  }
  if (filter.bounds) {
    const { lat, lng } = master.location;
    const b = filter.bounds;
    if (lat < b.south || lat > b.north || lng < b.west || lng > b.east) return false;
  }
  return true;
}

// ─── Sort logic ──────────────────────────────────────────────────────────────

function compareByRating(a: Master, b: Master): number {
  return b.rating - a.rating;
}

function compareByPrice(a: Master, b: Master): number {
  return a.priceFrom - b.priceFrom;
}

function compareByDistance(a: Master, b: Master): number {
  // undefined distance => oxiriga tushadi
  const aDist = a.distanceKm ?? Infinity;
  const bDist = b.distanceKm ?? Infinity;
  return aDist - bDist;
}

function compareByNewest(a: Master, b: Master): number {
  // MOCK_MASTERS'da createdAt yo'q — ID kech kelgani "yangiroq" deb qabul qilamiz
  // (m_100 > m_99 > ... > m_1). Real API'da bu createdAt desc bo'ladi.
  const aNum = Number.parseInt(a.id.replace(/\D/g, ''), 10) || 0;
  const bNum = Number.parseInt(b.id.replace(/\D/g, ''), 10) || 0;
  return bNum - aNum;
}

function sortMasters(masters: Master[], sort: SearchFilter['sort']): Master[] {
  const copy = [...masters];
  switch (sort) {
    case 'rating':
      copy.sort(compareByRating);
      break;
    case 'price':
      copy.sort(compareByPrice);
      break;
    case 'distance':
      copy.sort(compareByDistance);
      break;
    case 'newest':
      copy.sort(compareByNewest);
      break;
  }
  return copy;
}

// ─── Mock implementation ─────────────────────────────────────────────────────

const MOCK_LATENCY_MS = 300;

/**
 * Mock adapter — frontend-first strategiya.
 *
 * Holat: in-memory (MOCK_MASTERS, MOCK_CATEGORIES). Har sahifa yuklanishda
 * aynan bir xil data — faqat reload bilan "yangilangan"day ko'rinadi.
 */
export const mockMastersApi: MastersApi = {
  async search(filterInput) {
    await sleep(MOCK_LATENCY_MS);

    // Default qiymatlarni to'ldiramiz + refinement validatsiya
    const parsed = SearchFilterSchema.parse(filterInput);

    const filtered = MOCK_MASTERS.filter((m) => matchesFilter(m, parsed));
    const sorted = sortMasters(filtered, parsed.sort);

    const { page, pageSize } = parsed;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageSlice = sorted.slice(start, end);

    return {
      masters: pageSlice,
      total: sorted.length,
      page,
      pageSize,
      hasMore: end < sorted.length,
    };
  },

  async getById(id) {
    await sleep(MOCK_LATENCY_MS);
    return MOCK_MASTERS.find((m) => m.id === id) ?? null;
  },

  async getCategories() {
    await sleep(MOCK_LATENCY_MS);
    return MOCK_CATEGORIES;
  },

  async getRecommended(opts = {}) {
    await sleep(MOCK_LATENCY_MS);
    const { limit = 8 } = opts;

    // "Pro + premium" + rating desc — real ML modelgacha bu mantiqiy baseline
    return [...MOCK_MASTERS]
      .filter((m) => TRUST_RANK[m.trustLevel] >= TRUST_RANK.verified)
      .sort(compareByRating)
      .slice(0, limit);
  },
};

// ─── Active API ──────────────────────────────────────────────────────────────

/**
 * Hozirgi faol API implementatsiyasi.
 *
 * Backend tayyor bo'lganda bu o'zgaruvchi `httpMastersApi`'ga o'tadi.
 * Hooks va komponentlar faqat shu exportni iste'mol qiladi.
 */
export const mastersApi: MastersApi = mockMastersApi;
