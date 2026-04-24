'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Production'da: Sentry / log service'ga yuborish
    console.error('[AppError]', error);
  }, [error]);

  return (
    <main className="bg-background flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-danger font-display text-6xl font-bold">!</p>
      <h1 className="text-foreground mt-4 text-2xl font-semibold">Nimadir xato ketdi</h1>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">
        Kutilmagan xatolik yuz berdi. Iltimos, qayta urinib ko&apos;ring.
      </p>
      {error.digest && <p className="text-muted-foreground mt-2 text-xs">ID: {error.digest}</p>}
      <Button onClick={reset} className="mt-6">
        Qayta urinish
      </Button>
    </main>
  );
}
