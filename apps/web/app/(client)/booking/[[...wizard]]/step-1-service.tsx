'use client';

/**
 * Step 1 — Xizmat tafsilotlari.
 *
 * Task: T4.04
 *
 * Form:
 *  - Kategoriya — radio group (`useCategories` orqali backend ro'yxati,
 *    fallback: bo'sh skeleton)
 *  - Sub-xizmat — kategoriya tanlanganidan keyin combobox/select
 *    (statik mock `getSubServices`)
 *  - Tavsif — textarea (0-500 belgi)
 *
 * State:
 *  - Initial: `useBookingDraft().draft.service` dan to'ldiriladi
 *  - URL'dan `?categoryId=...` keladi (Search'dan kelgan bo'lsa) —
 *    `useSearchParams` orqali default qiymat
 *  - Submit: `setDraft({ service })` + `goNext()`
 *
 * Validation: `ServiceDetailsSchema` (Zod) — kategoriya + sub-xizmat
 * majburiy, tavsif 0-500 belgi.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCategories } from '@/lib/hooks/use-categories';
import { useBookingDraft } from '@/lib/hooks/use-booking-draft';
import { DESCRIPTION_MAX, ServiceDetailsSchema, type ServiceDetails } from '@/lib/booking/schemas';
import { getSubServices } from '@/lib/booking/sub-services';
import { cn } from '@/lib/utils';

// ─── Constants ───────────────────────────────────────────────────────────────

/**
 * Form ID — wizard pastki "Davom etish" tugmasi shu ID bilan submit
 * triggerlaydi (`<button type="submit" form={WIZARD_FORM_ID} />`).
 */
export const WIZARD_FORM_ID = 'booking-wizard-step-form';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Step1ServiceProps {
  /** Form muvaffaqiyatli to'ldirilganda chaqiriladi (wizard goNext'ga ulansin). */
  onComplete: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Step1Service({ onComplete }: Step1ServiceProps) {
  const params = useSearchParams();
  const { draft, setDraft } = useBookingDraft();
  const { data: categories, isPending: catsPending, isError: catsError } = useCategories();

  const initialCategoryId = draft.service?.categoryId ?? params?.get('categoryId') ?? '';

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ServiceDetails>({
    resolver: zodResolver(ServiceDetailsSchema),
    mode: 'onChange',
    defaultValues: {
      categoryId: initialCategoryId,
      subServiceId: draft.service?.subServiceId ?? '',
      description: draft.service?.description ?? '',
    },
  });

  const selectedCategoryId = watch('categoryId');
  const selectedSubServiceId = watch('subServiceId');
  const description = watch('description') ?? '';

  // Kategoriya o'zgarsa, sub-xizmat ID'si endi mos kelmasligi mumkin —
  // tozalash kerak. Lekin agar URL'dan kelgan bo'lsa va mos sub mavjud bo'lsa,
  // o'zgarishsiz qoldiramiz.
  const subServices = useMemo(
    () => (selectedCategoryId ? getSubServices(selectedCategoryId) : []),
    [selectedCategoryId],
  );

  useEffect(() => {
    if (!selectedSubServiceId || !subServices.length) return;
    const exists = subServices.some((s) => s.id === selectedSubServiceId);
    if (!exists) {
      setValue('subServiceId', '', { shouldValidate: true });
    }
  }, [selectedSubServiceId, setValue, subServices]);

  const onSubmit = async (data: ServiceDetails) => {
    await setDraft({ service: data });
    onComplete();
  };

  return (
    <form
      id={WIZARD_FORM_ID}
      data-slot="step-1-service"
      data-testid="step-1-service-form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="border-border bg-card mx-auto max-w-2xl space-y-6 rounded-2xl border p-5 sm:p-6"
    >
      {/* ── Kategoriya ──────────────────────────────────────────────── */}
      <fieldset className="space-y-2">
        <legend className="text-foreground text-sm font-semibold">Kategoriya</legend>

        {catsPending ? (
          <div
            data-testid="categories-loading"
            className="text-muted-foreground flex items-center gap-2 text-sm"
          >
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
            Yuklanmoqda…
          </div>
        ) : catsError ? (
          <p role="alert" className="text-destructive text-sm">
            Kategoriyalarni yuklab bo&apos;lmadi. Internetingizni tekshiring.
          </p>
        ) : (
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {categories?.map((cat) => {
                  const checked = field.value === cat.id;
                  return (
                    <label
                      key={cat.id}
                      data-testid={`category-option-${cat.id}`}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors',
                        'focus-within:ring-brand-500 focus-within:ring-2',
                        checked
                          ? 'border-brand-500 bg-brand-50 text-brand-900'
                          : 'border-border bg-background hover:bg-muted',
                      )}
                    >
                      <input
                        type="radio"
                        name="categoryId"
                        value={cat.id}
                        checked={checked}
                        onChange={() => field.onChange(cat.id)}
                        className="sr-only"
                      />
                      <span aria-hidden="true" className="text-base">
                        {cat.emoji}
                      </span>
                      <span className="text-sm font-medium">{cat.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          />
        )}

        {errors.categoryId && (
          <p role="alert" className="text-destructive text-xs">
            {errors.categoryId.message ?? 'Kategoriyani tanlang'}
          </p>
        )}
      </fieldset>

      {/* ── Sub-xizmat ──────────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label htmlFor="step1-sub-service">Aniq xizmat</Label>
        <select
          id="step1-sub-service"
          data-testid="sub-service-select"
          {...register('subServiceId')}
          disabled={!selectedCategoryId}
          aria-invalid={Boolean(errors.subServiceId)}
          className={cn(
            'border-input bg-background flex h-10 w-full items-center rounded-lg border px-3 text-sm transition-colors outline-none',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-2',
            'disabled:bg-muted disabled:cursor-not-allowed disabled:opacity-60',
            errors.subServiceId && 'border-destructive ring-destructive/20 ring-2',
          )}
        >
          <option value="">{selectedCategoryId ? 'Tanlang…' : 'Avval kategoriyani tanlang'}</option>
          {subServices.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        {errors.subServiceId && (
          <p role="alert" className="text-destructive text-xs">
            {errors.subServiceId.message ?? 'Aniq xizmatni tanlang'}
          </p>
        )}
      </div>

      {/* ── Tavsif ──────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label htmlFor="step1-description">
          Tavsif <span className="text-muted-foreground font-normal">(ixtiyoriy)</span>
        </Label>
        <Textarea
          id="step1-description"
          data-testid="description-textarea"
          rows={4}
          placeholder="Masalan: 3 ta rozetka almashtirish kerak, eski simlardan o'zi qulflanyapti."
          maxLength={DESCRIPTION_MAX + 50 /* hard cap, lekin RHF inline message > 500 */}
          aria-invalid={Boolean(errors.description)}
          {...register('description')}
        />
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Aniq tavsif → aniqroq narx baholanadi</span>
          <span
            className={cn(
              'tabular-nums',
              description.length > DESCRIPTION_MAX
                ? 'text-destructive font-medium'
                : 'text-muted-foreground',
            )}
            data-testid="description-counter"
          >
            {description.length} / {DESCRIPTION_MAX}
          </span>
        </div>
        {errors.description && (
          <p role="alert" className="text-destructive text-xs">
            {errors.description.message ?? `Tavsif ${DESCRIPTION_MAX} belgidan oshmasligi kerak`}
          </p>
        )}
      </div>

      {/* Submit tugma — wizard pastki "Davom etish" `form="booking-wizard-step-form"`
          orqali shu submit'ni triggerlaydi. Bu yerda hidden tugma — keyboard
          Enter foydalanuvchi tajribasini saqlaydi (mobile UX). */}
      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        data-testid="step-1-submit"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      >
        Submit
      </button>
    </form>
  );
}
