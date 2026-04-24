import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { OrderStatus } from './status-badge';
import { StatusBadge } from './status-badge';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Kutilmoqda',
  accepted: 'Qabul qilindi',
  in_progress: 'Jarayonda',
  done: 'Bajarildi',
  cancelled: 'Bekor qilindi',
  disputed: 'Nizo',
};

describe('StatusBadge', () => {
  it.each(Object.entries(STATUS_LABELS) as [OrderStatus, string][])(
    'renders correct label for %s',
    (status, label) => {
      render(<StatusBadge status={status} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    },
  );

  it('has aria-label matching visible label', () => {
    render(<StatusBadge status="done" />);
    expect(screen.getByLabelText('Bajarildi')).toBeInTheDocument();
  });

  it('sets data-status attribute', () => {
    render(<StatusBadge status="in_progress" />);
    expect(screen.getByLabelText('Jarayonda')).toHaveAttribute('data-status', 'in_progress');
  });

  it('adds animate-pulse class for in_progress', () => {
    render(<StatusBadge status="in_progress" />);
    const badge = screen.getByLabelText('Jarayonda');
    // dot span (aria-hidden) has animate-pulse
    const dot = badge.querySelector('[aria-hidden="true"]');
    expect(dot?.className).toContain('animate-pulse');
  });

  it('adds animate-pulse class for disputed', () => {
    render(<StatusBadge status="disputed" />);
    const badge = screen.getByLabelText('Nizo');
    const dot = badge.querySelector('[aria-hidden="true"]');
    expect(dot?.className).toContain('animate-pulse');
  });

  it('does NOT add animate-pulse for done', () => {
    render(<StatusBadge status="done" />);
    const badge = screen.getByLabelText('Bajarildi');
    const dot = badge.querySelector('[aria-hidden="true"]');
    expect(dot?.className).not.toContain('animate-pulse');
  });
});
