'use client';

import { useTranslations } from 'next-intl';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FaqItem {
  q: string;
  a: string;
}

export function FaqSection() {
  const t = useTranslations('marketing.faq');
  const items = t.raw('items') as FaqItem[];

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="bg-muted/40 scroll-mt-20 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <h2
            id="faq-heading"
            className="text-foreground font-display text-3xl font-bold text-balance sm:text-4xl"
          >
            {t('title')}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm text-pretty sm:text-base">
            {t('subtitle')}
          </p>
        </div>

        <Accordion className="mt-10">
          {items.map((item, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger className="py-4 text-base font-semibold sm:text-lg">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pr-8 pb-4 text-sm leading-relaxed sm:text-base">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
