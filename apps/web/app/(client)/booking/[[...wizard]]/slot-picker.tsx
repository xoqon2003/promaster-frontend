'use client';

/**
 * `SlotPicker` — 7-kunlik kalendar + 30 daqiqali slot grid.
 *
 * Task: T4.05
 *
 * R02 mitigation: native `<input type="time">` o'rniga custom UI —
 * Safari iOS / Firefox / Chrome bir xil ko'rinadi.
 *
 * UX:
 *  - Yuqori: 7 ta kun tabs (horizontal scroll mobile'da)
 *  - Pastki: tanlangan kun uchun slot grid (4 col mobile, 6 col desktop)
 *  - O'tgan slotlar disabled (matn kulrang, click yo'q)
 *  - Tanlangan slot brand rangida
 */
import { useMemo, useState } from 'react';

import { cn } from '@/lib/utils';

import { buildCalendarDays, buildTimeSlots, isoDateForSlot } from '@/lib/booking/slot-utils';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SlotPickerProps {
  /** Joriy tanlangan slot ISO (yoki null). */
  value: string | null;
  /** Slot tanlanganda chaqiriladi. */
  onChange: (isoDateTime: string) => void;
  /** Hozirgi vaqt — testda fake timer uchun override. */
  now?: Date;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SlotPicker({ value, onChange, now: nowProp }: SlotPickerProps) {
  const now = useMemo(() => nowProp ?? new Date(), [nowProp]);

  const days = useMemo(() => buildCalendarDays(now), [now]);

  // Initial selected day: value (saqlangan slot) bo'lsa undan, aks holda
  // bugun. Foydalanuvchi day tab bossa internal state o'zgaradi —
  // slot tanlangan emas, faqat ko'rinish.
  const [activeDayIso, setActiveDayIso] = useState<string>(() =>
    value ? isoDateForSlot(value) : days[0]!.isoDate,
  );

  // Slotlarni faqat tanlangan kun uchun yaratamiz (perf)
  const slots = useMemo(() => buildTimeSlots(activeDayIso, now), [activeDayIso, now]);

  return (
    <div data-slot="slot-picker" className="space-y-4">
      {/* ── Kun tabs ──────────────────────────────────────────────── */}
      <div
        role="tablist"
        aria-label="Sana tanlash"
        data-testid="slot-picker-days"
        className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
      >
        {days.map((day) => {
          const isSelected = day.isoDate === activeDayIso;
          return (
            <button
              key={day.isoDate}
              type="button"
              role="tab"
              aria-selected={isSelected}
              data-testid={`day-tab-${day.isoDate}`}
              data-state={isSelected ? 'selected' : 'unselected'}
              onClick={() => setActiveDayIso(day.isoDate)}
              className={cn(
                'shrink-0 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                'focus-visible:ring-brand-500 focus-visible:ring-2 focus-visible:outline-none',
                isSelected
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-border bg-background text-foreground hover:bg-muted',
              )}
            >
              {day.label}
            </button>
          );
        })}
      </div>

      {/* ── Slot grid ─────────────────────────────────────────────── */}
      <div
        role="radiogroup"
        aria-label="Vaqt slot tanlash"
        data-testid="slot-picker-grid"
        className="grid grid-cols-4 gap-2 sm:grid-cols-6"
      >
        {slots.map((slot) => {
          const isSelected = slot.isoDateTime === value;
          return (
            <button
              key={slot.isoDateTime}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={!slot.enabled}
              data-testid={`slot-${slot.label}`}
              data-state={!slot.enabled ? 'disabled' : isSelected ? 'selected' : 'available'}
              onClick={() => slot.enabled && onChange(slot.isoDateTime)}
              className={cn(
                'rounded-lg border px-2 py-1.5 text-sm tabular-nums transition-colors',
                'focus-visible:ring-brand-500 focus-visible:ring-2 focus-visible:outline-none',
                !slot.enabled
                  ? 'border-border bg-muted/50 text-muted-foreground cursor-not-allowed line-through'
                  : isSelected
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : 'border-border bg-background text-foreground hover:bg-muted',
              )}
            >
              {slot.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
