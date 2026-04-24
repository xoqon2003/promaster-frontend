'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback UI. Agar berilmasa, default fallback ko'rsatiladi */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /** Xato ushlanganida chaqiriladi (Sentry uchun) */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  reset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const { fallback } = this.props;
    const { error } = this.state;

    if (fallback) {
      return typeof fallback === 'function' ? fallback(error!, this.reset) : fallback;
    }

    return <DefaultErrorFallback error={error!} reset={this.reset} />;
  }
}

interface DefaultErrorFallbackProps {
  error: Error;
  reset: () => void;
}

function DefaultErrorFallback({ reset }: DefaultErrorFallbackProps) {
  return (
    <div
      role="alert"
      data-slot="error-boundary"
      className="flex flex-col items-center justify-center gap-4 py-12 text-center"
    >
      <div
        aria-hidden="true"
        className="bg-danger-bg text-danger flex h-16 w-16 items-center justify-center rounded-2xl"
      >
        <AlertCircle className="h-8 w-8" strokeWidth={1.5} />
      </div>
      <div className="space-y-1.5">
        <p className="font-display text-foreground text-base font-semibold">Xato yuz berdi</p>
        <p className="text-muted-foreground max-w-xs text-sm">
          Sahifani yangilang yoki qayta urinib ko&apos;ring
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={reset}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Qayta urinish
      </Button>
    </div>
  );
}
