'use client';

/**
 * `ResultGrid` — Qidiruv natijalar grid komponenti.
 *
 * Task: T3.15
 *
 * Layout:
 *  - 4 kolonna desktop (lg), 2 kolonna tablet (sm), 1 kolonna < 360px
 *  - Loading: 8 ta MasterCard skeleton (built-in `isLoading`)
 *  - Success: MasterCard'lar + "Ko'proq ko'rsatish" pagination tugmasi
 *  - Empty: "Natija topilmadi" state
 *  - Error: alert + "Qayta urinib ko'ring" retry
 *
 * Pagination:
 *  - "Ko'proq ko'rsatish" → onLoadMore() → page=N+1 (replace, not append)
 *  - `isPending` da tugmada spinner
 *  - Max 10 sahifa (hasMore=false bo'lsa tugma yo'q)
 *
 * Props orqali boshqariladi — SearchView'da allaqachon mavjud bo'lgan
 * `useMasters` state'ini qayta ishlatadi (ikki marta fetch yo'q).
 */
import { Loader2 } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';

import { MasterCard } from '@/components/domain/master-card/master-card';
import { Button } from '@/components/ui/button';
import type { SearchResponse } from '@/lib/masters/schemas';

// ─── Constants ───────────────────────────────────────────────────────────────

const SKELETON_COUNT = 8;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ResultGridProps {
  data: SearchResponse | undefined;
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
  onLoadMore: () => void;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SkeletonGrid() {
  return (
    <ul
      data-testid="result-grid-skeleton"
      className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 lg:grid-cols-4"
    >
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <li key={`skeleton-${i}`}>
          <MasterCard
            isLoading
            master={{
              id: `sk-${i}`,
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
  );
}

function EmptyState() {
  return (
    <div
      data-slot="result-grid-empty"
      className="border-border bg-card text-muted-foreground rounded-2xl border px-4 py-16 text-center text-sm"
    >
      <p className="text-base font-medium">Natija topilmadi</p>
      <p className="mt-1">Filterni o&apos;zgartiring yoki qidiruv so&apos;zini tahrirlang.</p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      data-slot="result-grid-error"
      className="border-border bg-card text-muted-foreground rounded-2xl border px-4 py-8 text-center text-sm"
    >
      <p>Natijalarni yuklab bo&apos;lmadi.</p>
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

export function ResultGrid({ data, isPending, isError, onRetry, onLoadMore }: ResultGridProps) {
  const [, setMasterId] = useQueryState('masterId', parseAsString);
  if (isError) {
    return <ErrorState onRetry={onRetry} />;
  }

  if (isPending) {
    return <SkeletonGrid />;
  }

  const masters = data?.masters ?? [];
  const hasMore = data?.hasMore ?? false;

  if (masters.length === 0) {
    return <EmptyState />;
  }

  return (
    <div data-slot="result-grid" className="space-y-6">
      <ul
        data-testid="result-grid-list"
        className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 lg:grid-cols-4"
      >
        {masters.map((master) => (
          <li key={master.id}>
            <MasterCard master={master} onPress={() => void setMasterId(master.id)} />
          </li>
        ))}
      </ul>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            data-testid="load-more-btn"
            variant="outline"
            onClick={onLoadMore}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
                Yuklanmoqda…
              </>
            ) : (
              "Ko'proq ko'rsatish"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Test exports ─────────────────────────────────────────────────────────────

/** @internal */
export const __test__ = { SkeletonGrid, EmptyState, ErrorState, SKELETON_COUNT };
