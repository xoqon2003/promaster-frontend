/**
 * Masters domain — public type surface.
 *
 * Task: T3.01
 * Import path: `@/lib/masters/types`
 *
 * Bu fayl komponentlar va hooklar uchun toza type API bo'lib xizmat qiladi.
 * Zod schemalarni import qilish o'rniga (bundle'da runtime Zod kerak emas
 * bo'lgan joyda) shu re-export ishlatiladi.
 *
 * @example
 *   import type { Master, Category, SearchFilter } from '@/lib/masters/types';
 */
export type {
  Bounds,
  Category,
  Currency,
  FilterableTrustLevel,
  Location,
  Master,
  SearchFilter,
  SearchFilterInput,
  SearchResponse,
  SortOption,
  TrustLevel,
} from './schemas';
