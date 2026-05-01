import { Award, BadgeCheck, ShieldCheck, Wallet } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

const ITEMS = [
  { id: 'escrow', icon: Wallet },
  { id: 'myid', icon: BadgeCheck },
  { id: 'certified', icon: Award },
  { id: 'warranty', icon: ShieldCheck },
] as const;

export async function TrustSection() {
  const t = await getTranslations('marketing.trust');

  return (
    <section aria-labelledby="trust-heading" className="bg-muted/40 scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="trust-heading"
            className="text-foreground font-display text-3xl font-bold text-balance sm:text-4xl"
          >
            {t('title')}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm text-pretty sm:text-base">
            {t('subtitle')}
          </p>
        </div>

        <ul role="list" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <li
                key={item.id}
                className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-6"
              >
                <span className="bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300 inline-flex size-11 items-center justify-center rounded-xl">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-foreground font-display text-base font-semibold">
                    {t(`items.${item.id}.title` as 'items.escrow.title')}
                  </h3>
                  <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                    {t(`items.${item.id}.description` as 'items.escrow.description')}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
