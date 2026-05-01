'use client';

import { Globe } from 'lucide-react';
import { useTransition } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { setLocaleAction } from '@/lib/i18n/actions';
import { LOCALE_LABELS, LOCALES, type Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';

interface LocaleSwitcherProps {
  current: Locale;
  /** Compact mode (icon only). Default — icon + uppercase locale code. */
  compact?: boolean;
}

export function LocaleSwitcher({ current, compact = false }: LocaleSwitcherProps) {
  const [pending, startTransition] = useTransition();
  const label = LOCALE_LABELS[current];

  const handleSelect = (value: Locale) => {
    if (value === current) return;
    startTransition(async () => {
      await setLocaleAction(value);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Til: ${label.native}. Tilni o'zgartirish`}
        disabled={pending}
        className={cn(
          'inline-flex h-8 items-center gap-1.5 rounded-md border border-transparent px-2',
          'text-foreground hover:bg-muted text-sm font-medium transition-colors',
          'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
          'disabled:pointer-events-none disabled:opacity-50',
        )}
      >
        <Globe className="size-4" aria-hidden="true" />
        {!compact && <span className="text-xs font-semibold uppercase">{current}</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        {LOCALES.map((loc) => {
          const meta = LOCALE_LABELS[loc];
          const active = loc === current;
          return (
            <DropdownMenuItem
              key={loc}
              onClick={() => handleSelect(loc)}
              className={active ? 'bg-accent font-semibold' : ''}
              aria-current={active ? 'true' : undefined}
            >
              <span aria-hidden="true" className="mr-2">
                {meta.flag}
              </span>
              {meta.native}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
