import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MasterCard } from './master-card';
import type { MasterData } from './master-card';

const MOCK_MASTER: MasterData = {
  id: '1',
  name: 'Bobur Toshmatov',
  avatarUrl: undefined,
  rating: 4.8,
  reviewCount: 124,
  trustLevel: 'verified',
  categoryName: 'Santexnik',
  priceFrom: 50000,
  isOnline: true,
  responseTime: '~15 daqiqa',
};

describe('MasterCard', () => {
  it('renders master name', () => {
    render(<MasterCard master={MOCK_MASTER} />);
    expect(screen.getByTestId('master-name')).toHaveTextContent('Bobur Toshmatov');
  });

  it('renders category name', () => {
    render(<MasterCard master={MOCK_MASTER} />);
    expect(screen.getByText('Santexnik')).toBeInTheDocument();
  });

  it('renders trust badge with correct level', () => {
    render(<MasterCard master={MOCK_MASTER} />);
    expect(screen.getByLabelText('Tekshirilgan usta')).toBeInTheDocument();
  });

  it('renders price tag', () => {
    render(<MasterCard master={MOCK_MASTER} />);
    expect(screen.getByText('50 000')).toBeInTheDocument();
  });

  it('renders response time', () => {
    render(<MasterCard master={MOCK_MASTER} />);
    expect(screen.getByText('~15 daqiqa')).toBeInTheDocument();
  });

  it('renders online indicator when isOnline=true', () => {
    render(<MasterCard master={MOCK_MASTER} />);
    expect(screen.getByLabelText('Onlayn')).toBeInTheDocument();
  });

  it('does not render online indicator when isOnline=false', () => {
    render(<MasterCard master={{ ...MOCK_MASTER, isOnline: false }} />);
    expect(screen.queryByLabelText('Onlayn')).not.toBeInTheDocument();
  });

  it('renders contact button when onContactPress provided', () => {
    render(<MasterCard master={MOCK_MASTER} onContactPress={vi.fn()} />);
    expect(screen.getByRole('button', { name: /bog'lanish/i })).toBeInTheDocument();
  });

  it('does not render contact button when onContactPress omitted', () => {
    render(<MasterCard master={MOCK_MASTER} />);
    expect(screen.queryByRole('button', { name: /bog'lanish/i })).not.toBeInTheDocument();
  });

  it('calls onPress when card clicked', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<MasterCard master={MOCK_MASTER} onPress={onPress} />);
    await user.click(screen.getByRole('button', { name: /Bobur Toshmatov/i }));
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('calls onContactPress without triggering onPress', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    const onContactPress = vi.fn();
    render(<MasterCard master={MOCK_MASTER} onPress={onPress} onContactPress={onContactPress} />);
    await user.click(screen.getByRole('button', { name: /bog'lanish/i }));
    expect(onContactPress).toHaveBeenCalledOnce();
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders skeleton when isLoading=true', () => {
    render(<MasterCard master={MOCK_MASTER} isLoading />);
    expect(screen.getByLabelText('Yuklanmoqda')).toBeInTheDocument();
    expect(screen.queryByTestId('master-name')).not.toBeInTheDocument();
  });

  it('does not render avatar section in compact variant', () => {
    render(<MasterCard master={MOCK_MASTER} variant="compact" />);
    expect(screen.queryByLabelText('Onlayn')).not.toBeInTheDocument();
  });
});
