import { MapPin, Search, UserCheck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

const STEPS = [
  { id: 'first', icon: Search },
  { id: 'second', icon: UserCheck },
  { id: 'third', icon: MapPin },
] as const;

export async function HowItWorks() {
  const t = await getTranslations('marketing.howItWorks');

  return (
    <section
      id="how-it-works"
      aria-labelledby="hiw-heading"
      className="bg-background scroll-mt-20 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="hiw-heading"
            className="text-foreground font-display text-3xl font-bold text-balance sm:text-4xl"
          >
            {t('title')}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm text-pretty sm:text-base">
            {t('subtitle')}
          </p>
        </div>

        <ol
          role="list"
          aria-label="Buyurtma berish bosqichlari"
          className="mt-12 grid gap-6 md:grid-cols-3"
        >
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <li
                key={step.id}
                className="border-border bg-card relative overflow-hidden rounded-2xl border p-6 sm:p-8"
              >
                {/* Step number watermark */}
                <span
                  aria-hidden="true"
                  className="text-brand-100 dark:text-brand-900/40 font-display absolute -top-3 -right-2 text-7xl leading-none font-bold select-none"
                >
                  {idx + 1}
                </span>

                <span className="bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300 relative inline-flex size-12 items-center justify-center rounded-xl">
                  <Icon className="size-6" aria-hidden="true" />
                </span>

                <h3 className="text-foreground font-display relative mt-4 text-lg font-semibold sm:text-xl">
                  {t(`steps.${step.id}.title` as 'steps.first.title')}
                </h3>
                <p className="text-muted-foreground relative mt-2 text-sm leading-relaxed sm:text-base">
                  {t(`steps.${step.id}.description` as 'steps.first.description')}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
