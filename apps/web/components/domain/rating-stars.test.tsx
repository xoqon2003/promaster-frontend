import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RatingStars } from './rating-stars';

describe('RatingStars', () => {
  it('renders with correct aria-label for whole rating', () => {
    render(<RatingStars rating={4} />);
    expect(screen.getByRole('img', { name: /5 dan 4\.0 yulduz/i })).toBeInTheDocument();
  });

  it('renders with review count in aria-label', () => {
    render(<RatingStars rating={4.8} reviewCount={124} />);
    expect(screen.getByRole('img', { name: /124 ta baho/i })).toBeInTheDocument();
  });

  it('shows value when showValue=true', () => {
    render(<RatingStars rating={4.8} showValue />);
    expect(screen.getByText('4.8')).toBeInTheDocument();
  });

  it('clamps rating above 5', () => {
    render(<RatingStars rating={10} showValue />);
    expect(screen.getByText('5.0')).toBeInTheDocument();
  });

  it('clamps rating below 0', () => {
    render(<RatingStars rating={-1} showValue />);
    expect(screen.getByText('0.0')).toBeInTheDocument();
  });

  it('calls onRate when interactive star clicked', async () => {
    const user = userEvent.setup();
    const onRate = vi.fn();
    render(<RatingStars rating={3} interactive onRate={onRate} />);
    const buttons = screen.getAllByRole('button');
    const fifthStar = buttons[4];
    expect(fifthStar).toBeDefined();
    await user.click(fifthStar!);
    expect(onRate).toHaveBeenCalledWith(5);
  });

  it('calls onRate on Enter keydown', async () => {
    const user = userEvent.setup();
    const onRate = vi.fn();
    render(<RatingStars rating={0} interactive onRate={onRate} />);
    const firstStar = screen.getAllByRole('button')[0];
    expect(firstStar).toBeDefined();
    firstStar!.focus();
    await user.keyboard('{Enter}');
    expect(onRate).toHaveBeenCalledWith(1);
  });

  it('does not call onRate when not interactive', () => {
    const onRate = vi.fn();
    render(<RatingStars rating={3} onRate={onRate} />);
    // non-interactive => no button role
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
