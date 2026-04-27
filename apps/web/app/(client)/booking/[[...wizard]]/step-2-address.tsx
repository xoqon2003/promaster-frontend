'use client';

/**
 * Step 2 — Manzil + vaqt slot.
 *
 * Task: T4.05
 *
 * Tarkib:
 *  - `AddressPicker` — Yandex Maps + reverse-geo (R05 mitigation)
 *  - `SlotPicker` — 7 kun + 30 daqiqali slot grid (R02 mitigation)
 *
 * Form (RHF + Zod):
 *  - `addressSlot.location` — coords + address
 *  - `addressSlot.slotAt` — ISO datetime (validation: hozirdan + 2 soat)
 *
 * Initial values: `useBookingDraft.draft.addressSlot` dan to'ldiriladi.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useBookingDraft } from '@/lib/hooks/use-booking-draft';
import { AddressSlotSchema, type AddressSlot } from '@/lib/booking/schemas';

import { AddressPicker, type AddressValue } from './address-picker';
import { SlotPicker } from './slot-picker';
import { WIZARD_FORM_ID } from './step-1-service';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Step2AddressProps {
  onComplete: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Step2Address({ onComplete }: Step2AddressProps) {
  const { draft, setDraft } = useBookingDraft();

  const initial: AddressSlot | undefined = draft.addressSlot;

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<AddressSlot>({
    resolver: zodResolver(AddressSlotSchema),
    mode: 'onChange',
    defaultValues: initial,
  });

  const location = watch('location');
  const slotAt = watch('slotAt');

  const handleAddressChange = (next: AddressValue) => {
    setValue(
      'location',
      { lat: next.lat, lng: next.lng, address: next.address },
      { shouldValidate: true, shouldDirty: true },
    );
  };

  const handleSlotChange = (iso: string) => {
    setValue('slotAt', iso, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (data: AddressSlot) => {
    await setDraft({ addressSlot: data });
    onComplete();
  };

  // AddressPicker'ga uzatiladigan value
  const addressValue: AddressValue | null = location
    ? { lat: location.lat, lng: location.lng, address: location.address }
    : null;

  return (
    <form
      id={WIZARD_FORM_ID}
      data-slot="step-2-address"
      data-testid="step-2-address-form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="border-border bg-card mx-auto max-w-2xl space-y-6 rounded-2xl border p-5 sm:p-6"
    >
      {/* ── Manzil ────────────────────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-foreground text-sm font-semibold">Xizmat manzili</legend>
        <AddressPicker value={addressValue} onChange={handleAddressChange} />
        {errors.location && (
          <p role="alert" className="text-destructive text-xs">
            Manzilni xaritada belgilang
          </p>
        )}
      </fieldset>

      {/* ── Vaqt ──────────────────────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-foreground text-sm font-semibold">Qachon kerak?</legend>
        <SlotPicker value={slotAt ?? null} onChange={handleSlotChange} />
        {errors.slotAt && (
          <p role="alert" className="text-destructive text-xs">
            {errors.slotAt.message ?? 'Vaqt slot tanlang (kamida 2 soat keyin)'}
          </p>
        )}
      </fieldset>

      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        data-testid="step-2-submit"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      >
        Submit
      </button>
    </form>
  );
}
