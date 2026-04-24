import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TrustBadge } from './trust-badge';

describe('TrustBadge', () => {
  it('renders verified label', () => {
    render(<TrustBadge level="verified" />);
    expect(screen.getByText('Tekshirilgan')).toBeInTheDocument();
  });

  it('renders premium label', () => {
    render(<TrustBadge level="premium" />);
    expect(screen.getByText('Premium')).toBeInTheDocument();
  });

  it('hides label when showLabel=false', () => {
    render(<TrustBadge level="verified" showLabel={false} />);
    expect(screen.queryByText('Tekshirilgan')).not.toBeInTheDocument();
  });

  it('has correct aria-label for each level', () => {
    const { rerender } = render(<TrustBadge level="basic" />);
    expect(screen.getByLabelText('Asosiy usta')).toBeInTheDocument();

    rerender(<TrustBadge level="verified" />);
    expect(screen.getByLabelText('Tekshirilgan usta')).toBeInTheDocument();

    rerender(<TrustBadge level="pro" />);
    expect(screen.getByLabelText('Professional usta')).toBeInTheDocument();

    rerender(<TrustBadge level="premium" />);
    expect(screen.getByLabelText('Premium usta')).toBeInTheDocument();
  });

  it('sets data-level attribute', () => {
    render(<TrustBadge level="pro" />);
    expect(screen.getByLabelText('Professional usta')).toHaveAttribute('data-level', 'pro');
  });

  it('applies correct background class for trust-pro', () => {
    render(<TrustBadge level="pro" />);
    expect(screen.getByLabelText('Professional usta').className).toContain('bg-trust-pro-bg');
  });
});
