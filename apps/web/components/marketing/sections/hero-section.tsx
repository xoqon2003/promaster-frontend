import { ArrowRight, Search, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STATS = [
  { id: 'masters', value: '1 000+', icon: ShieldCheck },
  { id: 'orders', value: '50K+', icon: Sparkles },
  { id: 'rating', value: '4.92', icon: Star },
  { id: 'cities', value: '8', icon: ArrowRight },
] as const;

export async function HeroSection() {
  const t = await getTranslations('marketing.hero');

  return (
    <section aria-labelledby="hero-heading" id="main" className="relative isolate overflow-hidden">
      {/* Background gradient */}
      <div
        aria-hidden="true"
        className="from-brand-50 via-background to-background dark:from-brand-950/40 absolute inset-0 -z-10 bg-gradient-to-b"
      />
      <div
        aria-hidden="true"
        className="bg-brand-500/10 absolute -top-40 left-1/2 -z-10 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-4 pt-12 pb-16 sm:px-6 sm:pt-20 sm:pb-24 lg:pt-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          {/* Badge */}
          <span className="bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium">
            {t('badge')}
          </span>

          {/* Title */}
          <h1
            id="hero-heading"
            className="text-foreground font-display mt-6 text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl md:text-6xl"
          >
            {t.rich('title', {
              accent: (chunks) => (
                <span className="text-brand-500 whitespace-nowrap">{chunks}</span>
              ),
            })}
          </h1>

          {/* Subtitle */}
          <p className="text-muted-foreground mt-5 max-w-xl text-base leading-relaxed text-pretty sm:text-lg">
            {t('subtitle')}
          </p>

          {/* Search bar */}
          <form
            action="/search"
            method="GET"
            role="search"
            aria-label={t('searchButton')}
            className="border-border bg-card/80 mt-8 flex w-full max-w-2xl flex-col gap-2 rounded-2xl border p-2 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center"
          >
            <label htmlFor="hero-search" className="sr-only">
              {t('searchPlaceholder')}
            </label>
            <div className="flex flex-1 items-center gap-2 px-3">
              <Search className="text-muted-foreground size-5 shrink-0" aria-hidden="true" />
              <input
                id="hero-search"
                name="q"
                type="search"
                placeholder={t('searchPlaceholder')}
                className="text-foreground placeholder:text-muted-foreground h-11 w-full bg-transparent text-sm outline-none"
              />
            </div>
            <button
              type="submit"
              className={cn(buttonVariants({ size: 'lg' }), 'h-11 px-5 sm:w-auto')}
            >
              {t('searchButton')}
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </form>

          {/* CTAs */}
          <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Link href="/signup" className={cn(buttonVariants({ size: 'lg' }), 'h-11 px-5')}>
              {t('ctaPrimary')}
            </Link>
            <Link
              href="/signup?role=pro"
              className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'h-11 px-5')}
            >
              {t('ctaSecondary')}
            </Link>
          </div>
        </div>

        {/* Stats */}
        <dl className="border-border bg-border mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border md:grid-cols-4">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                className="bg-card flex flex-col items-center justify-center gap-1 px-4 py-6 text-center"
              >
                <Icon className="text-brand-500 size-4" aria-hidden="true" />
                <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  {t(`stats.${stat.id}` as 'stats.masters')}
                </dt>
                <dd className="text-foreground font-display text-2xl font-bold sm:text-3xl">
                  {stat.value}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
