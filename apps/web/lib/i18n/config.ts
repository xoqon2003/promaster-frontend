/**
 * i18n config — UstaTop.uz multi-locale.
 *
 * S08 (Marketing Landing): UZ default + RU + EN.
 * Locale switching cookie-based — URL stays clean (`/`), `<html lang>` dynamic.
 * Future: `[locale]` URL segments for SEO (S09+).
 */

export const LOCALES = ['uz', 'ru', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'uz';

export const LOCALE_COOKIE = 'ustatop_locale';

export const LOCALE_LABELS: Record<Locale, { native: string; iso: string; flag: string }> = {
  uz: { native: "O'zbek", iso: 'uz_UZ', flag: '🇺🇿' },
  ru: { native: 'Русский', iso: 'ru_RU', flag: '🇷🇺' },
  en: { native: 'English', iso: 'en_US', flag: '🇬🇧' },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}
