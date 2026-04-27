'use client';

/**
 * `SearchView` — Qidiruv sahifasi client komponenti.
 *
 * Task: T3.12
 *
 * Vazifa: layout skeletoni — top bar (SearchBar + view toggle), sidebar
 * (FilterPanel placeholder), main (ResultGrid yoki MapView placeholder).
 * Real filter UI T3.13'da, sort dropdown T3.14'da, grid T3.15'da, map
 * T3.16'da keladi.
 *
 * State manbai:
 *  - URL `?q, ?categoryId, ?rating, ...` → `useSearchFilters` (T3.04)
 *  - URL `?view=grid|map` → bu yerda `useQueryState` (alohida — useSearchFilters
 *    faqat API filter'lar uchun)
 *  - Natijalar — `useMasters(apiFilter)` (T3.03)
 *
 * SearchBar submit → `setFilters({ q })` orqali URL yangilanadi (router.push
 * shart emas — biz allaqachon shu sahifadamiz, faqat query string yangilanadi).
 */
import { LayoutGrid, MapPin } from 'lucide-react';
import { parseAsStringEnum, useQueryState } from 'nuqs';
import { useCallback } from 'react';

import { SearchBar } from '@/components/features/search-bar';
import { useMasters } from '@/lib/hooks/use-masters';
import { useSearchFilters } from '@/lib/hooks/use-search-filters';
import { cn } from '@/lib/utils';

import { SortDropdown } from '@/components/features/sort-dropdown';

import { FilterPanel, FilterPanelDrawer } from './filter-panel';
import { ResultGrid } from './result-grid';

// ─── Constants ───────────────────────────────────────────────────────────────

const VIEW_OPTIONS = ['grid', 'map'] as const;
type ViewMode = (typeof VIEW_OPTIONS)[number];

const DEFAULT_VIEW: ViewMode = 'grid';

/**
 * Hero bilan bir xil ro'yxat — recent searches va popular suggestion'lar
 * ikkala sahifa o'rtasida bir xil tajriba beradi.
 */
const POPULAR_QUERIES = [
  'Elektrik',
  'Santexnik',
  'Remont ustasi',
  'Dizayner',
  'Repetitor',
  'Tarjimon',
  'Haydovchi',
  'Nikoh fotograf',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTotalLabel(total: number, isPending: boolean, isError: boolean): string {
  if (isPending) return 'Yuklanmoqda...';
  if (isError) return "Natijalarni yuklab bo'lmadi";
  return `${total} ta usta topildi`;
}

// ─── View toggle ─────────────────────────────────────────────────────────────

interface ViewToggleProps {
  value: ViewMode;
  onChange: (next: ViewMode) => void;
}

function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Ko'rinish turi"
      data-slot="view-toggle"
      className="border-border bg-card inline-flex items-center gap-1 rounded-lg border p-1"
    >
      <button
        type="button"
        role="radio"
        aria-checked={value === 'grid'}
        aria-label="Ro'yxat ko'rinishi"
        onClick={() => onChange('grid')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
          'focus-visible:ring-brand-500 focus-visible:ring-2 focus-visible:outline-none',
          value === 'grid'
            ? 'bg-brand-500 text-white'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <LayoutGrid aria-hidden="true" className="h-3.5 w-3.5" />
        Ro&apos;yxat
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === 'map'}
        aria-label="Xarita ko'rinishi"
        onClick={() => onChange('map')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
          'focus-visible:ring-brand-500 focus-visible:ring-2 focus-visible:outline-none',
          value === 'map'
            ? 'bg-brand-500 text-white'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
        Xarita
      </button>
    </div>
  );
}

// ─── Placeholders (T3.13–T3.16 da real komponentlarga almashtiriladi) ────────

function MapViewPlaceholder({ count }: { count: number }) {
  return (
    <div
      data-slot="map-view-placeholder"
      className="border-border bg-card text-muted-foreground flex min-h-[400px] items-center justify-center rounded-2xl border text-sm"
    >
      🗺️ T3.16 — Yandex Map keladi. Pin&apos;lar: {count} ta.
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SearchView() {
  const { filters, apiFilter, setFilters } = useSearchFilters();

  const [view, setView] = useQueryState(
    'view',
    parseAsStringEnum<ViewMode>([...VIEW_OPTIONS]).withDefault(DEFAULT_VIEW),
  );

  const { data, isPending, isError, refetch } = useMasters(apiFilter);

  const handleSubmit = useCallback(
    (q: string) => {
      // Bo'sh string — null orqali URL'dan olib tashlanadi
      setFilters({ q: q.trim() || null });
    },
    [setFilters],
  );

  const handleViewChange = useCallback(
    (next: ViewMode) => {
      void setView(next);
    },
    [setView],
  );

  const total = data?.total ?? 0;
  const totalLabel = formatTotalLabel(total, isPending, isError);

  return (
    <div data-slot="search-view" className="bg-background min-h-screen">
      {/* ─── Top bar ─────────────────────────────────────────────────── */}
      <header className="border-border bg-card sticky top-0 z-20 border-b">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1 sm:max-w-2xl">
            <SearchBar
              defaultValue={filters.q}
              onSubmit={handleSubmit}
              suggestions={POPULAR_QUERIES}
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            {/* Mobile: filter drawer trigger (desktop'da yashirin) */}
            <div className="lg:hidden">
              <FilterPanelDrawer />
            </div>
            <SortDropdown />
            <ViewToggle value={view} onChange={handleViewChange} />
          </div>
        </div>
      </header>

      {/* ─── Body: sidebar + main ───────────────────────────────────── */}
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside
          aria-label="Filterlar"
          className="hidden w-72 shrink-0 lg:block"
          data-slot="search-sidebar"
        >
          <div className="sticky top-20">
            <FilterPanel />
          </div>
        </aside>

        <main className="min-w-0 flex-1" data-slot="search-main">
          <div
            data-testid="search-result-summary"
            className="text-muted-foreground mb-4 text-sm"
            aria-live="polite"
          >
            {totalLabel}
          </div>

          {view === 'map' ? (
            <MapViewPlaceholder count={total} />
          ) : (
            <ResultGrid
              data={data}
              isPending={isPending}
              isError={isError}
              onRetry={() => refetch()}
              onLoadMore={() => setFilters({ page: filters.page + 1 })}
            />
          )}
        </main>
      </div>
    </div>
  );
}
