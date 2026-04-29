'use client';

/**
 * `AddressMapInner` — Yandex Maps single-pin draggable picker.
 *
 * Task: T4.05
 *
 * FAQAT dynamic import orqali yuklanadi (ssr: false). Yandex SDK
 * browser'da ishlaydi.
 *
 * Tarkib:
 *  - Toshkent markazi default pin (41.31, 69.28)
 *  - Pin draggable — mijoz tortib qo'yadi
 *  - Map'ga click ham pin'ni o'sha joyga ko'chiradi
 *  - dragend / click → onCoordsChange(coords)
 */
import { Map, Placemark, YMaps } from '@pbe/react-yandex-maps';
import { useCallback } from 'react';

// ─── Constants ───────────────────────────────────────────────────────────────

const TASHKENT_CENTER: [number, number] = [41.2995, 69.2401];
const DEFAULT_ZOOM = 13;
const YANDEX_API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY ?? '';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AddressMapInnerProps {
  /** Joriy pin koordinatasi (yoki Toshkent markazi). */
  coords: [number, number] | null;
  onCoordsChange: (coords: [number, number]) => void;
}

interface YmapsCoordsEvent {
  get: (key: 'coords' | 'target') => unknown;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AddressMapInner({ coords, onCoordsChange }: AddressMapInnerProps) {
  const center = coords ?? TASHKENT_CENTER;

  const handleMapClick = useCallback(
    (e: YmapsCoordsEvent) => {
      const next = e.get('coords') as [number, number] | undefined;
      if (next && next.length === 2) {
        onCoordsChange([next[0], next[1]]);
      }
    },
    [onCoordsChange],
  );

  const handleDragEnd = useCallback(
    (e: YmapsCoordsEvent) => {
      const target = e.get('target') as { geometry?: { getCoordinates: () => [number, number] } };
      const geo = target?.geometry?.getCoordinates();
      if (geo && geo.length === 2) {
        onCoordsChange([geo[0], geo[1]]);
      }
    },
    [onCoordsChange],
  );

  return (
    <YMaps query={{ apikey: YANDEX_API_KEY, lang: 'ru_RU' }}>
      <Map
        defaultState={{ center: TASHKENT_CENTER, zoom: DEFAULT_ZOOM }}
        state={{ center, zoom: DEFAULT_ZOOM }}
        width="100%"
        height="100%"
        onClick={handleMapClick}
        data-testid="address-map"
      >
        {coords && (
          <Placemark
            geometry={coords}
            options={{
              draggable: true,
              preset: 'islands#redCircleDotIcon',
            }}
            onDragEnd={handleDragEnd}
            data-testid="address-pin"
          />
        )}
      </Map>
    </YMaps>
  );
}
