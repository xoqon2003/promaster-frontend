'use client';

/**
 * `FilterChip` — qidiruv va filter paneldagi yagona "chip" elementi.
 *
 * Task: T3.07
 *
 * Variantlar (discriminated union):
 *  1. **Toggle** — `onToggle` bilan, `active` holatini almashtiradi (chips: 4+, Online…).
 *     Ichki element — `<button role="switch">` (a11y: `aria-pressed`).
 *  2. **Dismissible** — `dismissible` + `onDismiss`, "Active filter" rozetkasi
 *     ko'rinishida ishlatiladi (× tugma chap tomondan o'chiradi).
 *     Outer — `<span>`, ichida alohida `<button aria-label="O'chirish">`.
 *  3. **Static** — `onToggle`/`dismissible` yo'q. Faqat o'qish uchun (count badge).
 *
 * Visual:
 *  - rounded-full, kichik o'lcham (px-3 py-1)
 *  - active → brand-500 background + foreground oq
 *  - hover → border-brand-500
 *  - disabled → opacity-50, pointer-events-none
 *
 * Count:
 *  - `count` props orqali "Elektrik (42)" formatida o'ng tomonda yumshoq matn
 *
 * Keyboard:
 *  - Toggle: Tab + Enter/Space (native button)
 *  - Dismissible: Tab outer (yo'q — span), × tugma uchun Tab + Enter
 */
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

type FilterChipBaseProps = {
  label: string;
  count?: number;
  disabled?: boolean;
  className?: string;
};

type FilterChipToggleProps = FilterChipBaseProps & {
  active?: boolean;
  onToggle: (next: boolean) => void;
  dismissible?: never;
  onDismiss?: never;
};

type FilterChipDismissibleProps = FilterChipBaseProps & {
  dismissible: true;
  onDismiss: () => void;
  active?: boolean;
  onToggle?: never;
};

type FilterChipStaticProps = FilterChipBaseProps & {
  active?: boolean;
  onToggle?: never;
  dismissible?: never;
  onDismiss?: never;
};

export type FilterChipProps =
  | FilterChipToggleProps
  | FilterChipDismissibleProps
  | FilterChipStaticProps;

// ─── Style tokens ────────────────────────────────────────────────────────────

/**
 * Barcha variantlar uchun bazaviy ko'rinish.
 *
 * Eslatma: `rounded-full` + `whitespace-nowrap` — chip uzun matn'da ham
 * to'rtburchakka o'tib ketmaydi (filter panelda overflow-x-auto bilan ishlatiladi).
 */
const BASE_CLASSES = cn(
  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors',
);

const INACTIVE_CLASSES = cn(
  'border-border bg-card text-foreground',
  'hover:border-brand-500 hover:bg-brand-50',
);

const ACTIVE_CLASSES = cn(
  'border-brand-500 bg-brand-500 text-white',
  'hover:bg-brand-600 hover:border-brand-600',
);

const FOCUS_CLASSES = cn(
  'focus-visible:ring-brand-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
);

const DISABLED_CLASSES = cn('cursor-not-allowed opacity-50');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Chip ichidagi label + opsional count'ni render qiladi. Count rangi active
 * holatida oq matnga moslashadi (kontrast sifatida 80% opacity).
 */
function ChipBody({ label, count, active }: { label: string; count?: number; active: boolean }) {
  return (
    <>
      <span>{label}</span>
      {typeof count === 'number' && (
        <span
          data-testid="filter-chip-count"
          className={cn('text-xs', active ? 'text-white/80' : 'text-muted-foreground')}
        >
          ({count})
        </span>
      )}
    </>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FilterChip(props: FilterChipProps) {
  const { label, count, disabled = false, className } = props;
  const active = props.active ?? false;

  // ─ Dismissible variant (Active filter sifatida) ──────────────────────────
  if ('dismissible' in props && props.dismissible) {
    return (
      <span
        data-slot="filter-chip"
        data-variant="dismissible"
        data-active={active}
        className={cn(
          BASE_CLASSES,
          active ? ACTIVE_CLASSES : INACTIVE_CLASSES,
          disabled && DISABLED_CLASSES,
          className,
        )}
      >
        <ChipBody label={label} count={count} active={active} />
        <button
          type="button"
          aria-label={`${label} filtrini olib tashlash`}
          disabled={disabled}
          onClick={props.onDismiss}
          className={cn(
            '-mr-1 ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full transition-colors',
            active ? 'hover:bg-white/20' : 'hover:bg-muted',
            FOCUS_CLASSES,
            disabled && 'cursor-not-allowed',
          )}
        >
          <X aria-hidden="true" className="h-3 w-3" />
        </button>
      </span>
    );
  }

  // ─ Toggle variant (interactive switch) ───────────────────────────────────
  if ('onToggle' in props && props.onToggle) {
    const onToggle = props.onToggle;
    return (
      <button
        type="button"
        role="switch"
        aria-pressed={active}
        aria-label={label}
        disabled={disabled}
        data-slot="filter-chip"
        data-variant="toggle"
        data-active={active}
        onClick={() => onToggle(!active)}
        className={cn(
          BASE_CLASSES,
          active ? ACTIVE_CLASSES : INACTIVE_CLASSES,
          FOCUS_CLASSES,
          disabled && DISABLED_CLASSES,
          className,
        )}
      >
        <ChipBody label={label} count={count} active={active} />
      </button>
    );
  }

  // ─ Static variant (count badge / read-only) ──────────────────────────────
  return (
    <span
      data-slot="filter-chip"
      data-variant="static"
      data-active={active}
      aria-label={label}
      className={cn(
        BASE_CLASSES,
        active ? ACTIVE_CLASSES : INACTIVE_CLASSES,
        disabled && DISABLED_CLASSES,
        className,
      )}
    >
      <ChipBody label={label} count={count} active={active} />
    </span>
  );
}
