/**
 * `<LiveTrackingMapInner />` — Yandex Maps real-time tracking core
 * (S06 T6.07).
 *
 * Bu fayl FAQAT dynamic import orqali yuklanadi (`ssr: false`). Yandex SDK
 * (~250KB) faqat tracking faol order page'larda lazy load qilinadi —
 * marketing landing'ga ta'sir yo'q (R02 bundle budget).
 *
 * Pin'lar:
 *   - Mijoz (qizil) — statik, manzil koordinatalari
 *   - Usta (ko'k) — real-time, T6.03 SSE'dan kelgan oxirgi `tracking_pings`
 *
 * `fitBounds` ikkalasini kadrga oladi (padding 64px). Usta `null` bo'lsa
 * (status pending/accepted), faqat mijoz pin'i.
 *
 * **Smooth transition:** Yandex Maps Placemark `geometry` o'zgarganda
 * darhol jump qiladi. Vizual smoothness uchun keyingi sprintda
 * (T6.07b) tween logic qo'shilishi mumkin — hozir SSE har 5s da yangi
 * ping kelgani uchun jump farqi sezilmaydi.
 */
'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Map, Placemark, YMaps } from '@pbe/react-yandex-maps';

const YANDEX_API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY ?? '';

const FIT_PADDING = 64;

export interface LiveTrackingMapCoords {
  lat: number;
  lng: number;
}

export interface LiveTrackingMapInnerProps {
  client: LiveTrackingMapCoords;
  pro: LiveTrackingMapCoords | null;
}

export function LiveTrackingMapInner({ client, pro }: LiveTrackingMapInnerProps) {
  // Yandex Map instance ref — fitBounds chaqirish uchun
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  const fitBounds = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    if (pro) {
      const bounds: [[number, number], [number, number]] = [
        [Math.min(client.lat, pro.lat), Math.min(client.lng, pro.lng)],
        [Math.max(client.lat, pro.lat), Math.max(client.lng, pro.lng)],
      ];
      map.setBounds(bounds, { checkZoomRange: true, zoomMargin: FIT_PADDING });
    } else {
      map.setCenter([client.lat, client.lng], 14);
    }
  }, [client.lat, client.lng, pro]);

  // Pin pozitsiyasi yangilanganda fitBounds qayta chaqiriladi
  useEffect(() => {
    fitBounds();
  }, [fitBounds]);

  return (
    <YMaps query={{ apikey: YANDEX_API_KEY, lang: 'ru_RU' }}>
      <Map
        instanceRef={mapRef}
        defaultState={{ center: [client.lat, client.lng], zoom: 14 }}
        width="100%"
        height="100%"
        data-testid="live-tracking-map"
      >
        <Placemark
          geometry={[client.lat, client.lng]}
          options={{
            preset: 'islands#redCircleDotIcon',
          }}
          properties={{ hintContent: 'Mijoz manzili' }}
          data-testid="client-pin"
        />
        {pro && (
          <Placemark
            geometry={[pro.lat, pro.lng]}
            options={{
              preset: 'islands#blueCircleDotIcon',
            }}
            properties={{ hintContent: 'Usta hozir' }}
            data-testid="pro-pin"
          />
        )}
      </Map>
    </YMaps>
  );
}
