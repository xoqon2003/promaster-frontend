'use client';

import { OTPInput, OTPInputContext } from 'input-otp';
import { useContext } from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  length?: number;
}

/** Bitta OTP katak */
function OtpSlot({ index }: { index: number }) {
  const ctx = useContext(OTPInputContext);
  const slot = ctx?.slots?.[index];
  if (!slot) return null;

  return (
    <div
      className={cn(
        'border-input bg-background relative flex h-12 w-10 items-center justify-center',
        'rounded-lg border text-center text-lg font-semibold transition-all',
        slot.isActive && 'border-brand-500 ring-brand-500/30 ring-2',
        !slot.isActive && slot.char && 'border-foreground/40',
      )}
    >
      {slot.char ?? <span className="text-muted-foreground/30 text-sm">{String(index + 1)}</span>}
      {slot.hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="bg-foreground animate-caret-blink h-5 w-px duration-1000" />
        </div>
      )}
    </div>
  );
}

export function OtpInput({
  value,
  onChange,
  onComplete,
  error,
  disabled = false,
  length = 6,
}: OtpInputProps) {
  const hasError = !!error;

  return (
    <div className="space-y-3">
      <OTPInput
        maxLength={length}
        value={value}
        onChange={onChange}
        onComplete={onComplete}
        disabled={disabled}
        containerClassName={cn('flex justify-center gap-2', disabled && 'opacity-50')}
        inputMode="numeric"
        autoComplete="one-time-code"
        aria-label={`OTP kodi, ${length} ta raqam`}
        aria-invalid={hasError}
        aria-describedby={hasError ? 'otp-error' : undefined}
        render={({ slots }) => (
          <>
            {slots.map((_, i) => (
              <OtpSlot key={i} index={i} />
            ))}
          </>
        )}
      />

      {hasError && (
        <p
          id="otp-error"
          role="alert"
          className={cn(
            'text-danger text-center text-xs',
            'animate-in fade-in slide-in-from-top-1 duration-200',
          )}
        >
          {error}
        </p>
      )}
    </div>
  );
}
