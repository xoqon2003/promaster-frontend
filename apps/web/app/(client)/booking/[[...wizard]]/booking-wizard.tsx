'use client';

/**
 * `BookingWizard` — 6 qadamli buyurtma sehrgari.
 *
 * Task: T4.03 (layout + stepper + navigation skeleton)
 *
 * Bu komponent:
 *  - Stepper (yuqori) bilan joriy stepni ko'rsatadi
 *  - Joriy step kontentini render qiladi (T4.04..T4.09'da to'ldiriladi)
 *  - Pastki navigatsiya: "Orqaga" + "Davom etish" tugmalari
 *  - URL state: `?step=N&draft=...` — refresh saqlaydi
 *
 * Step kontentlari (placeholder):
 *  - 1: T4.04 — Service details
 *  - 2: T4.05 — Address + slot
 *  - 3: T4.06 — Photos
 *  - 4: T4.07 — Price estimate
 *  - 5: T4.08 — Contact + auth gate
 *  - 6: T4.09 — Confirmation summary + submit
 */
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { useBookingDraft } from '@/lib/hooks/use-booking-draft';
import { type WizardStep, useWizardStep } from '@/lib/hooks/use-wizard-step';

import { Step1Service, WIZARD_FORM_ID } from './step-1-service';
import { Step2Address } from './step-2-address';
import { Stepper } from './stepper';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Draft asosida `completedSteps` to'plamini qaytaradi.
 *
 * Step "tugagan" deb hisoblanadi, agar ushbu step uchun majburiy
 * maydonlar to'ldirilgan bo'lsa:
 *  - 1: service mavjud
 *  - 2: addressSlot mavjud
 *  - 3: photos optional — har doim "tugagan"
 *  - 4: read-only — service mavjudligi yetarli
 *  - 5: contact mavjud
 *  - 6: hech qachon "done" emas (faqat submit'dan keyin)
 */
function computeCompletedSteps(
  draft: ReturnType<typeof useBookingDraft>['draft'],
): Set<WizardStep> {
  const set = new Set<WizardStep>();
  if (draft.service) set.add(1);
  if (draft.addressSlot) set.add(2);
  // Step 3 har doim "complete" — photos ixtiyoriy
  if (draft.service && draft.addressSlot) set.add(3);
  if (draft.service) set.add(4); // price faqat read-only
  if (draft.contact) set.add(5);
  return set;
}

// ─── Step content placeholders (T4.04..T4.09 uchun) ──────────────────────────

interface StepPlaceholderProps {
  step: WizardStep;
  title: string;
  taskId: string;
}

function StepPlaceholder({ step, title, taskId }: StepPlaceholderProps) {
  return (
    <div
      data-slot="booking-step-placeholder"
      data-step={step}
      className="border-border bg-card mx-auto max-w-2xl rounded-2xl border p-8 text-center"
    >
      <p className="text-muted-foreground text-xs tracking-wide uppercase">{taskId}</p>
      <h2 className="text-foreground font-display mt-2 text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-3 text-sm">
        Bu step kontenti {taskId}&apos;da to&apos;ldiriladi.
      </p>
    </div>
  );
}

const STEP_CONTENT: Record<WizardStep, { title: string; taskId: string }> = {
  1: { title: 'Xizmat tafsilotlari', taskId: 'T4.04' },
  2: { title: 'Manzil va vaqt', taskId: 'T4.05' },
  3: { title: 'Fotolar (ixtiyoriy)', taskId: 'T4.06' },
  4: { title: 'Narx oralig`i', taskId: 'T4.07' },
  5: { title: "Bog'lanish ma'lumotlari", taskId: 'T4.08' },
  6: { title: 'Tasdiqlash', taskId: 'T4.09' },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function BookingWizard() {
  const { step, goNext, goBack, goToStep, isFirstStep, isLastStep } = useWizardStep();
  const { draft, storageMode } = useBookingDraft();

  const completedSteps = useMemo(() => computeCompletedSteps(draft), [draft]);

  const stepContent = STEP_CONTENT[step];

  // Form-driven steps (RHF) — pastki "Davom etish" tugmasi form submit'ga
  // ulanadi (`form={WIZARD_FORM_ID}`). Boshqa steplarda esa to'g'ridan-to'g'ri
  // `goNext()` chaqiriladi.
  const isFormStep = step === 1 || step === 2; // T4.05 — step 2 ham form

  return (
    <div data-slot="booking-wizard" className="bg-background min-h-screen">
      <Stepper
        currentStep={step}
        completedSteps={completedSteps}
        onStepClick={(target) => void goToStep(target)}
      />

      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* Step 1, 2 — ulangan; qolganlari T4.06+ da almashtiriladi */}
        {step === 1 ? (
          <Step1Service onComplete={() => void goNext()} />
        ) : step === 2 ? (
          <Step2Address onComplete={() => void goNext()} />
        ) : (
          <StepPlaceholder step={step} title={stepContent.title} taskId={stepContent.taskId} />
        )}

        {/* Debug info — production'da olib tashlanadi (T4.12 telemetry'dan keyin) */}
        <div
          data-slot="booking-debug"
          aria-hidden="true"
          className="text-muted-foreground mx-auto mt-4 max-w-2xl text-center text-xs"
        >
          storage: <span className="font-mono">{storageMode}</span>
        </div>

        {/* ─── Navigation ─────────────────────────────────────────────── */}
        <nav
          aria-label="Wizard navigatsiyasi"
          className="border-border bg-card sticky bottom-0 -mx-4 mt-6 border-t px-4 py-3 sm:mx-auto sm:max-w-2xl sm:rounded-2xl sm:border"
        >
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => void goBack()}
              data-testid="wizard-back-btn"
            >
              <ArrowLeft aria-hidden="true" className="mr-2 h-4 w-4" />
              {isFirstStep ? 'Bekor qilish' : 'Orqaga'}
            </Button>

            {isFormStep ? (
              // RHF form submit — onComplete callback ichida goNext chaqiriladi
              <Button
                type="submit"
                form={WIZARD_FORM_ID}
                disabled={isLastStep}
                data-testid="wizard-next-btn"
              >
                {isLastStep ? 'Yakunlash' : 'Davom etish'}
                <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => void goNext()}
                disabled={isLastStep}
                data-testid="wizard-next-btn"
              >
                {isLastStep ? 'Yakunlash' : 'Davom etish'}
                <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </nav>
      </main>
    </div>
  );
}
