'use client';

/**
 * Step 5 — Bog'lanish ma'lumotlari + auth gate.
 *
 * Task: T4.08
 *
 * Tarkib:
 *  - Login qilingan: ism + telefon profile'dan auto-filled (override mumkin)
 *  - Mehmon: "Davom etishdan oldin tizimga kiring" + login link
 *  - Form: fullName, phone, alternativePhone (ixtiyoriy)
 *
 * R04 mitigation (mehmon → login → restore):
 *  - callbackUrl `?callbackUrl=/booking?step=5&draft=...` orqali kelishadi
 *  - useBookingDraft URL'dan / sessionStorage'dan o'qib oladi
 *  - Hozircha test'da auth state oddiy mock orqali tekshiriladi
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { Label } from '@/components/ui/label';
import { useBookingDraft } from '@/lib/hooks/use-booking-draft';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { ContactSchema, type Contact } from '@/lib/booking/schemas';
import { cn } from '@/lib/utils';

import { WIZARD_FORM_ID } from './step-1-service';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * E.164 telefon ("+998901234567") ni "90 123 45 67" formatga aylantiradi.
 * Input read-only ko'rinishida.
 */
function formatPhoneDisplay(e164: string): string {
  if (!e164.startsWith('+998') || e164.length !== 13) return e164;
  const local = e164.slice(4);
  return `${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7)}`;
}

/** "90 123 45 67" → "+998901234567" (raqamlardan tashqari hammasini olib tashlaydi). */
function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('998')) return `+${digits.slice(0, 12)}`;
  if (digits.length === 9) return `+998${digits}`;
  return input.trim();
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Step5ContactProps {
  onComplete: () => void;
}

// ─── Auth gate ───────────────────────────────────────────────────────────────

interface AuthGateProps {
  callbackUrl: string;
}

function AuthGate({ callbackUrl }: AuthGateProps) {
  const loginUrl = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  return (
    <div
      data-slot="step-5-auth-gate"
      data-testid="step-5-auth-gate"
      className="border-border bg-card mx-auto max-w-2xl rounded-2xl border p-8 text-center"
    >
      <div className="bg-brand-50 text-brand-600 mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full">
        <LogIn aria-hidden="true" className="h-6 w-6" />
      </div>
      <h2 className="text-foreground mt-3 text-lg font-semibold">Tizimga kiring</h2>
      <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
        Buyurtma yaratish uchun tizimga kirishingiz kerak. Ma&apos;lumotlaringiz saqlanadi —
        login&apos;dan keyin shu joydan davom etasiz.
      </p>
      <Link
        href={loginUrl}
        data-testid="step-5-login-link"
        className="bg-brand-500 hover:bg-brand-600 focus-visible:ring-brand-500 mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-white transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        <LogIn aria-hidden="true" className="h-4 w-4" />
        Login sahifasiga
      </Link>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Step5Contact({ onComplete }: Step5ContactProps) {
  const { user, isLoading, isAuthenticated } = useCurrentUser();
  const { draft, setDraft } = useBookingDraft();
  const pathname = usePathname();
  const params = useSearchParams();

  // callbackUrl — joriy URL (login'dan keyin shu joyga qaytadi)
  const callbackUrl = useMemo(() => {
    if (!pathname) return '/booking';
    const search = params?.toString();
    return search ? `${pathname}?${search}` : pathname;
  }, [pathname, params]);

  const initial: Contact | undefined = useMemo(() => {
    if (draft.contact) return draft.contact;
    if (user) {
      return {
        fullName: user.name ?? '',
        phone: user.phone ?? '',
      };
    }
    return undefined;
  }, [draft.contact, user]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<Contact>({
    resolver: zodResolver(ContactSchema),
    mode: 'onChange',
    defaultValues: initial,
  });

  const fullName = watch('fullName');
  const phone = watch('phone');
  const alternativePhone = watch('alternativePhone');

  const onSubmit = async (data: Contact) => {
    await setDraft({ contact: data });
    onComplete();
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        data-testid="step-5-loading"
        className="border-border bg-card mx-auto flex max-w-2xl items-center justify-center gap-2 rounded-2xl border p-12"
      >
        <Loader2 aria-hidden="true" className="text-muted-foreground h-5 w-5 animate-spin" />
        <span className="text-muted-foreground text-sm">Yuklanmoqda…</span>
      </div>
    );
  }

  // ── Auth gate ────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return <AuthGate callbackUrl={callbackUrl} />;
  }

  // ── Authenticated form ───────────────────────────────────────────────────
  return (
    <form
      id={WIZARD_FORM_ID}
      data-slot="step-5-contact"
      data-testid="step-5-contact-form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="border-border bg-card mx-auto max-w-2xl space-y-5 rounded-2xl border p-5 sm:p-6"
    >
      <div className="space-y-1">
        <h2 className="text-foreground text-lg font-semibold">Bog&apos;lanish ma&apos;lumotlari</h2>
        <p className="text-muted-foreground text-sm">
          Usta siz bilan bog&apos;lanishi uchun ushbu raqamlardan foydalanadi.
        </p>
      </div>

      {/* ── Ism ─────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="step5-full-name">To&apos;liq ism</Label>
        <input
          id="step5-full-name"
          type="text"
          autoComplete="name"
          placeholder="Bobur Toshmatov"
          aria-invalid={Boolean(errors.fullName)}
          {...register('fullName')}
          data-testid="step-5-full-name"
          className={cn(
            'border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-lg border px-3 text-sm transition-colors outline-none focus-visible:ring-2',
            errors.fullName && 'border-destructive ring-destructive/20 ring-2',
          )}
        />
        {errors.fullName && (
          <p role="alert" className="text-destructive text-xs">
            {errors.fullName.message ?? 'Ism kamida 2 belgi'}
          </p>
        )}
      </div>

      {/* ── Asosiy telefon ─────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="step5-phone">Telefon</Label>
        <div className="flex items-stretch">
          <span className="border-input bg-muted text-muted-foreground inline-flex items-center rounded-l-lg border border-r-0 px-3 text-sm">
            +998
          </span>
          <input
            id="step5-phone"
            type="tel"
            autoComplete="tel"
            inputMode="numeric"
            placeholder="90 123 45 67"
            aria-invalid={Boolean(errors.phone)}
            value={phone ? formatPhoneDisplay(phone) : ''}
            onChange={(e) => {
              setValue('phone', normalizePhone(e.target.value), {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            data-testid="step-5-phone"
            className={cn(
              'border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-r-lg border px-3 text-sm tabular-nums transition-colors outline-none focus-visible:ring-2',
              errors.phone && 'border-destructive ring-destructive/20 ring-2',
            )}
          />
        </div>
        {errors.phone && (
          <p role="alert" className="text-destructive text-xs">
            {errors.phone.message ?? "Telefon +998 XX XXX XX XX shaklida bo'lishi kerak"}
          </p>
        )}
      </div>

      {/* ── Ixtiyoriy 2-telefon ───────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="step5-alt-phone">
          Qo&apos;shimcha telefon{' '}
          <span className="text-muted-foreground font-normal">(ixtiyoriy)</span>
        </Label>
        <div className="flex items-stretch">
          <span className="border-input bg-muted text-muted-foreground inline-flex items-center rounded-l-lg border border-r-0 px-3 text-sm">
            +998
          </span>
          <input
            id="step5-alt-phone"
            type="tel"
            autoComplete="tel"
            inputMode="numeric"
            placeholder="93 555 44 33"
            aria-invalid={Boolean(errors.alternativePhone)}
            value={alternativePhone ? formatPhoneDisplay(alternativePhone) : ''}
            onChange={(e) => {
              const value = e.target.value.trim();
              if (!value) {
                setValue('alternativePhone', undefined, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              } else {
                setValue('alternativePhone', normalizePhone(value), {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }
            }}
            data-testid="step-5-alt-phone"
            className={cn(
              'border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-r-lg border px-3 text-sm tabular-nums transition-colors outline-none focus-visible:ring-2',
              errors.alternativePhone && 'border-destructive ring-destructive/20 ring-2',
            )}
          />
        </div>
        {errors.alternativePhone && (
          <p role="alert" className="text-destructive text-xs">
            Qo&apos;shimcha raqam +998 XX XXX XX XX shaklida bo&apos;lishi kerak
          </p>
        )}
        <p className="text-muted-foreground text-xs">
          Oila a&apos;zosi yoki ish telefoni — agar siz javob bera olmasangiz, usta ushbu raqamga
          qo&apos;ng&apos;iroq qiladi.
        </p>
      </div>

      {/* Validation summary — debug uchun bo'sh ekran payti */}
      {!isValid && (fullName || phone) && (
        <p className="text-muted-foreground text-xs italic">
          Davom etish uchun barcha majburiy maydonlarni to&apos;ldiring.
        </p>
      )}

      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        data-testid="step-5-submit"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      >
        Submit
      </button>
    </form>
  );
}

// ─── Test exports ────────────────────────────────────────────────────────────

/** @internal */
export const __test__ = { formatPhoneDisplay, normalizePhone, AuthGate };
