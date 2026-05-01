'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { isLocale, LOCALE_COOKIE, type Locale } from './config';

/**
 * Set user locale via cookie. Used by `<LocaleSwitcher />` in marketing
 * header + footer. Revalidates the layout so the new locale is applied
 * server-side on next render.
 */
export async function setLocaleAction(value: string): Promise<void> {
  if (!isLocale(value)) return;
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, value satisfies Locale, {
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  });
  revalidatePath('/', 'layout');
}
