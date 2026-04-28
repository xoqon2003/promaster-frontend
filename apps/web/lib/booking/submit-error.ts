/**
 * Booking submit xatolarni tahlil qilish.
 *
 * Task: T4.11
 *
 * `bookingApi.create()` `Error` ob'ekti throw qiladi — turli sabablarga
 * ko'ra UI har xil javob berishi kerak:
 *
 *  - Validation: `BookingDraft validation failed: contact.phone: ...`
 *    → tegishli step ga qaytarish
 *  - Incomplete: `BookingDraft is incomplete: ...`
 *    → step 1'ga qaytarish (eng birinchi to'ldirilmagan)
 *  - Master not found: `Master not found: m_x`
 *    → /search ga qaytarish
 *  - Schema drift: `Booking schema rejection (server contract drift)`
 *    → toast + retry (server xatosi)
 *  - Tarmoq: `Failed to fetch`, network errors
 *    → toast + retry
 */
import { type WizardStep } from '@/lib/hooks/use-wizard-step';

// ─── Types ───────────────────────────────────────────────────────────────────

export type SubmitErrorKind =
  | 'validation'
  | 'incomplete'
  | 'master-not-found'
  | 'server-contract'
  | 'network'
  | 'unknown';

export interface SubmitErrorInfo {
  kind: SubmitErrorKind;
  /** UI'da ko'rsatish uchun — i18n tayyor matn. */
  message: string;
  /** Validation/incomplete xatolar uchun — qaysi stepga yo'naltirish kerak. */
  redirectStep?: WizardStep;
  /** Foydalanuvchi yana urinib ko'rishi mumkinmi (network/server). */
  retryable: boolean;
}

// ─── Field → Step mapping ────────────────────────────────────────────────────

/**
 * Zod xato yo'lidan (`contact.phone`, `addressSlot.slotAt`, ...) qaysi
 * step javobgar ekanligini aniqlaydi.
 */
function fieldPathToStep(path: string): WizardStep | undefined {
  if (path.startsWith('service')) return 1;
  if (path.startsWith('addressSlot') || path.startsWith('location') || path.startsWith('slotAt'))
    return 2;
  if (path.startsWith('photos')) return 3;
  if (path.startsWith('contact')) return 5;
  if (path.startsWith('masterId')) return 1;
  return undefined;
}

// ─── Classifier ──────────────────────────────────────────────────────────────

/**
 * Error obyektidan SubmitErrorInfo qaytaradi.
 *
 * @example
 *   const info = classifySubmitError(err);
 *   if (info.redirectStep) goToStep(info.redirectStep);
 *   showToast(info.message);
 */
export function classifySubmitError(err: unknown): SubmitErrorInfo {
  const raw = err instanceof Error ? err.message : String(err);

  // 1. Validation (Zod schema): "BookingDraft validation failed: contact.phone: msg; ..."
  if (raw.includes('validation failed:')) {
    const detail = raw.split('validation failed:')[1]?.trim() ?? '';
    // Birinchi xato yo'lini olib step aniqlaymiz: "contact.phone: msg; ..."
    const firstPath = detail.split(':')[0]?.trim() ?? '';
    const step = fieldPathToStep(firstPath);
    return {
      kind: 'validation',
      message: `Ma'lumotlarda xato bor: ${detail}`,
      redirectStep: step,
      retryable: false,
    };
  }

  // 2. Incomplete draft
  if (raw.includes('is incomplete')) {
    return {
      kind: 'incomplete',
      message: "Buyurtma to'liq emas. Iltimos, barcha bo'limlarni to'ldiring.",
      redirectStep: 1,
      retryable: false,
    };
  }

  // 3. Master not found
  if (/Master not found/i.test(raw)) {
    return {
      kind: 'master-not-found',
      message: 'Tanlangan usta topilmadi. Iltimos, qidiruvga qayting va boshqasini tanlang.',
      retryable: false,
    };
  }

  // 4. Server contract drift (Zod output rejection)
  if (raw.includes('server contract drift')) {
    return {
      kind: 'server-contract',
      message:
        'Server javobi noto`g`ri formatda. Iltimos, qayta urinib ko`ring (agar muammo davom etsa, qo`llab-quvvatlash xizmatiga murojaat qiling).',
      retryable: true,
    };
  }

  // 5. Tarmoq xatolari (fetch failed, abort, timeout)
  if (/network|fetch|timeout|aborted|connection/i.test(raw)) {
    return {
      kind: 'network',
      message: "Tarmoq xatosi. Internet ulanishini tekshirib, qayta urinib ko'ring.",
      retryable: true,
    };
  }

  // 6. Default
  return {
    kind: 'unknown',
    message: raw || "Yuborib bo'lmadi. Qayta urinib ko'ring.",
    retryable: true,
  };
}
