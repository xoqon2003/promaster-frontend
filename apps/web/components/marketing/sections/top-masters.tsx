import { ArrowRight, BadgeCheck, MapPin, Star } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';

import { TOP_MASTERS, type TrustTier } from '@/components/marketing/data/masters';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TRUST_TONE: Record<TrustTier, { label: string; cls: string }> = {
  basic: { label: 'Basic', cls: 'bg-trust-basic-bg text-trust-basic' },
  verified: { label: 'Verified', cls: 'bg-trust-verified-bg text-success-fg' },
  pro: { label: 'Pro', cls: 'bg-trust-pro-bg text-trust-pro' },
  premium: { label: 'Premium', cls: 'bg-trust-premium-bg text-trust-premium' },
};

export async function TopMasters() {
  const t = await getTranslations('marketing.topMasters');
  const tCommon = await getTranslations('common');
  const tCat = await getTranslations('marketing.categories');

  return (
    <section
      id="top-masters"
      aria-labelledby="masters-heading"
      className="bg-muted/30 scroll-mt-20 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2
              id="masters-heading"
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

        <ul role="list" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOP_MASTERS.map((m) => {
            const tone = TRUST_TONE[m.trust];
            return (
              <li
                key={m.id}
                className="group border-border bg-card hover:border-brand-300 flex flex-col gap-4 rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="border-border relative size-14 shrink-0 overflow-hidden rounded-full border">
                    <Image
                      src={m.avatar}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-foreground truncate font-semibold">{m.name}</h3>
                      <BadgeCheck
                        className="text-success-fg size-4 shrink-0"
                        aria-label="Tekshirilgan"
                      />
                    </div>
                    <p className="text-muted-foreground mt-0.5 truncate text-sm">
                      {tCat(`items.${m.category}` as 'items.repair')}
                    </p>
                    <p className="text-muted-foreground/80 mt-0.5 flex items-center gap-1 truncate text-xs">
                      <MapPin className="size-3 shrink-0" aria-hidden="true" />
                      {m.city}
                    </p>
                  </div>
                  <Badge variant="secondary" className={cn('shrink-0 text-xs', tone.cls)}>
                    {tone.label}
                  </Badge>
                </div>

                <dl className="border-border text-muted-foreground grid grid-cols-3 border-t pt-3 text-xs">
                  <div>
                    <dt className="sr-only">Reyting</dt>
                    <dd className="text-foreground flex items-center gap-1 font-semibold">
                      <Star className="text-warning-fg size-3.5 fill-current" aria-hidden="true" />
                      {m.rating.toFixed(2)}
                    </dd>
                    <span className="text-[10px]">{m.reviews} sharh</span>
                  </div>
                  <div>
                    <dt className="sr-only">Buyurtmalar</dt>
                    <dd className="text-foreground font-semibold">{m.ordersCount}</dd>
                    <span className="text-[10px]">
                      {t('ordersCount', { count: m.ordersCount })}
                    </span>
                  </div>
                  <div>
                    <dt className="sr-only">Tajriba</dt>
                    <dd className="text-foreground font-semibold">{m.yearsExperience}+</dd>
                    <span className="text-[10px]">
                      {t('yearsExperience', { years: m.yearsExperience })}
                    </span>
                  </div>
                </dl>

                <Link
                  href={`/master/${m.id}`}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'sm' }),
                    'group-hover:border-brand-400 group-hover:text-brand-600 w-full',
                  )}
                  aria-label={`${m.name} profilini ko'rish`}
                >
                  {t('viewProfile')}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
