'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';
import { PhoneInput } from '@/components/auth/phone-input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

// Login formasi uchun local schema (telefon raqam)
const LoginFormSchema = z.object({
  phone: z
    .string()
    .min(9, "To'liq telefon raqam kiriting")
    .max(9, "To'liq telefon raqam kiriting")
    .regex(/^\d{9}$/, 'Faqat raqam kiriting'),
});

type LoginFormData = z.infer<typeof LoginFormSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // A03: callbackUrl mavjud bo'lsa OTP'ga forward — login zanjirini saqlaydi
  const callbackUrl = searchParams?.get('callbackUrl') ?? null;
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: { phone: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    const phone = `+998${data.phone}`;
    // T5.05: API endpoint orqali sendOtp — provider (mock | eskiz) avtomatik
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setServerError(body.error ?? "SMS yuborib bo'lmadi");
      return;
    }
    const params = new URLSearchParams({ phone });
    if (callbackUrl) params.set('callbackUrl', callbackUrl);
    router.push(`/otp?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <PhoneInput
            value={field.value}
            onChange={field.onChange}
            error={errors.phone?.message}
            disabled={isSubmitting}
          />
        )}
      />

      {serverError && (
        <p role="alert" className="text-destructive text-center text-sm">
          {serverError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? (
          <>
            <Spinner size="sm" variant="white" label="Yuborilmoqda" />
            <span className="ml-2">Yuborilmoqda...</span>
          </>
        ) : (
          'Kod yuborish'
        )}
      </Button>

      <p className="text-muted-foreground text-center text-xs">
        UstaTop.uz ga kirib, siz{' '}
        <a href="/terms" className="text-brand-500 hover:underline">
          foydalanish shartlari
        </a>
        ga rozilik bildirasiz.
      </p>
    </form>
  );
}
