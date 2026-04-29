'use client';

/**
 * Step 4 — Narx oralig'i (read-only).
 *
 * Task: T4.07
 *
 * Tarkib:
 *  - Tanlangan usta ism + kategoriya
 *  - Narx oralig'i: from..to (`calculatePriceRange` orqali)
 *  - Estimated hours kategoriya bo'yicha (1-3 soat / 4-8 soat / ...)
 *  - "Aniq narx muloqot keyin" disclaimer
 *  - "Bekor qilish" — `/search` ga qaytadi va draft tozalanadi
 *
 * Form emas — read-only display. Pastki "Davom etish" to'g'ridan-to'g'ri
 * `goNext()` chaqiradi (booking-wizard'da `isFormStep` false).
 *
 * Loading state: usta yuklanguncha skeleton.
 * Error state: master topilmadi → toast yoki inline error.
 */
import { Info, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useMaster } from '@/lib/hooks/use-master';
import { useBookingDraft } from '@/lib/hooks/use-booking-draft';
import { getCategoryEstimate } from '@/lib/booking/category-estimates';
import { calculatePriceRange } from '@/lib/booking/price-calc';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** "200000" → "200 000" (UZ standart). */
function formatAmount(amount: number): string {
  return amount.toLocaleString('uz-UZ').replace(/,/g, ' ');
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Step 4 read-only — props yo'q (wizard pastki "Davom etish" to'g'ridan-to'g'ri
 * `goNext()` chaqiradi, `isFormStep === false`).
 */
export function Step4Price() {
  const router = useRouter();
  const { draft, resetDraft } = useBookingDraft();

  const masterId = draft.masterId;
  const categoryId = draft.service?.categoryId ?? '';

  const { data: master, isPending, isError } = useMaster(masterId);

  // Loading skeleton
  if (isPending && masterId) {
    return (
      <div
        data-slot="step-4-loading"
        data-testid="step-4-price-loading"
        className="border-border bg-card mx-auto flex max-w-2xl items-center justify-center gap-2 rounded-2xl border p-12"
      >
        <Loader2 aria-hidden="true" className="text-muted-foreground h-5 w-5 animate-spin" />
        <span className="text-muted-foreground text-sm">Yuklanmoqda…</span>
      </div>
    );
  }

  // Error: master yo'q yoki masterId o'zi yo'q
  if (!masterId || isError || !master) {
    return (
      <div
        data-slot="step-4-error"
        data-testid="step-4-price-error"
        role="alert"
        className="border-border bg-card mx-auto max-w-2xl rounded-2xl border p-8 text-center"
      >
        <p className="text-foreground font-semibold">Usta tanlanmagan</p>
        <p className="text-muted-foreground mt-2 text-sm">
          Iltimos, qidiruv sahifasidan ustani tanlab bering.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => router.push('/search')}
          data-testid="step-4-back-to-search"
        >
          Qidiruvga qaytish
        </Button>
      </div>
    );
  }

  // Range hisoblash
  const range = calculatePriceRange(master.priceFrom, master.categoryId);
  const estimate = getCategoryEstimate(master.categoryId);

  const handleCancel = async () => {
    await resetDraft();
    router.push('/search');
  };

  return (
    <div
      data-slot="step-4-price"
      data-testid="step-4-price"
      className="border-border bg-card mx-auto max-w-2xl space-y-5 rounded-2xl border p-5 sm:p-6"
    >
      {/* ── Master info ─────────────────────────────────────────────── */}
      <div className="space-y-1">
        <p className="text-muted-foreground text-xs tracking-wide uppercase">Tanlangan usta</p>
        <p data-testid="master-name" className="text-foreground text-lg font-semibold">
          {master.name}
        </p>
        <p className="text-muted-foreground text-sm">
          {master.categoryName} · {categoryId !== master.categoryId && '⚠ Kategoriya farq qiladi'}
        </p>
      </div>

      {/* ── Range ─────────────────────────────────────────────────── */}
      <div className="bg-brand-50 border-brand-200 rounded-xl border p-5 text-center">
        <p className="text-muted-foreground text-xs tracking-wide uppercase">Taxminiy narx</p>
        <p
          data-testid="price-range"
          className="text-brand-700 font-display mt-1 text-2xl font-bold sm:text-3xl"
        >
          {formatAmount(range.from)} — {formatAmount(range.to)}{' '}
          <span className="text-base font-medium">so&apos;m</span>
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          {estimate.minHours}-{estimate.maxHours} soatlik ish · soatlik tarif{' '}
          {formatAmount(master.priceFrom)} so&apos;m
        </p>
      </div>

      {/* ── Disclaimer ─────────────────────────────────────────────── */}
      <div
        data-testid="price-disclaimer"
        className="border-border bg-background flex items-start gap-2 rounded-xl border p-3"
      >
        <Info aria-hidden="true" className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
        <p className="text-muted-foreground text-xs leading-relaxed">
          Bu — taxminiy narx oralig&apos;i. Aniq narx usta bilan muloqot keyin kelishiladi. Material
          va qo&apos;shimcha xizmatlar yakuniy summaga qo&apos;shilishi mumkin.
        </p>
      </div>

      {/* ── Cancel ─────────────────────────────────────────────────── */}
      <div className="flex justify-center">
        <button
          type="button"
          data-testid="step-4-cancel-btn"
          onClick={() => void handleCancel()}
          className="text-muted-foreground hover:text-destructive focus-visible:ring-destructive inline-flex items-center gap-1.5 rounded text-sm font-medium underline focus-visible:ring-2 focus-visible:outline-none"
        >
          <X aria-hidden="true" className="h-3.5 w-3.5" />
          Bekor qilish va qidiruvga qaytish
        </button>
      </div>
    </div>
  );
}
