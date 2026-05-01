import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { CategoriesRail } from '@/components/marketing/sections/categories-rail';
import { CtaSection } from '@/components/marketing/sections/cta-section';
import { FaqSection } from '@/components/marketing/sections/faq-section';
import { HeroSection } from '@/components/marketing/sections/hero-section';
import { HowItWorks } from '@/components/marketing/sections/how-it-works';
import { TestimonialsSection } from '@/components/marketing/sections/testimonials-section';
import { TopMasters } from '@/components/marketing/sections/top-masters';
import { TrustSection } from '@/components/marketing/sections/trust-section';
import { getLocale } from '@/lib/i18n/get-locale';

/**
 * Marketing landing — `/`
 *
 * Sprint S08 (Marketing Landing 2.0). Sections:
 *   1. Hero — gradient + value prop + dual CTA + search + stats
 *   2. Categories Rail — 12 main directions
 *   3. How it works — 3 steps
 *   4. Top Masters — 6 demo cards (mock; replaced S09 by real query)
 *   5. Trust — Escrow, MyID, Certified, Warranty
 *   6. Testimonials — 3 voices (UZ/RU/EN per locale)
 *   7. FAQ — 8 Q&A + JSON-LD FAQPage
 *   8. CTA — gradient call-to-action
 *
 * All sections are RSC except FAQ (accordion needs client state) and the
 * locale switcher in header/footer. JSON-LD structured data emitted in
 * page metadata for richer SERP. Lighthouse mobile target ≥ 90.
 */

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('marketing.hero');
  return {
    title: `UstaTop.uz — ${t('title')}`,
    description: t('subtitle'),
    alternates: { canonical: '/' },
  };
}

export default async function MarketingHomePage() {
  const locale = await getLocale();
  const tFaq = await getTranslations('marketing.faq');

  // FAQPage JSON-LD for SEO rich snippets.
  const faqItems = tFaq.raw('items') as Array<{ q: string; a: string }>;
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'UstaTop.uz',
    url: 'https://ustatop.uz',
    logo: 'https://ustatop.uz/icon.png',
    description: "O'zbekistondagi professional ustalar marketplace.",
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Toshkent',
      addressCountry: 'UZ',
    },
    sameAs: [
      'https://t.me/ustatop',
      'https://instagram.com/ustatop',
      'https://facebook.com/ustatop',
      'https://youtube.com/@ustatop',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger -- trusted server-generated JSON-LD
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger -- trusted server-generated JSON-LD
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <HeroSection />
      <CategoriesRail />
      <HowItWorks />
      <TopMasters />
      <TrustSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />

      {/* SR-only locale telemetry — used by analytics in S10 */}
      <span className="sr-only" data-locale={locale}>
        {locale}
      </span>
    </>
  );
}
