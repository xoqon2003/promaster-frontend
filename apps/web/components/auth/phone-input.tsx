'use client';

import { forwardRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

/** Faqat raqam qoldiradi, +998 prefixi tashlab ketiladi */
function stripPrefix(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('998')) return digits.slice(3);
  if (digits.startsWith('0')) return digits.slice(1);
  return digits;
}

/** 9 ta raqamni "XX XXX XX XX" formatiga keltiradi */
function formatLocal(digits: string): string {
  const d = digits.slice(0, 9);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)} ${d.slice(2)}`;
  if (d.length <= 7) return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`;
  return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7)}`;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  { value, onChange, error, disabled, placeholder = '90 123 45 67' },
  ref,
) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const digits = stripPrefix(raw).replace(/\D/g, '');
      onChange(digits);
    },
    [onChange],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text');
      const digits = stripPrefix(pasted).replace(/\D/g, '');
      onChange(digits.slice(0, 9));
    },
    [onChange],
  );

  const hasError = !!error;

  return (
    <div className="space-y-1.5">
      <label htmlFor="phone-input" className="text-foreground block text-sm font-medium">
        Telefon raqam
      </label>

      <div
        className={cn(
          'border-input focus-within:ring-ring flex items-center rounded-lg border bg-transparent',
          'transition-shadow focus-within:ring-2 focus-within:ring-offset-2',
          hasError && 'border-danger focus-within:ring-danger',
          disabled && 'opacity-50',
        )}
      >
        {/* Prefix */}
        <span
          aria-hidden="true"
          className="text-muted-foreground border-input border-r px-3 py-2.5 text-sm select-none"
        >
          +998
        </span>

        {/* Input */}
        <input
          ref={ref}
          id="phone-input"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          aria-label="Telefon raqam"
          aria-invalid={hasError}
          aria-describedby={hasError ? 'phone-error' : undefined}
          disabled={disabled}
          placeholder={placeholder}
          value={formatLocal(value)}
          onChange={handleChange}
          onPaste={handlePaste}
          className={cn(
            'min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none',
            'placeholder:text-muted-foreground',
            'disabled:cursor-not-allowed',
          )}
        />
      </div>

      {hasError && (
        <p id="phone-error" role="alert" className="text-danger text-xs">
          {error}
        </p>
      )}
    </div>
  );
});
