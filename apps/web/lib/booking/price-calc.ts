/**
 * Booking narx range estimator.
 *
 * Task: T4.02 (api-client.create) + T4.07 (Step 4 UI)
 *
 * Formula:
 *   priceRange.from = master.priceFrom × estimate.minHours
 *   priceRange.to   = master.priceFrom × estimate.maxHours × 1.5
 *
 * 1.5 koeffitsienti — material/qo'shimcha xizmat bufersi. Mijoz aniq
 * narxni usta bilan kelishadi, lekin range orqali yaqin hududni
 * ko'rsatamiz.
 */
import { getCategoryEstimate } from './category-estimates';

export interface PriceRange {
  from: number;
  to: number;
  currency: 'UZS';
}

/** Narx range bufer koeffitsienti — material/qo'shimcha. */
const PRICE_BUFFER_COEFFICIENT = 1.5;

/**
 * `master.priceFrom` (soatlik) va kategoriya bo'yicha range hisoblaydi.
 *
 * Natija integer (so'm), 1000 ga round qilinadi (UI ko'rinishi).
 *
 * @example
 *   priceFromHourly=50000, category='elektrik' (1-3h)
 *   → from=50000, to=50000×3×1.5=225000 → round → from=50000, to=225000
 */
export function calculatePriceRange(priceFromHourly: number, categoryId: string): PriceRange {
  const estimate = getCategoryEstimate(categoryId);

  const from = Math.round((priceFromHourly * estimate.minHours) / 1000) * 1000;
  const to =
    Math.round((priceFromHourly * estimate.maxHours * PRICE_BUFFER_COEFFICIENT) / 1000) * 1000;

  return { from, to, currency: 'UZS' };
}
