import { getRequestConfig } from 'next-intl/server';

import { getLocale } from './get-locale';

/**
 * next-intl request config — server-side message loading.
 *
 * Locale via cookie (see `get-locale.ts`). Messages dynamic-imported per
 * locale to keep bundle small (each locale ~30KB JSON).
 */
export default getRequestConfig(async () => {
  const locale = await getLocale();
  const messages = (await import(`./messages/${locale}.json`)).default;

  return {
    locale,
    messages,
    timeZone: 'Asia/Tashkent',
    now: new Date(),
  };
});
