'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  variant?: 'icon' | 'dropdown';
  className?: string;
}

export function ThemeToggle({ variant = 'icon', className }: ThemeToggleProps) {
  const { setTheme, theme } = useTheme();

  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Mavzuni o'zgartirish"
          className={cn(
            'relative inline-flex h-8 w-8 items-center justify-center rounded-lg border-transparent',
            'hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:outline-none',
            'focus-visible:ring-ring focus-visible:ring-offset-2',
            className,
          )}
        >
          <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setTheme('light')}
            aria-current={theme === 'light' ? 'true' : undefined}
          >
            <Sun className="mr-2 h-4 w-4" />
            Kunduzgi
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme('dark')}
            aria-current={theme === 'dark' ? 'true' : undefined}
          >
            <Moon className="mr-2 h-4 w-4" />
            Tungi
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme('system')}
            aria-current={theme === 'system' ? 'true' : undefined}
          >
            <Monitor className="mr-2 h-4 w-4" />
            Tizim
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Mavzuni o'zgartirish"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={cn('relative', className)}
    >
      <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </Button>
  );
}
