'use client';

/**
 * `SortDropdown` — Qidiruv natijalarini saralash tanlovi.
 *
 * Task: T3.14
 *
 * Variantlar:
 *  - "Reyting bo'yicha" (default, `sort=rating`)
 *  - "Narx past" (`sort=price`)
 *  - "Eng yaqin" (`sort=distance`) — geolocation 'granted' bo'lmasa disabled
 *  - "Eng yangi" (`sort=newest`)
 *
 * URL: `?sort=rating|price|distance|newest`
 * Default (`rating`) — URL'da ko'rinmaydi (nuqs `clearOnDefault`).
 *
 * Keyboard: Tab → Enter/Space → Arrow Up/Down (native Select).
 */
import { ArrowUpDown, MapPin } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { useGeolocation } from '@/lib/hooks/use-geolocation';
import { useSearchFilters } from '@/lib/hooks/use-search-filters';
import type { SortOption } from '@/lib/masters/schemas';

// ─── Constants ───────────────────────────────────────────────────────────────

interface SortOptionConfig {
  value: SortOption;
  label: string;
  requiresGeo?: boolean;
}

const SORT_OPTIONS: SortOptionConfig[] = [
  { value: 'rating', label: "Reyting bo'yicha" },
  { value: 'price', label: 'Narx past' },
  { value: 'distance', label: 'Eng yaqin', requiresGeo: true },
  { value: 'newest', label: 'Eng yangi' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function SortDropdown() {
  const { filters, setFilters } = useSearchFilters();
  const { state: geoState } = useGeolocation();

  const geoGranted = geoState === 'granted';
  const currentSort = filters.sort ?? 'rating';
  const currentLabel =
    SORT_OPTIONS.find((o) => o.value === currentSort)?.label ?? "Reyting bo'yicha";

  const handleValueChange = (value: SortOption | null) => {
    if (value) setFilters({ sort: value });
  };

  return (
    <Select value={currentSort} onValueChange={handleValueChange}>
      <SelectTrigger
        data-slot="sort-dropdown-trigger"
        data-testid="sort-dropdown-trigger"
        size="sm"
        aria-label="Saralash tartibi"
        className="min-w-[9rem]"
      >
        <ArrowUpDown aria-hidden="true" className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
        <span data-testid="sort-current-label">{currentLabel}</span>
      </SelectTrigger>

      <SelectContent data-testid="sort-dropdown-content" align="end">
        {SORT_OPTIONS.map(({ value, label, requiresGeo }) => {
          const isDisabled = requiresGeo && !geoGranted;

          return (
            <SelectItem
              key={value}
              value={value}
              disabled={isDisabled}
              data-testid={`sort-option-${value}`}
              aria-disabled={isDisabled}
            >
              {value === 'distance' && (
                <MapPin aria-hidden="true" className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
              )}
              <span>{label}</span>
              {isDisabled && (
                <span className="text-muted-foreground ml-auto text-xs">(joylashuv kerak)</span>
              )}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
