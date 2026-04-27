'use client';

/**
 * `RecommendedGrid` — Home sahifa "Tavsiya etilgan ustalar" bloki.
 *
 * Task: T3.11
 *
 * Tarkib:
 *  - `useRecommendedMasters({ limit: 8 })` orqali rating desc + nearby ustalar
 *  - Section header: h2 + "Barchasini ko'rish →" linki (`/search?sort=rating`)
 *  - Grid: 4 col desktop (lg), 2 col tablet (sm), 1 col < 360px
 *  - Loading: 8 ta MasterCard skeleton (built-in `isLoading` prop)
 *  - Empty: "Tez orada tavsiyalar paydo bo'ladi" placeholder
 *  - Error: inline alert + "Qayta urinib ko'ring" tugmasi (refetch)
 *
 * MasterCard `onPress` hozircha bog'lanmagan — drawer/quick profile T3.17 da.
 */
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { MasterCard } from '@/components/domain/master-card/master-card';
import { useRecommendedMasters } from '@/lib/hooks/use-recommended-masters';

// ─── Constants ───────────────────────────────────────────────────────────────

const RECOMMENDED_LIMIT = 8;
const SKELETON_COUNT = 8;

// ─── Sub-components ──────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      data-slot="recommended-grid-empty"
      className="border-border bg-card text-muted-foreground rounded-2xl border px-4 py-12 text-center text-sm"
    >
      <p>Tez orada tavsiyalar paydo bo&apos;ladi.</p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      data-slot="recommended-grid-error"
      className="border-border bg-card text-muted-foreground rounded-2xl border px-4 py-6 text-center text-sm"
    >
      <p>Tavsiyalarni yuklab bo&apos;lmadi.</p>
      <button
        type="button"
        onClick={onRetry}
        className="text-brand-500 hover:text-brand-600 focus-visible:ring-brand-500 mt-2 rounded text-sm font-medium underline focus-visible:ring-2 focus-visible:outline-none"
      >
        Qayta urinib ko&apos;ring
      </button>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function RecommendedGrid() {
  const { data, isPending, isError, refetch } = useRecommendedMasters({
    limit: RECOMMENDED_LIMIT,
  });

  return (
    <section
      data-slot="home-recommended-grid"
      aria-label="Tavsiya etilgan ustalar"
      className="px-4 py-6"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-foreground text-lg font-semibold sm:text-xl">
            Tavsiya etilgan ustalar
          </h2>
          <Link
            href="/search?sort=rating"
            data-slot="recommended-see-all"
            className="text-brand-500 hover:text-brand-600 focus-visible:ring-brand-500 inline-flex items-center gap-1 rounded text-sm font-medium focus-visible:ring-2 focus-visible:outline-none"
          >
            Barchasini ko&apos;rish
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : isPending ? (
          <ul
            data-testid="recommended-grid-loading"
            className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 lg:grid-cols-4"
          >
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <li key={`skeleton-${index}`}>
                <MasterCard
                  isLoading
                  master={{
                    id: `skeleton-${index}`,
                    name: '',
                    rating: 0,
                    reviewCount: 0,
                    trustLevel: 'basic',
                    categoryName: '',
                    priceFrom: 0,
                    isOnline: false,
                    responseTime: '',
                  }}
                />
              </li>
            ))}
          </ul>
        ) : data && data.length > 0 ? (
          <ul
            data-testid="recommended-grid-track"
            className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 lg:grid-cols-4"
          >
            {data.map((master) => (
              <li key={master.id}>
                <MasterCard master={master} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  );
}

// ─── Test exports ────────────────────────────────────────────────────────────

/** @internal — testlardan iste'mol qilinadi. */
export const __test__ = {
  EmptyState,
  ErrorState,
  RECOMMENDED_LIMIT,
  SKELETON_COUNT,
};
