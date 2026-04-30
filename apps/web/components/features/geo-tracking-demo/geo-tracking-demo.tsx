/**
 * `<GeoTrackingDemo />` — `useGeoTracking` debug widget (S06 T6.04).
 *
 * Storybook'da 3 holat (prompt, granted, denied) ko'rsatish uchun yengil
 * demo komponent. Production'da `app/(pro)/orders/[id]/active-tracking`
 * ostida ishlatilishi mumkin (usta uchun tracking holati indikatori).
 */
'use client';

import { useState } from 'react';

import {
  type GeoTrackingPing,
  type GeoTrackingTarget,
  useGeoTracking,
} from '@/lib/hooks/use-geo-tracking';

export interface GeoTrackingDemoProps {
  target: GeoTrackingTarget | null;
  initialEnabled?: boolean;
}

export function GeoTrackingDemo({ target, initialEnabled = true }: GeoTrackingDemoProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [pings, setPings] = useState<GeoTrackingPing[]>([]);

  const { permission, lastPing, lastError, requestPermission } = useGeoTracking({
    target,
    enabled,
    onPing: (ping) => setPings((prev) => [ping, ...prev].slice(0, 5)),
  });

  return (
    <div className="border-border bg-card max-w-md rounded-2xl border p-6">
      <h2 className="text-foreground font-display text-lg font-semibold">GPS Tracking demo</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Usta yo&apos;lda — adaptive interval (30s default, 15s ≤ 500m).
      </p>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Permission</dt>
          <dd>
            <span
              className={
                permission === 'granted'
                  ? 'rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700'
                  : permission === 'denied'
                    ? 'bg-destructive/10 text-destructive rounded-full px-2 py-0.5 text-xs font-medium'
                    : permission === 'unsupported'
                      ? 'bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs'
                      : 'bg-brand-100 text-brand-700 rounded-full px-2 py-0.5 text-xs font-medium'
              }
              data-testid="permission-badge"
            >
              {permission}
            </span>
          </dd>
        </div>

        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Tracking</dt>
          <dd className="font-mono text-xs">{enabled ? 'on' : 'off'}</dd>
        </div>

        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Latest ping</dt>
          <dd className="font-mono text-xs">
            {lastPing
              ? `${lastPing.lat.toFixed(4)}, ${lastPing.lng.toFixed(4)} (±${lastPing.accuracy.toFixed(0)}m)`
              : '—'}
          </dd>
        </div>

        {lastError && (
          <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border p-3 text-xs">
            {lastError}
          </div>
        )}
      </dl>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setEnabled((v) => !v)}
          className="border-border hover:bg-muted rounded-lg border px-3 py-1.5 text-sm"
        >
          {enabled ? 'Pause' : 'Resume'}
        </button>
        {permission === 'denied' && (
          <button
            type="button"
            onClick={requestPermission}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-3 py-1.5 text-sm"
          >
            Qayta urinish
          </button>
        )}
      </div>

      {pings.length > 0 && (
        <details className="mt-4 text-xs">
          <summary className="text-muted-foreground cursor-pointer">
            So&apos;nggi {pings.length} ping
          </summary>
          <ul className="text-muted-foreground mt-2 space-y-1 font-mono">
            {pings.map((p) => (
              <li key={p.recordedAt.toISOString()}>
                {p.recordedAt.toISOString().slice(11, 19)} — {p.lat.toFixed(4)}, {p.lng.toFixed(4)}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
