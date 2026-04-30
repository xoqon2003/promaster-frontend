/**
 * PII scrubber — Sentry event'laridan O'zbek telefon raqamlarini olib tashlaydi.
 *
 * Task: T5.09 (S05) — acceptance criterion #4
 *
 * GDPR / O'zbekiston "Shaxsga oid ma'lumotlar to'g'risida" qonunining
 * 7-moddasi. Crash report'da real raqam saqlanmasligi kerak — debugging
 * uchun masklangan ko'rinish kifoya.
 *
 * Pattern: barcha string'larda `+998XXXXXXXXX` → `+998*********`.
 * Faqat E.164 O'zbek raqamlari (PhoneSchema natijasi).
 */

const UZ_PHONE = /\+998\d{9}/g;
const MASK = '+998*********';

export function scrubPhoneFromString(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  return value.replace(UZ_PHONE, MASK);
}

/**
 * Rekursiv scrub — ob'ekt ichidagi barcha string field'larni tekshiradi.
 * Sentry event'lari murakkab tuzilishga ega (exception.values[].value,
 * breadcrumb.message, request.data, va h.k.) — depth-first traversal.
 */
export function scrubPhoneDeep<T>(value: T, depth = 0): T {
  if (depth > 10) return value;
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    return value.replace(UZ_PHONE, MASK) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => scrubPhoneDeep(item, depth + 1)) as T;
  }
  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = scrubPhoneDeep(val, depth + 1);
    }
    return result as T;
  }
  return value;
}
