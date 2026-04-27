/**
 * Kategoriya bo'yicha taxminiy soatlar — narx range hisoblash uchun.
 *
 * Task: T4.02 (api-client'ning `create()` ichida ishlatiladi),
 *       T4.07 (Step 4 UI — read-only price estimator)
 *
 * Real backend bu ma'lumotni tarif/marshrut tablitsasidan oladi —
 * hozircha statik mock. Kategoriya ID'lari `MOCK_CATEGORIES` bilan mos
 * (`elektrik`, `santexnik`, `remont`, `dizayn`, ...).
 */

export interface CategoryEstimate {
  /** Eng past taxminiy ish soati (kunduzgi standart). */
  minHours: number;
  /** Eng yuqori taxminiy ish soati. */
  maxHours: number;
}

const ESTIMATES: Record<string, CategoryEstimate> = {
  elektrik: { minHours: 1, maxHours: 3 },
  santexnik: { minHours: 1, maxHours: 4 },
  remont: { minHours: 4, maxHours: 8 },
  dizayn: { minHours: 8, maxHours: 24 },
  tarbiyachi: { minHours: 4, maxHours: 8 },
  repetitor: { minHours: 1, maxHours: 2 },
  tarjimon: { minHours: 1, maxHours: 4 },
  haydovchi: { minHours: 1, maxHours: 6 },
  kurer: { minHours: 1, maxHours: 2 },
  nikoh: { minHours: 6, maxHours: 12 },
};

/** Default — kategoriya topilmasa o'rtacha 2-4 soat. */
const DEFAULT_ESTIMATE: CategoryEstimate = { minHours: 2, maxHours: 4 };

/**
 * Kategoriya ID bo'yicha taxminni qaytaradi. `categoryId` topilmasa,
 * default (2-4 soat) qaytadi — UI bekor qilmaydi, faqat ogohlantirish.
 */
export function getCategoryEstimate(categoryId: string): CategoryEstimate {
  return ESTIMATES[categoryId] ?? DEFAULT_ESTIMATE;
}
