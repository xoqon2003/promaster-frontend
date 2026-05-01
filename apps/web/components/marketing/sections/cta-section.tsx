import { ArrowRight, PlayCircle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export async function CtaSection() {
  const t = await getTranslations('marketing.ctaSection');

  return (
    <section
      aria-labelledby="cta-heading"
      className="relative isolate overflow-hidden py-16 sm:py-24"
    >
      {/* Gradient backdrop */}
      <div
        aria-hidden="true"
        className="from-brand-500 via-brand-600 to-brand-700 absolute inset-0 -z-10 bg-gradient-to-br"
      />
      <div
        aria-hidden="true"
        className="absolute -top-32 right-1/4 -z-10 size-[24rem] rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 left-1/4 -z-10 size-[24rem] rounded-full bg-white/10 blur-3xl"
      />

      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2
          id="cta-heading"
          className="font-display text-3xl leading-tight font-bold text-balance text-white sm:text-4xl md:text-5xl"
        >
          {t('title')}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-pretty text-white/90 sm:text-lg">
          {t('subtitle')}
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'text-brand-700 h-11 bg-white px-6 [a]:hover:bg-white/90',
            )}
          >
            {t('ctaPrimary')}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="/about"
            className={cn(
              buttonVariants({ size: 'lg', variant: 'outline' }),
              'h-11 border-white/30 bg-transparent px-6 text-white hover:border-white hover:bg-white/10 hover:text-white',
            )}
          >
            <PlayCircle className="size-4" aria-hidden="true" />
            {t('ctaSecondary')}
          </Link>
        </div>
      </div>
    </section>
  );
}
