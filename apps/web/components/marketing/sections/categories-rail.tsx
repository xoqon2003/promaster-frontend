import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

import { CATEGORIES } from '@/components/marketing/data/categories';
import { cn } from '@/lib/utils';

export async function CategoriesRail() {
  const t = await getTranslations('marketing.categories');
  const tCommon = await getTranslations('common');

  return (
    <section
      id="categories"
      aria-labelledby="categories-heading"
      className="bg-background scroll-mt-20 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2
              id="categories-heading"
              className="text-foreground font-display text-3xl font-bold text-balance sm:text-4xl"
            >
              {t('title')}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm text-pretty sm:text-base">
              {t('subtitle')}
            </p>
          </div>
          <Link
            href="/search"
            className="text-brand-500 hover:text-brand-600 hidden shrink-0 items-center gap-1 text-sm font-medium sm:inline-flex"
          >
            {tCommon('viewAll')}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <ul
          role="list"
          className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <li key={cat.key}>
                <Link
                  href={cat.href}
                  className="group border-border bg-card hover:border-brand-500 hover:bg-brand-50/40 dark:hover:bg-brand-950/30 focus-visible:ring-brand-500/40 flex h-full flex-col items-start gap-3 rounded-xl border p-4 transition-all focus-visible:ring-2 focus-visible:outline-none"
                >
                  <span
                    className={cn(
                      'inline-flex size-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110',
                      cat.toneBg,
                      cat.tone,
                    )}
                    aria-hidden="true"
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="text-foreground text-sm leading-tight font-medium">
                    {t(`items.${cat.key}` as 'items.repair')}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
