'use client';

/**
 * `Stepper` — Booking wizard yuqorisidagi qadam ko'rsatkichi.
 *
 * Task: T4.03
 *
 * 6 ta step: 1 ◯ — 2 ◯ — 3 ◯ — 4 ◯ — 5 ◯ — 6 ◯
 * Holatlar:
 *  - `done`    — to'ldirilgan, klikable (Tahrirlash uchun)
 *  - `active`  — joriy step
 *  - `pending` — kelajakdagi step, klikable emas (avval to'ldirish kerak)
 *
 * Mobile (320px): label'lar yashirin, faqat raqamlar.
 * Desktop: label'lar tagidan ko'rinadi.
 */
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

import { type WizardStep } from '@/lib/hooks/use-wizard-step';

// ─── Constants ───────────────────────────────────────────────────────────────

export interface StepConfig {
  step: WizardStep;
  label: string;
}

export const STEPS: StepConfig[] = [
  { step: 1, label: 'Xizmat' },
  { step: 2, label: 'Vaqt' },
  { step: 3, label: 'Foto' },
  { step: 4, label: 'Narx' },
  { step: 5, label: 'Kontakt' },
  { step: 6, label: 'Tasdiq' },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface StepperProps {
  currentStep: WizardStep;
  /** Qaysi steplar to'ldirilgan (klikable). */
  completedSteps: ReadonlySet<WizardStep>;
  /** Step bosilganda chaqiriladi. `pending` step bosilganda chaqirilmaydi. */
  onStepClick?: (step: WizardStep) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Stepper({ currentStep, completedSteps, onStepClick }: StepperProps) {
  return (
    <nav
      data-slot="booking-stepper"
      aria-label={`Buyurtma jarayoni — ${STEPS.length} qadamdan ${currentStep}-qadam`}
      className="border-border bg-card border-b"
    >
      <ol className="mx-auto flex max-w-3xl items-center gap-1 px-3 py-3 sm:px-4 sm:py-4">
        {STEPS.map(({ step, label }, index) => {
          const isCompleted = completedSteps.has(step);
          const isActive = step === currentStep;
          const isPending = !isCompleted && !isActive;
          const isClickable = (isCompleted || isActive) && Boolean(onStepClick);

          return (
            <li key={step} className="flex flex-1 items-center gap-1 last:flex-none">
              <button
                type="button"
                onClick={isClickable && onStepClick ? () => onStepClick(step) : undefined}
                disabled={!isClickable}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`${step}-qadam: ${label}${isCompleted ? ', to`ldirilgan' : ''}${isActive ? ', joriy' : ''}`}
                data-state={isCompleted ? 'done' : isActive ? 'active' : 'pending'}
                className={cn(
                  'group flex flex-col items-center gap-1 rounded-md px-1 py-0.5 transition-colors',
                  'focus-visible:ring-brand-500 focus-visible:ring-2 focus-visible:outline-none',
                  isClickable
                    ? 'hover:bg-muted cursor-pointer'
                    : 'cursor-default disabled:opacity-100',
                )}
              >
                <span
                  className={cn(
                    'inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                    isCompleted && 'bg-brand-500 text-white',
                    isActive && 'border-brand-500 text-brand-500 border-2 bg-transparent',
                    isPending && 'border-border text-muted-foreground border bg-transparent',
                  )}
                >
                  {isCompleted ? (
                    <Check aria-hidden="true" className="h-4 w-4" />
                  ) : (
                    <span>{step}</span>
                  )}
                </span>
                <span
                  className={cn(
                    'hidden text-xs font-medium sm:inline',
                    isActive ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {label}
                </span>
              </button>

              {/* Connector line — oxirgi stepdan keyin yo'q */}
              {index < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'h-px flex-1 transition-colors',
                    isCompleted ? 'bg-brand-500' : 'bg-border',
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
