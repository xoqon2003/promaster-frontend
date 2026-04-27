'use client';

/**
 * `SummaryBlock` — Step 6 confirmation'da bitta ma'lumot bloki.
 *
 * Task: T4.09
 *
 * Tarkib:
 *  - Sarlavha + ikona
 *  - Tarkib (children — har step uchun farq qiladi)
 *  - "Tahrirlash" link → `?step=N` ga qaytaradi
 *
 * Empty state: agar majburiy ma'lumot yo'q bo'lsa "to'ldirilmagan"
 * indikator bilan ko'rsatiladi.
 */
import { Pencil } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { type WizardStep } from '@/lib/hooks/use-wizard-step';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SummaryBlockProps {
  /** Step raqami — Tahrirlash bossa shu step ga qaytadi. */
  step: WizardStep;
  /** Block sarlavhasi. */
  title: string;
  /** Ikona — kategoriya simvoli. */
  icon: LucideIcon;
  /** Bo'sh holat: "to'ldirilmagan" rang qizil. */
  isEmpty?: boolean;
  /** Block bosilganda chaqiriladi (Tahrirlash). */
  onEdit: (step: WizardStep) => void;
  /** Block tarkibi (read-only ma'lumot). */
  children: ReactNode;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SummaryBlock({
  step,
  title,
  icon: Icon,
  isEmpty = false,
  onEdit,
  children,
}: SummaryBlockProps) {
  return (
    <div
      data-slot="summary-block"
      data-testid={`summary-block-${step}`}
      data-empty={isEmpty}
      className={cn(
        'border-border bg-card rounded-xl border p-4',
        isEmpty && 'border-destructive/50 bg-destructive/5',
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg',
              isEmpty ? 'bg-destructive/10 text-destructive' : 'bg-brand-50 text-brand-600',
            )}
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-foreground text-sm font-semibold">{title}</h3>
            <div className="text-muted-foreground mt-1 text-sm">
              {isEmpty ? (
                <span className="text-destructive font-medium">To&apos;ldirilmagan</span>
              ) : (
                children
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onEdit(step)}
          data-testid={`summary-edit-${step}`}
          aria-label={`${title} bo'limini tahrirlash`}
          className="text-brand-500 hover:text-brand-600 focus-visible:ring-brand-500 inline-flex shrink-0 items-center gap-1 rounded text-xs font-medium focus-visible:ring-2 focus-visible:outline-none"
        >
          <Pencil aria-hidden="true" className="h-3 w-3" />
          Tahrirlash
        </button>
      </header>
    </div>
  );
}
