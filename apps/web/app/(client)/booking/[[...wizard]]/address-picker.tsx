'use client';

/**
 * `AddressPicker` — Manzil tanlash (xarita + reverse-geo + manzil matni).
 *
 * Task: T4.05
 *
 * Tarkib:
 *  - Yandex Maps (dynamic, ssr: false) — pin draggable
 *  - Pin tortilgach 800ms debounce + cache → manzil matni
 *  - Manzil input — read-only, lekin foydalanuvchi to'g'rilashi mumkin
 *
 * Initial coords: prop'dan yoki Toshkent markazi.
 *
 * R05 mitigation: `useDebouncedReverseGeo` (800ms + 5 daqiqa cache).
 */
import dynamic from 'next/dynamic';
import { Loader2, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { useDebouncedReverseGeo } from '@/lib/booking/use-debounced-reverse-geo';

// ─── Dynamic import ──────────────────────────────────────────────────────────

const AddressMapInner = dynamic(
  () => import('./address-map').then((m) => ({ default: m.AddressMapInner })),
  {
    ssr: false,
    loading: () => <MapLoadingFallback />,
  },
);

function MapLoadingFallback() {
  return (
    <div
      data-slot="address-map-loading"
      className="bg-muted flex h-[300px] w-full items-center justify-center rounded-2xl"
      aria-busy="true"
      aria-label="Xarita yuklanmoqda"
    >
      <Spinner size="lg" />
    </div>
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AddressValue {
  lat: number;
  lng: number;
  address: string;
}

export interface AddressPickerProps {
  /** Joriy manzil — null bo'lsa Toshkent markazi pin'siz xarita. */
  value: AddressValue | null;
  /** To'liq manzil tanlanganda (coords + address) chaqiriladi. */
  onChange: (next: AddressValue) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AddressPicker({ value, onChange }: AddressPickerProps) {
  const [coords, setCoords] = useState<[number, number] | null>(
    value ? [value.lat, value.lng] : null,
  );
  const [manualAddress, setManualAddress] = useState<string>(value?.address ?? '');
  const [hasInteracted, setHasInteracted] = useState<boolean>(Boolean(value));

  const { address: autoAddress, isLoading } = useDebouncedReverseGeo(coords);

  // Reverse-geo natijasi kelgach manualAddress'ni avtomatik yangilash
  // (faqat foydalanuvchi qo'lda yozmagan bo'lsa)
  useEffect(() => {
    if (autoAddress && !manualAddress) {
      setManualAddress(autoAddress);
    }
  }, [autoAddress, manualAddress]);

  // Coords + address mavjud bo'lganda parent'ga xabar
  useEffect(() => {
    if (!coords) return;
    const finalAddress = manualAddress || autoAddress || '';
    if (!finalAddress) return;
    onChange({ lat: coords[0], lng: coords[1], address: finalAddress });
  }, [coords, manualAddress, autoAddress, onChange]);

  const handleCoordsChange = (next: [number, number]) => {
    setCoords(next);
    setManualAddress(''); // reverse-geo qayta yangilashi uchun
    setHasInteracted(true);
  };

  return (
    <div data-slot="address-picker" className="space-y-3">
      <div className="h-[280px] overflow-hidden rounded-xl border" data-testid="address-map-frame">
        <AddressMapInner coords={coords} onCoordsChange={handleCoordsChange} />
      </div>

      {!hasInteracted && (
        <p className="text-muted-foreground flex items-start gap-2 text-xs">
          <MapPin aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>Xaritada kerakli joyni bosing — pin avtomatik manzilni topadi.</span>
        </p>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="address-text"
          className="text-foreground flex items-center gap-2 text-sm font-medium"
        >
          Manzil
          {isLoading && (
            <span
              data-testid="address-loading"
              className="text-muted-foreground inline-flex items-center gap-1 text-xs font-normal"
            >
              <Loader2 aria-hidden="true" className="h-3 w-3 animate-spin" />
              Aniqlanmoqda…
            </span>
          )}
        </label>
        <input
          id="address-text"
          data-testid="address-input"
          type="text"
          value={manualAddress}
          onChange={(e) => setManualAddress(e.target.value)}
          placeholder="Masalan: Toshkent, Chilonzor 12-uy"
          className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-lg border px-3 text-sm transition-colors outline-none focus-visible:ring-2"
        />
      </div>
    </div>
  );
}
