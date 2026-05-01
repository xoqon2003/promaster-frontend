import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingHeader } from '@/components/marketing/marketing-header';
import { getLocale } from '@/lib/i18n/get-locale';

// Cookie-based locale → dynamic rendering (per-request).
// Static gen would cache one locale forever for all visitors.
export const dynamic = 'force-dynamic';

/**
 * Marketing layout — public surface (landing, about, pricing, blog, ...).
 *
 * S08: full marketing landing with i18n (UZ default + RU + EN), sticky
 * header with locale switcher, rich 4-column footer. Locale via cookie
 * (`ustatop_locale`) — `<html lang>` updated server-side per request.
 */
export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="bg-background flex min-h-screen flex-col">
        <MarketingHeader locale={locale} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <MarketingFooter locale={locale} />
      </div>
    </NextIntlClientProvider>
  );
}
