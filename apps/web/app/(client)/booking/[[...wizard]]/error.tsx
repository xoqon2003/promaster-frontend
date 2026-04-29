'use client';

/**
 * Booking wizard route-level error boundary.
 *
 * Task: T4.11
 *
 * Next.js App Router avtomatik error.tsx faylini topib, ushbu route'da
 * uncaught xatolikni ushlaydi. Wizard kontekstida bu:
 *  - Yandex Maps SDK yuklash xatoligi
 *  - Hook'lar ichida throw bo'lgan istisno
 *  - React render error
 *
 * UI: alert message + "Qayta urinib ko'ring" (reset) + "/search" link.
 */
import { AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

interface BookingErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BookingError({ error, reset }: BookingErrorProps) {
  useEffect(() => {
    // S05'da Sentry'ga yuboriladi — hozircha console.error (allowed by lint)
    console.error('[booking] route error:', error);
  }, [error]);

  return (
    <div
      data-slot="booking-error"
      data-testid="booking-route-error"
      className="bg-background flex min-h-screen items-center justify-center px-4"
    >
      <div className="border-border bg-card max-w-md rounded-2xl border p-8 text-center">
        <div className="bg-destructive/10 text-destructive mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full">
          <AlertTriangle aria-hidden="true" className="h-6 w-6" />
        </div>
        <h1 className="text-foreground mt-3 text-lg font-semibold">
          Nimadir noto&apos;g&apos;ri ketdi
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Buyurtma sahifasi kutilmaganda xato berdi. Iltimos, qayta urinib ko&apos;ring yoki
          qidiruvga qaytib, jarayonni qaytadan boshlang.
        </p>
        {error.digest && (
          <p className="text-muted-foreground/80 mt-2 font-mono text-xs">ID: {error.digest}</p>
        )}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            data-testid="booking-error-reset"
            className="bg-brand-500 hover:bg-brand-600 focus-visible:ring-brand-500 inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-white transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            Qayta urinish
          </button>

          <Link
            href="/search"
            data-testid="booking-error-search-link"
            className="border-border text-foreground hover:bg-muted focus-visible:ring-brand-500 inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Qidiruvga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}
