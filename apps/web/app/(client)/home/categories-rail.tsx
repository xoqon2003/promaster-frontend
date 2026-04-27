'use client';

/**
 * `CategoriesRail` — Home sahifa kategoriyalar gorizontal scroll bloki.
 *
 * Task: T3.10
 *
 * Tarkib:
 *  - `useCategories()` orqali 10 ta kategoriya yuklanadi
 *  - Loading: 3 ta CategoryCardSkeleton (shimmer)
 *  - Error: inline xato + "Qayta urinib ko'ring" tugmasi (refetch)
 *  - Success: horizontal scroll, snap-x mandatory, har card -> /search?categoryId
 *
 * Scroll affordance:
 *  - Mobile: native touch scroll (overflow-x-auto)
 *  - Desktop: chap/o'ng fade gradient (scroll davomi borligini ko'rsatadi)
 *    + native Shift+wheel scroll (browser tomonidan)
 */
import { CategoryCard } from '@/components/domain/category-card';
import { useCategories } from '@/lib/hooks/use-categories';
import { cn } from '@/lib/utils';

// ─── Constants ───────────────────────────────────────────────────────────────

const SKELETON_COUNT = 3;

// ─── Sub-components ──────────────────────────────────────────────────────────

function CategoryCardSkeleton() {
  return (
    <div
      data-slot="category-card-skeleton"
      aria-hidden="true"
      className="bg-muted h-[100px] w-[120px] shrink-0 animate-pulse rounded-2xl"
    />
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      data-slot="categories-rail-error"
      className="border-border bg-card text-muted-foreground rounded-2xl border px-4 py-6 text-center text-sm"
    >
      <p>Kategoriyalarni yuklab bo&apos;lmadi.</p>
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

export function CategoriesRail() {
  const { data, isPending, isError, refetch } = useCategories();

  return (
    <section data-slot="home-categories-rail" aria-label="Kategoriyalar" className="px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-foreground mb-4 text-lg font-semibold sm:text-xl">Kategoriyalar</h2>

        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (
          <div className="relative">
            <div
              aria-hidden="true"
              className="from-background pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-8 bg-gradient-to-r to-transparent sm:block"
            />
            <div
              aria-hidden="true"
              className="from-background pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-8 bg-gradient-to-l to-transparent sm:block"
            />

            <ul
              data-testid="categories-rail-track"
              className={cn(
                'flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth py-2',
                'scrollbar-thin [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
              )}
            >
              {isPending
                ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                    <li key={`skeleton-${index}`} className="snap-start">
                      <CategoryCardSkeleton />
                    </li>
                  ))
                : data?.map((category) => (
                    <li key={category.id} className="snap-start">
                      <CategoryCard
                        category={category}
                        href={`/search?categoryId=${encodeURIComponent(category.id)}`}
                      />
                    </li>
                  ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Test exports ────────────────────────────────────────────────────────────

/** @internal — testlardan iste'mol qilinadi (story/test re-render uchun ham qulay). */
export const __test__ = { CategoryCardSkeleton, ErrorState, SKELETON_COUNT };
