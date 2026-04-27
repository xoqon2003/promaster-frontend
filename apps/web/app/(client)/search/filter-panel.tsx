'use client';

/**
 * `FilterPanel` — Qidiruv filteri paneli.
 *
 * Task: T3.13
 *
 * Desktop: to'g'ridan-to'g'ri `<aside>` ichida sticky panel.
 * Mobile:  `<FilterPanelDrawer>` orqali Sheet (bottom) ichida.
 *
 * Filter'lar:
 *  1. Kategoriya — radio list (`useCategories`)
 *  2. Narx oralig'i — priceFrom / priceTo (debounce 500ms)
 *  3. Reyting minimum — chips: 3+, 4+, 4.5+, 5
 *  4. Trust level — chips: Verified, Pro, Premium
 *  5. Online — toggle (FilterChip)
 *  6. Masofa — distance slider (faqat geolocation 'granted' bo'lsa)
 *
 * Active filter count badge — header'da faol filterlar sonini ko'rsatadi.
 * "Tozalash" tugmasi barcha filterlarni default holatga qaytaradi.
 */
import { SlidersHorizontal } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { FilterChip } from '@/components/domain/filter-chip';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useCategories } from '@/lib/hooks/use-categories';
import { useGeolocation } from '@/lib/hooks/use-geolocation';
import { useSearchFilters } from '@/lib/hooks/use-search-filters';
import { cn } from '@/lib/utils';
import type { FilterableTrustLevel } from '@/lib/masters/schemas';

// ─── Constants ───────────────────────────────────────────────────────────────

const PRICE_MIN = 0;
const PRICE_MAX = 1_000_000;
const PRICE_STEP = 10_000;
const DISTANCE_MIN = 1;
const DISTANCE_MAX = 50;
const PRICE_DEBOUNCE_MS = 500;

const RATING_CHIPS: { label: string; value: number }[] = [
  { label: '3+', value: 3 },
  { label: '4+', value: 4 },
  { label: '4.5+', value: 4.5 },
  { label: '5', value: 5 },
];

const TRUST_CHIPS: { label: string; value: FilterableTrustLevel }[] = [
  { label: 'Verified', value: 'verified' },
  { label: 'Pro', value: 'pro' },
  { label: 'Premium', value: 'premium' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(amount: number): string {
  if (amount >= 1_000_000) return `${amount / 1_000_000} mln`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)} ming`;
  return `${amount}`;
}

/** Faol filterlar sonini hisoblaydi (badge uchun). */
function countActiveFilters(filters: ReturnType<typeof useSearchFilters>['filters']): number {
  let count = 0;
  if (filters.q) count++;
  if (filters.categoryId) count++;
  if (filters.rating !== null) count++;
  if (filters.priceFrom !== null) count++;
  if (filters.priceTo !== null) count++;
  if (filters.online) count++;
  if (filters.trustLevel !== null) count++;
  return count;
}

// ─── Price Range ─────────────────────────────────────────────────────────────

interface PriceRangeProps {
  priceFrom: number | null;
  priceTo: number | null;
  onCommit: (from: number | null, to: number | null) => void;
}

function PriceRange({ priceFrom, priceTo, onCommit }: PriceRangeProps) {
  const [localFrom, setLocalFrom] = useState(priceFrom ?? PRICE_MIN);
  const [localTo, setLocalTo] = useState(priceTo ?? PRICE_MAX);

  const [debouncedFrom] = useDebounce(localFrom, PRICE_DEBOUNCE_MS);
  const [debouncedTo] = useDebounce(localTo, PRICE_DEBOUNCE_MS);

  // URL filter o'zgarsa (resetFilters) local'ni ham yangilasin
  useEffect(() => {
    setLocalFrom(priceFrom ?? PRICE_MIN);
  }, [priceFrom]);

  useEffect(() => {
    setLocalTo(priceTo ?? PRICE_MAX);
  }, [priceTo]);

  // Debounced qiymatlar turg'unlashganda commit
  useEffect(() => {
    const from = debouncedFrom === PRICE_MIN ? null : debouncedFrom;
    const to = debouncedTo === PRICE_MAX ? null : debouncedTo;
    onCommit(from, to);
  }, [debouncedFrom, debouncedTo, onCommit]);

  const fromClamped = Math.min(localFrom, localTo - PRICE_STEP);
  const toClamped = Math.max(localTo, localFrom + PRICE_STEP);

  return (
    <div data-slot="price-range" className="space-y-3">
      <div className="text-muted-foreground flex justify-between text-xs">
        <span>{formatPrice(localFrom)} so&apos;m</span>
        <span>{formatPrice(localTo)} so&apos;m</span>
      </div>
      <div className="space-y-2">
        <label className="text-muted-foreground text-xs">Dan</label>
        <input
          data-testid="price-from-slider"
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={fromClamped}
          onChange={(e) => setLocalFrom(Number(e.target.value))}
          aria-label="Narx dan"
          aria-valuemin={PRICE_MIN}
          aria-valuemax={PRICE_MAX}
          aria-valuenow={fromClamped}
          className="accent-brand-500 w-full cursor-pointer"
        />
        <label className="text-muted-foreground text-xs">Gacha</label>
        <input
          data-testid="price-to-slider"
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={toClamped}
          onChange={(e) => setLocalTo(Number(e.target.value))}
          aria-label="Narx gacha"
          aria-valuemin={PRICE_MIN}
          aria-valuemax={PRICE_MAX}
          aria-valuenow={toClamped}
          className="accent-brand-500 w-full cursor-pointer"
        />
      </div>
    </div>
  );
}

// ─── Distance Slider ──────────────────────────────────────────────────────────

interface DistanceSliderProps {
  value: number;
  onChange: (km: number) => void;
}

function DistanceSlider({ value, onChange }: DistanceSliderProps) {
  return (
    <div data-slot="distance-slider" className="space-y-2">
      <div className="text-muted-foreground flex justify-between text-xs">
        <span>{DISTANCE_MIN} km</span>
        <span className="text-foreground font-medium">{value} km ichida</span>
        <span>{DISTANCE_MAX} km</span>
      </div>
      <input
        data-testid="distance-slider"
        type="range"
        min={DISTANCE_MIN}
        max={DISTANCE_MAX}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Masofa (km)"
        aria-valuemin={DISTANCE_MIN}
        aria-valuemax={DISTANCE_MAX}
        aria-valuenow={value}
        className="accent-brand-500 w-full cursor-pointer"
      />
    </div>
  );
}

// ─── Filter Section ───────────────────────────────────────────────────────────

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div data-slot="filter-section" className="space-y-2.5">
      <h3 className="text-foreground text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

// ─── FilterPanelContent ───────────────────────────────────────────────────────

function FilterPanelContent() {
  const { filters, setFilters } = useSearchFilters();
  const { data: categories, isPending: categoriesPending } = useCategories();
  const { state: geoState } = useGeolocation();

  const [localDistance, setLocalDistance] = useState(10);

  const activeCount = useMemo(() => countActiveFilters(filters), [filters]);

  const handlePriceCommit = useCallback(
    (from: number | null, to: number | null) => {
      setFilters({ priceFrom: from, priceTo: to });
    },
    [setFilters],
  );

  return (
    <div data-slot="filter-panel-content" className="flex flex-col gap-5">
      {/* ── 1. Kategoriya ─────────────────────────────────── */}
      <FilterSection title="Kategoriya">
        {categoriesPending ? (
          <div className="text-muted-foreground text-xs">Yuklanmoqda…</div>
        ) : (
          <div data-testid="category-list" className="space-y-1">
            {/* "Barchasi" — categoryId ni tozalash */}
            <label
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors',
                !filters.categoryId
                  ? 'bg-brand-50 text-brand-600 font-medium'
                  : 'text-foreground hover:bg-muted',
              )}
            >
              <input
                type="radio"
                name="category"
                value=""
                checked={!filters.categoryId}
                onChange={() => setFilters({ categoryId: null })}
                className="accent-brand-500"
                aria-label="Barcha kategoriyalar"
              />
              <span>Barchasi</span>
            </label>
            {categories?.map((cat) => (
              <label
                key={cat.id}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors',
                  filters.categoryId === cat.id
                    ? 'bg-brand-50 text-brand-600 font-medium'
                    : 'text-foreground hover:bg-muted',
                )}
              >
                <input
                  type="radio"
                  name="category"
                  value={cat.id}
                  checked={filters.categoryId === cat.id}
                  onChange={() => setFilters({ categoryId: cat.id })}
                  className="accent-brand-500"
                  aria-label={`${cat.name} kategoriyasi, ${cat.masterCount} usta`}
                />
                <span aria-hidden="true">{cat.emoji}</span>
                <span className="min-w-0 flex-1 truncate">{cat.name}</span>
                <span className="text-muted-foreground text-xs">{cat.masterCount}</span>
              </label>
            ))}
          </div>
        )}
      </FilterSection>

      {/* ── 2. Narx oralig'i ──────────────────────────────── */}
      <FilterSection title="Narx (so'm)">
        <PriceRange
          priceFrom={filters.priceFrom}
          priceTo={filters.priceTo}
          onCommit={handlePriceCommit}
        />
      </FilterSection>

      {/* ── 3. Reyting ────────────────────────────────────── */}
      <FilterSection title="Reyting">
        <div data-testid="rating-chips" className="flex flex-wrap gap-2">
          {RATING_CHIPS.map(({ label, value }) => (
            <FilterChip
              key={value}
              label={label}
              active={filters.rating === value}
              onToggle={(on) => setFilters({ rating: on ? value : null })}
            />
          ))}
        </div>
      </FilterSection>

      {/* ── 4. Ishonch darajasi ───────────────────────────── */}
      <FilterSection title="Ishonch darajasi">
        <div data-testid="trust-chips" className="flex flex-wrap gap-2">
          {TRUST_CHIPS.map(({ label, value }) => (
            <FilterChip
              key={value}
              label={label}
              active={filters.trustLevel === value}
              onToggle={(on) => setFilters({ trustLevel: on ? value : null })}
            />
          ))}
        </div>
      </FilterSection>

      {/* ── 5. Online ─────────────────────────────────────── */}
      <FilterSection title="Holat">
        <div data-testid="online-toggle">
          <FilterChip
            label="Hozir onlayn"
            active={filters.online ?? false}
            onToggle={(on) => setFilters({ online: on || null })}
          />
        </div>
      </FilterSection>

      {/* ── 6. Masofa (faqat geolocation 'granted' bo'lsa) ── */}
      {geoState === 'granted' && (
        <FilterSection title="Masofa">
          <DistanceSlider value={localDistance} onChange={setLocalDistance} />
        </FilterSection>
      )}

      {/* ── Faol filterlar soni ───────────────────────────── */}
      {activeCount > 0 && (
        <p data-testid="active-filter-count" className="text-muted-foreground text-xs">
          {activeCount} ta faol filter
        </p>
      )}
    </div>
  );
}

// ─── FilterPanel (desktop) ────────────────────────────────────────────────────

export interface FilterPanelProps {
  className?: string;
}

/**
 * Desktop sticky sidebar uchun — `<aside>` ichida to'g'ridan-to'g'ri render.
 * search-view.tsx'dagi `<FilterPanelPlaceholder />` ni shu bilan almashtiring.
 */
export function FilterPanel({ className }: FilterPanelProps) {
  const { filters, resetFilters } = useSearchFilters();
  const activeCount = useMemo(() => countActiveFilters(filters), [filters]);

  return (
    <div
      data-slot="filter-panel"
      className={cn('border-border bg-card rounded-2xl border p-4', className)}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-foreground text-base font-semibold">Filterlar</h2>
        {activeCount > 0 && (
          <span className="bg-brand-500 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium text-white">
            {activeCount}
          </span>
        )}
      </div>

      <FilterPanelContent />

      <div className="border-border mt-5 border-t pt-4">
        <Button
          data-testid="reset-filters-btn"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => resetFilters()}
          disabled={activeCount === 0}
        >
          Tozalash
        </Button>
      </div>
    </div>
  );
}

// ─── FilterPanelDrawer (mobile) ───────────────────────────────────────────────

/**
 * Mobile uchun Sheet (bottom drawer) varianti.
 * Top bar'da "Filterlar" trigger tugmasi bilan ishlatiladi.
 */
export function FilterPanelDrawer() {
  const [open, setOpen] = useState(false);
  const { filters, resetFilters } = useSearchFilters();
  const activeCount = useMemo(() => countActiveFilters(filters), [filters]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            data-testid="filter-drawer-trigger"
            className="relative"
          />
        }
      >
        <SlidersHorizontal aria-hidden="true" className="mr-1.5 h-4 w-4" />
        Filterlar
        {activeCount > 0 && (
          <span className="bg-brand-500 absolute -top-1.5 -right-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white">
            {activeCount}
          </span>
        )}
      </SheetTrigger>

      <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Filterlar</SheetTitle>
        </SheetHeader>

        <div className="px-4 py-2">
          <FilterPanelContent />
        </div>

        <SheetFooter className="px-4">
          <Button
            data-testid="reset-filters-drawer-btn"
            variant="outline"
            className="w-full"
            onClick={() => {
              resetFilters();
              setOpen(false);
            }}
            disabled={activeCount === 0}
          >
            Tozalash
          </Button>
          <Button className="w-full" onClick={() => setOpen(false)}>
            Natijalarni ko&apos;rsatish
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
