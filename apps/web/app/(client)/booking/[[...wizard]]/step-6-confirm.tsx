'use client';

/**
 * Step 6 — Tasdiqlash + Yuborish.
 *
 * Task: T4.09
 *
 * Tarkib:
 *  - 5 ta SummaryBlock (xizmat, vaqt, foto, narx, kontakt)
 *  - Har blok yonida "Tahrirlash" link → `?step=N` ga qaytadi
 *  - "Buyurtma yaratish" CTA — mockBookingApi.create() chaqiriladi
 *  - Submit jarayonida disabled + spinner
 *  - Network failure — toast (T4.11 da batafsil)
 *
 * Submit flow (T4.10 da to'liq) — hozircha placeholder mockBookingApi
 * chaqiruvi.
 */
import {
  Calendar,
  CheckCircle2,
  CircleDollarSign,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Phone,
  Wrench,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useMaster } from '@/lib/hooks/use-master';
import { useBookingDraft } from '@/lib/hooks/use-booking-draft';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { bookingApi } from '@/lib/booking/api-client';
import { calculatePriceRange } from '@/lib/booking/price-calc';
import { isBookingDraftComplete, MAX_PHOTOS } from '@/lib/booking/schemas';
import { classifySubmitError, type SubmitErrorInfo } from '@/lib/booking/submit-error';
import { trackBookingEvent } from '@/lib/booking/telemetry';
import { findSubServiceLabel } from '@/lib/booking/sub-services';
import { cn } from '@/lib/utils';

import { type WizardStep } from '@/lib/hooks/use-wizard-step';

import { SummaryBlock } from './summary-block';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatAmount(amount: number): string {
  return amount.toLocaleString('uz-UZ').replace(/,/g, ' ');
}

function formatPhoneDisplay(e164: string): string {
  if (!e164.startsWith('+998') || e164.length !== 13) return e164;
  const local = e164.slice(4);
  return `+998 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7)}`;
}

const DAY_NAMES = [
  'Yakshanba',
  'Dushanba',
  'Seshanba',
  'Chorshanba',
  'Payshanba',
  'Juma',
  'Shanba',
];
const MONTH_NAMES = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentyabr',
  'oktyabr',
  'noyabr',
  'dekabr',
];

function formatSlotLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = DAY_NAMES[d.getDay()];
  const date = d.getDate();
  const month = MONTH_NAMES[d.getMonth()];
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${day}, ${date} ${month} · ${hh}:${mm}`;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Step6ConfirmProps {
  /** Tahrirlash bosilganda — wizard goToStep'ga ulashtirilsin. */
  onEditStep: (step: WizardStep) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Step6Confirm({ onEditStep }: Step6ConfirmProps) {
  const router = useRouter();
  const { draft } = useBookingDraft();
  const { user, isLoading: isAuthLoading } = useCurrentUser();
  const { data: master } = useMaster(draft.masterId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<SubmitErrorInfo | null>(null);

  const isComplete = isBookingDraftComplete(draft);
  /**
   * Submit faqat session yuklab bo'linganda yoqiladi (A02 — useSession
   * hydration race oldini olish). `handleSubmit` `!user` bilan jim
   * qaytib ketmasligi uchun tugma'ning o'zi bossa bo'lmaydi.
   */
  const canSubmit = isComplete && !isSubmitting && !isAuthLoading && Boolean(user);

  const subServiceLabel = draft.service
    ? findSubServiceLabel(draft.service.categoryId, draft.service.subServiceId)
    : null;

  const priceRange = master ? calculatePriceRange(master.priceFrom, master.categoryId) : null;

  const handleSubmit = async () => {
    if (!isComplete || !user) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const booking = await bookingApi.create(draft, { clientId: user.id });
      trackBookingEvent('booking_submitted', {
        bookingId: booking.id,
        userId: user.id,
        categoryId: draft.service?.categoryId,
      });
      router.push(`/orders/${booking.id}`);
    } catch (err) {
      const info = classifySubmitError(err);
      trackBookingEvent('booking_failed', {
        errorKind: info.kind,
        userId: user.id,
        categoryId: draft.service?.categoryId,
      });
      setSubmitError(info);
      setIsSubmitting(false);
    }
  };

  const handleErrorAction = () => {
    if (!submitError) return;
    if (submitError.kind === 'master-not-found') {
      router.push('/search');
      return;
    }
    if (submitError.redirectStep) {
      onEditStep(submitError.redirectStep);
      return;
    }
    // Retry — submit qayta chaqiriladi
    void handleSubmit();
  };

  return (
    <div
      data-slot="step-6-confirm"
      data-testid="step-6-confirm"
      className="mx-auto max-w-2xl space-y-4"
    >
      <div className="border-border bg-card rounded-2xl border p-5 sm:p-6">
        <div className="space-y-1">
          <h2 className="text-foreground text-lg font-semibold">Tasdiqlash</h2>
          <p className="text-muted-foreground text-sm">
            Ma&apos;lumotlarni tekshiring va &laquo;Buyurtma yaratish&raquo; tugmasini bosing.
          </p>
        </div>
      </div>

      {/* ── Block 1: Xizmat ───────────────────────────────────────── */}
      <SummaryBlock
        step={1}
        title="Xizmat"
        icon={Wrench}
        isEmpty={!draft.service}
        onEdit={onEditStep}
      >
        {draft.service && (
          <>
            <p data-testid="summary-service-line">
              {master?.categoryName ?? draft.service.categoryId} ·{' '}
              {subServiceLabel ?? draft.service.subServiceId}
            </p>
            {draft.service.description && (
              <p className="text-muted-foreground/80 mt-1 text-xs italic">
                &ldquo;{draft.service.description}&rdquo;
              </p>
            )}
          </>
        )}
      </SummaryBlock>

      {/* ── Block 2: Vaqt ─────────────────────────────────────────── */}
      <SummaryBlock
        step={2}
        title="Manzil va vaqt"
        icon={Calendar}
        isEmpty={!draft.addressSlot}
        onEdit={onEditStep}
      >
        {draft.addressSlot && (
          <>
            <p data-testid="summary-address-line" className="flex items-center gap-1.5">
              <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              {draft.addressSlot.location.address}
            </p>
            <p data-testid="summary-slot-line" className="mt-1">
              {formatSlotLabel(draft.addressSlot.slotAt)}
            </p>
          </>
        )}
      </SummaryBlock>

      {/* ── Block 3: Fotolar ──────────────────────────────────────── */}
      <SummaryBlock
        step={3}
        title="Fotolar"
        icon={ImageIcon}
        isEmpty={false} /* photos always optional */
        onEdit={onEditStep}
      >
        {draft.photos && draft.photos.length > 0 ? (
          <p data-testid="summary-photos-line">
            {draft.photos.length} / {MAX_PHOTOS} ta rasm biriktirilgan
          </p>
        ) : (
          <p data-testid="summary-photos-line" className="italic">
            Foto biriktirilmagan
          </p>
        )}
      </SummaryBlock>

      {/* ── Block 4: Narx ─────────────────────────────────────────── */}
      <SummaryBlock
        step={4}
        title="Taxminiy narx"
        icon={CircleDollarSign}
        isEmpty={!priceRange}
        onEdit={onEditStep}
      >
        {priceRange && master && (
          <>
            <p data-testid="summary-price-line" className="text-foreground font-medium">
              {formatAmount(priceRange.from)} — {formatAmount(priceRange.to)} so&apos;m
            </p>
            <p className="text-muted-foreground/80 text-xs">
              Usta: {master.name} · {master.categoryName}
            </p>
          </>
        )}
      </SummaryBlock>

      {/* ── Block 5: Kontakt ──────────────────────────────────────── */}
      <SummaryBlock
        step={5}
        title="Bog'lanish"
        icon={Phone}
        isEmpty={!draft.contact}
        onEdit={onEditStep}
      >
        {draft.contact && (
          <>
            <p data-testid="summary-contact-name">{draft.contact.fullName}</p>
            <p data-testid="summary-contact-phone" className="tabular-nums">
              {formatPhoneDisplay(draft.contact.phone)}
            </p>
            {draft.contact.alternativePhone && (
              <p className="text-muted-foreground/80 text-xs tabular-nums">
                Q&apos;oshimcha: {formatPhoneDisplay(draft.contact.alternativePhone)}
              </p>
            )}
          </>
        )}
      </SummaryBlock>

      {/* ── Submit ────────────────────────────────────────────────── */}
      <div className="border-border bg-card rounded-2xl border p-5">
        {submitError && (
          <div
            role="alert"
            data-testid="submit-error"
            data-error-kind={submitError.kind}
            className="text-destructive bg-destructive/5 border-destructive/20 mb-3 rounded-lg border p-3 text-sm"
          >
            <p data-testid="submit-error-message">{submitError.message}</p>
            {(submitError.retryable ||
              submitError.redirectStep ||
              submitError.kind === 'master-not-found') && (
              <button
                type="button"
                onClick={handleErrorAction}
                data-testid="submit-error-action"
                className="bg-destructive hover:bg-destructive/90 mt-2 inline-flex h-8 items-center rounded-md px-3 text-xs font-medium text-white transition-colors"
              >
                {submitError.kind === 'master-not-found'
                  ? 'Qidiruvga qaytish'
                  : submitError.redirectStep
                    ? `Qadam ${submitError.redirectStep}'ni tahrirlash`
                    : "Qayta urinib ko'rish"}
              </button>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!canSubmit}
          data-testid="step-6-submit-btn"
          className={cn(
            'flex h-12 w-full items-center justify-center gap-2 rounded-lg text-base font-semibold transition-colors',
            'focus-visible:ring-brand-500 focus-visible:ring-2 focus-visible:outline-none',
            canSubmit
              ? 'bg-brand-500 hover:bg-brand-600 text-white'
              : 'bg-muted text-muted-foreground cursor-not-allowed',
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
              Yuborilmoqda…
            </>
          ) : isAuthLoading ? (
            <>
              <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
              Tekshirilmoqda…
            </>
          ) : (
            <>
              <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
              Buyurtma yaratish
            </>
          )}
        </button>

        {!isComplete && !isAuthLoading && (
          <p className="text-muted-foreground mt-2 text-center text-xs">
            Avval barcha majburiy bo&apos;limlarni to&apos;ldiring.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Test exports ────────────────────────────────────────────────────────────

/** @internal */
export const __test__ = { formatAmount, formatPhoneDisplay, formatSlotLabel };
