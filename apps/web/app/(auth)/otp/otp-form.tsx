'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { OtpInput } from '@/components/auth/otp-input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { UserRole } from '@/lib/auth/schemas';

const OTP_TIMEOUT = 120; // 2 daqiqa

const ROLE_HOME: Record<UserRole, string> = {
  client: '/home',
  pro: '/dashboard',
  admin: '/moderation',
};

interface OtpFormProps {
  phone: string;
  /** A03: login zanjirini saqlash — login'dan keyin shu URL'ga qaytadi. */
  callbackUrl?: string;
}

export function OtpForm({ phone, callbackUrl }: OtpFormProps) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(3);
  const [seconds, setSeconds] = useState(OTP_TIMEOUT);

  // Countdown timer
  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleResend = async () => {
    // T5.05: API endpoint — provider (mock | eskiz) avtomatik
    await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    setSeconds(OTP_TIMEOUT);
    setCode('');
    setError('');
    setAttempts(3);
  };

  const handleSubmit = useCallback(
    async (value: string) => {
      if (value.length !== 6) return;
      setIsLoading(true);
      setError('');

      const result = await signIn('otp', {
        phone,
        code: value,
        redirect: false,
      });

      setIsLoading(false);

      if (result?.ok) {
        // A03: foydalanuvchi profili (name + role) bormi tekshiramiz.
        // Bor bo'lsa — to'g'ridan callbackUrl/home; yo'q bo'lsa — /signup
        // ga callbackUrl'ni forward qilamiz.
        const session = await getSession();
        const hasProfile = Boolean(session?.user?.name);
        if (hasProfile) {
          const role = session?.user?.role as UserRole | undefined;
          const dest = callbackUrl ?? (role ? ROLE_HOME[role] : '/home');
          router.push(dest);
        } else {
          const next = callbackUrl
            ? `/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`
            : '/signup';
          router.push(next);
        }
      } else {
        const remaining = attempts - 1;
        setAttempts(remaining);
        setCode('');
        setError(
          remaining > 0
            ? `Kod noto'g'ri. ${remaining} ta urinish qoldi`
            : "Juda ko'p urinish. Yangi kod so'rang",
        );
      }
    },
    [phone, router, attempts, callbackUrl],
  );

  return (
    <div className="space-y-6">
      <OtpInput
        value={code}
        onChange={setCode}
        onComplete={handleSubmit}
        error={error}
        disabled={isLoading || attempts <= 0}
      />

      {/* Submit button (mobil uchun, auto-submit ham bor) */}
      <Button
        className="w-full"
        onClick={() => handleSubmit(code)}
        disabled={code.length !== 6 || isLoading || attempts <= 0}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <Spinner size="sm" variant="white" label="Tekshirilmoqda" />
            <span className="ml-2">Tekshirilmoqda...</span>
          </>
        ) : (
          'Tasdiqlash'
        )}
      </Button>

      {/* Resend + countdown */}
      <div className="text-center">
        {seconds > 0 ? (
          <p className="text-muted-foreground text-sm">
            Qayta yuborish:{' '}
            <span className="text-foreground font-medium tabular-nums">{formatTime(seconds)}</span>
          </p>
        ) : (
          <Button variant="ghost" size="sm" onClick={handleResend}>
            Qayta yuborish
          </Button>
        )}
      </div>

      {/* Back link */}
      <div className="text-center">
        <Link
          href="/login"
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          ← Raqamni o&apos;zgartirish
        </Link>
      </div>
    </div>
  );
}
