/**
 * Mock ma'lumotlar — 10 kategoriya + 100 usta.
 *
 * Task: T3.02
 * Source: docs/sprints/S03/tasks.md#t302
 *
 * Backend tayyor bo'lgunga qadar shu fayl api-client'ning ma'lumot manbai.
 * Deterministic (seed=42) — testlarda snapshot va E2E fixture sifatida
 * ishlatiladi.
 *
 * Strategiya:
 *  - Har kategoriya aniq 10 ta usta oladi (`i % 10`) — distribution kafolat
 *  - Ism/familiya pool'i — O'zbek + Rus aralash (platforma realligi)
 *  - Koordinatalar Toshkent markazi atrofida (41.31, 69.28 ± 0.15)
 *  - Rating 3.5-5.0 (realistik minimum — kam reytingli ustalar ro'yxatda
 *    yo'q, chunki UstaTop.uz sifat marketplace)
 *
 * @example
 *   import { MOCK_MASTERS, MOCK_CATEGORIES } from '@/lib/masters/mock-data';
 *
 *   // Boshqa seed bilan generatsiya (test uchun):
 *   const alternativeMasters = generateMasters(50, { seed: 99 });
 */
import { faker } from '@faker-js/faker';

import { MasterSchema, type Category, type Master, type TrustLevel } from './schemas';

// ─── Static pools ────────────────────────────────────────────────────────────

const TASHKENT_DISTRICTS = [
  'Chilonzor',
  'Yakkasaroy',
  "Mirzo Ulug'bek",
  'Shayxontohur',
  'Olmazor',
  'Yunusobod',
  'Sergeli',
  'Yashnobod',
  'Uchtepa',
  'Bektemir',
  'Mirobod',
] as const;

const UZBEK_FIRST_NAMES = [
  'Sardor',
  'Aziz',
  'Bobur',
  'Shahzod',
  'Javohir',
  'Nodir',
  'Farrux',
  'Jasur',
  'Otabek',
  "Ulug'bek",
  'Nilufar',
  'Malika',
  'Zarina',
  'Dilnoza',
  'Gulnora',
  'Sevinch',
  'Madina',
  'Feruza',
] as const;

const UZBEK_LAST_NAMES = [
  'Aliyev',
  'Karimov',
  'Rahimov',
  'Tursunov',
  'Yusupov',
  'Nurmatov',
  'Abdullayev',
  'Azimov',
  'Mirzayev',
  'Umarov',
  'Ismoilov',
  'Qodirov',
] as const;

const RUSSIAN_FIRST_NAMES = [
  'Aleksandr',
  'Dmitriy',
  'Ivan',
  'Mikhail',
  'Sergey',
  'Andrey',
  'Olga',
  'Anna',
  'Elena',
  'Yuliya',
  'Natalya',
  'Ekaterina',
] as const;

const RUSSIAN_LAST_NAMES = [
  'Ivanov',
  'Petrov',
  'Sidorov',
  'Smirnov',
  'Kuznetsov',
  'Volkov',
  'Sokolov',
  'Mikhaylov',
] as const;

const PRICE_BUCKETS = [
  30_000, 50_000, 80_000, 100_000, 150_000, 200_000, 300_000, 500_000,
] as const;

const RESPONSE_TIMES = [
  '~5 daqiqa',
  '~15 daqiqa',
  '~30 daqiqa',
  '~1 soat',
  '1 soat ichida',
  '1-2 soat',
] as const;

const TRUST_DISTRIBUTION: Array<{ weight: number; value: TrustLevel }> = [
  { weight: 20, value: 'basic' },
  { weight: 50, value: 'verified' },
  { weight: 25, value: 'pro' },
  { weight: 5, value: 'premium' },
];

const TASHKENT_CENTER = { lat: 41.31, lng: 69.28 };
const COORD_SPREAD = 0.15;
const MASTERS_PER_CATEGORY = 10;

// ─── Categories ──────────────────────────────────────────────────────────────

export const MOCK_CATEGORIES: Category[] = [
  { id: 'elektrik', name: 'Elektrik', emoji: '⚡', masterCount: MASTERS_PER_CATEGORY },
  { id: 'santexnik', name: 'Santexnik', emoji: '🔧', masterCount: MASTERS_PER_CATEGORY },
  { id: 'remont', name: "Ta'mirlash", emoji: '🔨', masterCount: MASTERS_PER_CATEGORY },
  { id: 'dizayn', name: 'Dizayn', emoji: '🎨', masterCount: MASTERS_PER_CATEGORY },
  { id: 'tarbiyachi', name: 'Tarbiyachi', emoji: '👶', masterCount: MASTERS_PER_CATEGORY },
  { id: 'repetitor', name: 'Repetitor', emoji: '📚', masterCount: MASTERS_PER_CATEGORY },
  { id: 'tarjimon', name: 'Tarjimon', emoji: '🗣️', masterCount: MASTERS_PER_CATEGORY },
  { id: 'haydovchi', name: 'Haydovchi', emoji: '🚗', masterCount: MASTERS_PER_CATEGORY },
  { id: 'kurer', name: 'Kuryer', emoji: '📦', masterCount: MASTERS_PER_CATEGORY },
  { id: 'nikoh', name: "To'y xizmati", emoji: '💍', masterCount: MASTERS_PER_CATEGORY },
];

// ─── Master generator ────────────────────────────────────────────────────────

/** Pool'dan tasodifiy element — faker state ishlatiladi (seed deterministic). */
function pick<T>(pool: readonly T[]): T {
  return faker.helpers.arrayElement(pool as T[]);
}

/** Bitta usta generatsiya qiladi — faker state'ga tayanadi, toza funksiya emas. */
function generateMaster(index: number, categories: Category[]): Master {
  const category = categories[index % categories.length];
  if (!category) {
    throw new Error(`Mock generator: kategoriya ${index % categories.length} topilmadi`);
  }

  const isUzbek = faker.datatype.boolean();
  const firstName = pick(isUzbek ? UZBEK_FIRST_NAMES : RUSSIAN_FIRST_NAMES);
  const lastName = pick(isUzbek ? UZBEK_LAST_NAMES : RUSSIAN_LAST_NAMES);

  const raw = {
    id: `m_${index + 1}`,
    name: `${firstName} ${lastName}`,
    avatarUrl: `https://i.pravatar.cc/150?u=m_${index + 1}`,
    rating: faker.number.float({ min: 3.5, max: 5.0, multipleOf: 0.1 }),
    reviewCount: faker.number.int({ min: 0, max: 500 }),
    trustLevel: faker.helpers.weightedArrayElement(TRUST_DISTRIBUTION),
    categoryId: category.id,
    categoryName: category.name,
    priceFrom: pick(PRICE_BUCKETS),
    currency: 'UZS' as const,
    isOnline: faker.datatype.boolean(),
    responseTime: pick(RESPONSE_TIMES),
    location: {
      lat:
        TASHKENT_CENTER.lat +
        faker.number.float({ min: -COORD_SPREAD, max: COORD_SPREAD, multipleOf: 0.0001 }),
      lng:
        TASHKENT_CENTER.lng +
        faker.number.float({ min: -COORD_SPREAD, max: COORD_SPREAD, multipleOf: 0.0001 }),
      address: `Toshkent, ${pick(TASHKENT_DISTRICTS)} tumani`,
    },
  };

  // Fail-fast: mock ma'lumot o'zi schema'ga mos bo'lmasa — build paytida yiqilsin
  return MasterSchema.parse(raw);
}

/**
 * N ta mock usta generatsiya qiladi.
 *
 * @param count - Ustalar soni (odatda 100, storybook uchun 10-20 ham mumkin)
 * @param opts.seed - Deterministic natija uchun faker seed (default: 42)
 */
export function generateMasters(
  count: number,
  opts: { seed?: number; categories?: Category[] } = {},
): Master[] {
  const { seed = 42, categories = MOCK_CATEGORIES } = opts;
  faker.seed(seed);

  return Array.from({ length: count }, (_, i) => generateMaster(i, categories));
}

// ─── Exports ─────────────────────────────────────────────────────────────────

/**
 * Default mock usta ro'yxati — 100 ta, seed=42 bilan deterministic.
 *
 * TanStack Query va Playwright E2E fixture sifatida ishlatiladi.
 */
export const MOCK_MASTERS: Master[] = generateMasters(100, { seed: 42 });
