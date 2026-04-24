import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './error-boundary';

// React error boundary testlarda console.error chiqaradi — uni suppress qilamiz
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});
afterEach(() => {
  console.error = originalConsoleError;
});

function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test xatosi');
  return <div>Normal kontent</div>;
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Normal kontent')).toBeInTheDocument();
  });

  it('renders default fallback on error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Xato yuz berdi')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom xato</div>}>
        <ThrowError shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Custom xato')).toBeInTheDocument();
  });

  it('calls onError when error occurs', () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow />
      </ErrorBoundary>,
    );
    expect(onError).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.any(Object));
  });

  it('shows retry button in default fallback', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('button', { name: /qayta urinish/i })).toBeInTheDocument();
  });

  it('render function fallback receives error and reset', () => {
    const fallbackFn = vi.fn().mockReturnValue(<div>Function fallback</div>);
    render(
      <ErrorBoundary fallback={fallbackFn}>
        <ThrowError shouldThrow />
      </ErrorBoundary>,
    );
    expect(fallbackFn).toHaveBeenCalledWith(expect.any(Error), expect.any(Function));
    expect(screen.getByText('Function fallback')).toBeInTheDocument();
  });
});
