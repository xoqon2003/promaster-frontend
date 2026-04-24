import { render, screen } from '@testing-library/react';
import { SearchX } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="Hech narsa topilmadi" />);
    expect(screen.getByText('Hech narsa topilmadi')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<EmptyState title="Test" description="Tavsif matni" />);
    expect(screen.getByText('Tavsif matni')).toBeInTheDocument();
  });

  it('does not render description when omitted', () => {
    render(<EmptyState title="Test" />);
    expect(screen.queryByText('Tavsif matni')).not.toBeInTheDocument();
  });

  it('renders action when provided', () => {
    render(<EmptyState title="Test" action={<button>Harakat</button>} />);
    expect(screen.getByRole('button', { name: 'Harakat' })).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(<EmptyState title="Test" icon={SearchX} />);
    // icon container aria-hidden, component has role="status"
    expect(screen.getByRole('status', { name: 'Test' })).toBeInTheDocument();
  });

  it('has correct aria-label', () => {
    render(<EmptyState title="Bo'sh ro'yxat" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', "Bo'sh ro'yxat");
  });

  it('has data-slot attribute', () => {
    render(<EmptyState title="Test" />);
    expect(screen.getByRole('status')).toHaveAttribute('data-slot', 'empty-state');
  });
});
