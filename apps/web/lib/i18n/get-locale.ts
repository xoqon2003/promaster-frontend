import { cookies, headers } from 'next/headers';

import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from './config';

/**
 * Server-side locale resolver.
 *
 * Priority: cookie → Accept-Language header → default (uz).
 * Used in (marketing) layout + JSON-LD generators.
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  const headerStore = await headers();
  const accept = headerStore.get('accept-language') ?? '';
  const first = accept.split(',')[0]?.split('-')[0]?.toLowerCase();
  if (isLocale(first)) return first;

  return DEFAULT_LOCALE;
}
