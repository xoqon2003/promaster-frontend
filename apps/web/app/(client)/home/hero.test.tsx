/**
 * T3.09 — Home Hero unit tests.
 *
 * Qamrov:
 *  - greeting: ism bor / yo'q (fallback "Salom!"), birinchi so'z olinadi
 *  - SearchBar mavjudligi va default placeholder
 *  - submit → router.push to'g'ri URL bilan (encodeURIComponent)
 *  - trust subtitle ko'rinadi
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Hero } from './hero';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockUseCurrentUser = vi.fn();
vi.mock('@/lib/hooks/use-current-user', () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

beforeEach(() => {
  mockPush.mockClear();
  mockUseCurrentUser.mockReset();
  window.localStorage.clear();
});

// ─── Greeting ────────────────────────────────────────────────────────────────

describe('Hero — greeting', () => {
  it('foydalanuvchi ismi bor — "Salom, Ism!" ko\'rsatiladi', () => {
    mockUseCurrentUser.mockReturnValue({ user: { name: 'Madiyor' } });

    render(<Hero />);

    expect(screen.getByRole('heading', { name: 'Salom, Madiyor!' })).toBeInTheDocument();
  });

  it('ism yo\'q (anonim) — fallback "Salom!"', () => {
    mockUseCurrentUser.mockReturnValue({ user: undefined });

    render(<Hero />);

    expect(screen.getByRole('heading', { name: 'Salom!' })).toBeInTheDocument();
  });

  it('user bor lekin ism bo\'sh string — fallback "Salom!"', () => {
    mockUseCurrentUser.mockReturnValue({ user: { name: '' } });

    render(<Hero />);

    expect(screen.getByRole('heading', { name: 'Salom!' })).toBeInTheDocument();
  });

  it("to'liq ism — faqat birinchi so'z ishlatiladi", () => {
    mockUseCurrentUser.mockReturnValue({ user: { name: 'Madiyor Aliqobilov' } });

    render(<Hero />);

    expect(screen.getByRole('heading', { name: 'Salom, Madiyor!' })).toBeInTheDocument();
  });
});

// ─── SearchBar integration ───────────────────────────────────────────────────

describe('Hero — SearchBar', () => {
  beforeEach(() => {
    mockUseCurrentUser.mockReturnValue({ user: undefined });
  });

  it('SearchBar render qilinadi (placeholder bilan)', () => {
    render(<Hero />);

    expect(screen.getByPlaceholderText('Sizga qanday usta kerak?')).toBeInTheDocument();
  });

  it('submit — router.push("/search?q=<query>") chaqiriladi', async () => {
    const user = userEvent.setup();
    render(<Hero />);

    await user.type(screen.getByRole('combobox'), 'elektrik');
    await user.keyboard('{Enter}');

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/search?q=elektrik');
  });

  it("query'da maxsus belgilar — encodeURIComponent qo'llaniladi", async () => {
    const user = userEvent.setup();
    render(<Hero />);

    await user.type(screen.getByRole('combobox'), 'remont & dizayn');
    await user.keyboard('{Enter}');

    expect(mockPush).toHaveBeenCalledWith('/search?q=remont%20%26%20dizayn');
  });
});

// ─── Trust subtitle ──────────────────────────────────────────────────────────

describe('Hero — trust subtitle', () => {
  it('"1000+ tekshirilgan usta" matni ko\'rinadi', () => {
    mockUseCurrentUser.mockReturnValue({ user: undefined });

    render(<Hero />);

    expect(screen.getByText(/1000\+ tekshirilgan usta/)).toBeInTheDocument();
  });
});
