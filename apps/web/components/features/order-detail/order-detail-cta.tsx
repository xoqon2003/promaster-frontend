/**
 * Order detail CTA buttons (S06 T6.09).
 *
 * Cancel button + Chat placeholder. Cancel inline confirmation flow:
 * 1-bosish "Bekor qilish" → 2-bosish "Tasdiqlayman" (haqiqiy POST).
 * Bu accidental cancel'dan saqlaydi (modal ortiqcha).
 */
'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

import type { Order } from '@/lib/db/schema/orders';
import type { SupportedLocale } from '@/lib/format/duration';

import { MESSAGES } from './messages';

interface CtaProps {
  order: Order;
  locale: SupportedLocale;
  onCancel: (reason?: string) => Promise<void>;
}

export function OrderDetailCta({ order, locale, onCancel }: CtaProps) {
  const m = MESSAGES[locale].cta;
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancellable = order.status === 'pending' || order.status === 'accepted';

  async function handleConfirmCancel() {
    setSubmitting(true);
    setError(null);
    try {
      await onCancel(reason || undefined);
    } catch {
      setError(MESSAGES[locale].errors.cancelFailed);
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    setConfirming(false);
  }

  if (!cancellable && order.status !== 'in_progress' && order.status !== 'arrived') {
    // Terminal yoki tracking holatda — Chat tugma ko'rsatish (S07 placeholder).
    return (
      <button
        type="button"
        disabled
        className="bg-muted text-muted-foreground flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium"
        title={m.chatComingSoon}
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        {m.chat}
      </button>
    );
  }

  if (confirming) {
    return (
      <div className="border-border bg-card space-y-3 rounded-2xl border p-4">
        <label className="block text-sm">
          <span className="text-foreground font-medium">{m.cancelReason}</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="border-border bg-background mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            disabled={submitting}
          />
        </label>
        {error && <p className="text-destructive text-xs">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={submitting}
            className="border-border hover:bg-muted flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium"
          >
            {m.cancelCancel}
          </button>
          <button
            type="button"
            onClick={handleConfirmCancel}
            disabled={submitting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex-1 rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {submitting ? '...' : m.cancelConfirm}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      disabled={!cancellable}
      className="border-destructive/40 text-destructive hover:bg-destructive/5 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium disabled:opacity-50"
    >
      <X className="h-4 w-4" aria-hidden="true" />
      {m.cancel}
    </button>
  );
}
