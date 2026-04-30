/**
 * Relative duration formatter (S06 T6.06).
 *
 * `formatRelativeDuration(2 * 60 * 1000, 'uz')` → `'2 daqiqa'`.
 *
 * Bu i18n sozlanmagunicha vaqtinchalik yengil dictionary bilan
 * ishlaydigan helper. `next-intl` qo'shilgach, `Intl.RelativeTimeFormat`
 * bilan almashtiriladi (UZ Intl-supported emas — ICU tarjimasi yashaydi).
 *
 * @example
 *   formatRelativeDuration(45_000, 'uz')        // 'hozirgina'
 *   formatRelativeDuration(720_000, 'uz')       // '12 daqiqa'
 *   formatRelativeDuration(7_200_000, 'ru')     // '2 ч'
 *   formatRelativeDuration(86_400_000, 'en')    // '1 day'
 */
export type SupportedLocale = 'uz' | 'ru' | 'en';

interface DurationStrings {
  justNow: string;
  /** `(n) => 'N daqiqa'` */
  minutes: (n: number) => string;
  hours: (n: number) => string;
  days: (n: number) => string;
}

const STRINGS: Record<SupportedLocale, DurationStrings> = {
  uz: {
    justNow: 'hozirgina',
    minutes: (n) => `${n} daqiqa`,
    hours: (n) => `${n} soat`,
    days: (n) => `${n} kun`,
  },
  ru: {
    justNow: 'только что',
    minutes: (n) => `${n} мин`,
    hours: (n) => `${n} ч`,
    days: (n) => `${n} ${n === 1 ? 'день' : n < 5 ? 'дня' : 'дней'}`,
  },
  en: {
    justNow: 'just now',
    minutes: (n) => `${n} ${n === 1 ? 'minute' : 'minutes'}`,
    hours: (n) => `${n} ${n === 1 ? 'hour' : 'hours'}`,
    days: (n) => `${n} ${n === 1 ? 'day' : 'days'}`,
  },
};

const ONE_MINUTE_MS = 60_000;
const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;

export function formatRelativeDuration(durationMs: number, locale: SupportedLocale = 'uz'): string {
  const ms = Math.max(0, durationMs);
  const s = STRINGS[locale];

  if (ms < ONE_MINUTE_MS) return s.justNow;
  if (ms < ONE_HOUR_MS) return s.minutes(Math.floor(ms / ONE_MINUTE_MS));
  if (ms < ONE_DAY_MS) return s.hours(Math.floor(ms / ONE_HOUR_MS));
  return s.days(Math.floor(ms / ONE_DAY_MS));
}

/**
 * Sana bilan hozirgi vaqt orasidagi farqni format qilish — UI'da ko'p
 * ishlatiladi ("3 daqiqa oldin" turidagi paterns).
 */
export function formatRelativeFromNow(
  date: Date | string,
  locale: SupportedLocale = 'uz',
  now: Date = new Date(),
): string {
  const target = typeof date === 'string' ? new Date(date) : date;
  return formatRelativeDuration(now.getTime() - target.getTime(), locale);
}
