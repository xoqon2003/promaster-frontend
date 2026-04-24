'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { UserRole } from '@/lib/auth/schemas';

interface RoleOption {
  value: Exclude<UserRole, 'admin'>;
  label: string;
  subtitle: string;
  icon: LucideIcon;
}

interface RoleSelectorProps {
  value: Exclude<UserRole, 'admin'> | undefined;
  onChange: (role: Exclude<UserRole, 'admin'>) => void;
  options: RoleOption[];
}

export function RoleSelector({ value, onChange, options }: RoleSelectorProps) {
  return (
    <div role="radiogroup" aria-label="Rolingizni tanlang" className="grid gap-3">
      {options.map((option) => {
        const isSelected = value === option.value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                onChange(option.value);
              }
            }}
            className={cn(
              'border-border bg-card relative flex items-center gap-4 rounded-xl border p-4 text-left',
              'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
              'transition-all duration-150',
              isSelected
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/20 ring-brand-500/20 ring-2'
                : 'hover:border-border/80 hover:bg-muted/40',
            )}
          >
            {/* Icon */}
            <div
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                isSelected ? 'bg-brand-500 text-white' : 'bg-muted text-muted-foreground',
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'text-sm font-semibold',
                  isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-foreground',
                )}
              >
                {option.label}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">{option.subtitle}</p>
            </div>

            {/* Checkmark */}
            {isSelected && <Check className="text-brand-500 h-5 w-5 shrink-0" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}
