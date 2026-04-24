import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Spinner } from './spinner';

describe('Spinner', () => {
  it('renders with default aria-label', () => {
    render(<Spinner />);
    expect(screen.getByRole('status', { name: 'Yuklanmoqda' })).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<Spinner label="Ma'lumot yuklanmoqda" />);
    expect(screen.getByRole('status', { name: "Ma'lumot yuklanmoqda" })).toBeInTheDocument();
  });

  it('applies correct size class for sm', () => {
    render(<Spinner size="sm" />);
    const el = screen.getByRole('status');
    expect(el.className).toContain('h-4');
    expect(el.className).toContain('w-4');
  });

  it('applies correct size class for xl', () => {
    render(<Spinner size="xl" />);
    const el = screen.getByRole('status');
    expect(el.className).toContain('h-12');
    expect(el.className).toContain('w-12');
  });

  it('applies white variant class', () => {
    render(<Spinner variant="white" />);
    const el = screen.getByRole('status');
    expect(el.className).toContain('border-t-white');
  });

  it('has animate-spin class', () => {
    render(<Spinner />);
    expect(screen.getByRole('status').className).toContain('animate-spin');
  });

  it('has data-slot attribute', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveAttribute('data-slot', 'spinner');
  });
});
