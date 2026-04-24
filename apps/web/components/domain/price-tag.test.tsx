import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PriceTag } from './price-tag';

describe('PriceTag', () => {
  it('formats amount with space separator', () => {
    render(<PriceTag amount={50000} />);
    expect(screen.getByText('50 000')).toBeInTheDocument();
  });

  it('formats large amount correctly', () => {
    render(<PriceTag amount={1000000} />);
    expect(screen.getByText('1 000 000')).toBeInTheDocument();
  });

  it('shows unit when provided', () => {
    render(<PriceTag amount={50000} unit="soat" />);
    expect(screen.getByText(/so'm\/soat/)).toBeInTheDocument();
  });

  it('shows "dan" prefix when prefix=true', () => {
    render(<PriceTag amount={50000} prefix />);
    expect(screen.getByText('dan')).toBeInTheDocument();
  });

  it('does not show "dan" when prefix=false', () => {
    render(<PriceTag amount={50000} />);
    expect(screen.queryByText('dan')).not.toBeInTheDocument();
  });

  it('renders skeleton when isLoading=true', () => {
    render(<PriceTag amount={50000} isLoading />);
    // Skeleton renders without the price text
    expect(screen.queryByText('50 000')).not.toBeInTheDocument();
  });

  it('has data-slot attribute when not loading', () => {
    const { container } = render(<PriceTag amount={50000} />);
    expect(container.querySelector('[data-slot="price-tag"]')).toBeInTheDocument();
  });
});
