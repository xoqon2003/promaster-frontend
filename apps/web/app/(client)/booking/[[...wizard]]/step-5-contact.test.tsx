/**
 * T4.08 — `Step5Contact` unit tests.
 *
 * Qamrov:
 *  - Loading state (session loading)
 *  - Mehmon — auth gate ko'rinadi (login link)
 *  - Authenticated — form ko'rinadi
 *  - Profile auto-fill (ism + telefon)
 *  - Draft.contact — profile dan ustun
 *  - Phone formatlash + normalize
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Step5Contact, __test__ } from './step-5-contact';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({
  usePathname: () => '/booking',
  useSearchParams: () => new URLSearchParams('step=5'),
}));

const mockUseCurrentUser = vi.fn();
vi.mock('@/lib/hooks/use-current-user', () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

const mockSetDraft = vi.fn();
const mockUseBookingDraft = vi.fn();
vi.mock('@/lib/hooks/use-booking-draft', () => ({
  useBookingDraft: () => mockUseBookingDraft(),
}));

beforeEach(() => {
  mockUseCurrentUser.mockReset();
  mockSetDraft.mockReset();
  mockUseBookingDraft.mockReset();

  mockUseBookingDraft.mockReturnValue({
    draft: {},
    setDraft: mockSetDraft,
    resetDraft: vi.fn(),
    storageMode: 'empty',
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

// ─── Loading ─────────────────────────────────────────────────────────────────

describe('Step5Contact — loading', () => {
  it("session yuklanayotganda spinner ko'rinadi", () => {
    mockUseCurrentUser.mockReturnValue({
      user: undefined,
      isLoading: true,
      isAuthenticated: false,
      isClient: false,
      isPro: false,
      isAdmin: false,
    });

    render(<Step5Contact onComplete={vi.fn()} />);
    expect(screen.getByTestId('step-5-loading')).toBeInTheDocument();
  });
});

// ─── Auth gate (mehmon) ──────────────────────────────────────────────────────

describe('Step5Contact — auth gate', () => {
  beforeEach(() => {
    mockUseCurrentUser.mockReturnValue({
      user: undefined,
      isLoading: false,
      isAuthenticated: false,
      isClient: false,
      isPro: false,
      isAdmin: false,
    });
  });

  it("mehmon — auth gate ko'rinadi", () => {
    render(<Step5Contact onComplete={vi.fn()} />);
    expect(screen.getByTestId('step-5-auth-gate')).toBeInTheDocument();
    expect(screen.queryByTestId('step-5-contact-form')).not.toBeInTheDocument();
  });

  it('login link callbackUrl bilan', () => {
    render(<Step5Contact onComplete={vi.fn()} />);
    const link = screen.getByTestId('step-5-login-link') as HTMLAnchorElement;
    expect(link.href).toMatch(/\/login\?/);
    expect(link.href).toMatch(/callbackUrl=/);
  });
});

// ─── Authenticated form ──────────────────────────────────────────────────────

describe('Step5Contact — authenticated', () => {
  beforeEach(() => {
    mockUseCurrentUser.mockReturnValue({
      user: {
        id: 'u_42',
        phone: '+998901234567',
        name: 'Bobur Toshmatov',
        role: 'client',
      },
      isLoading: false,
      isAuthenticated: true,
      isClient: true,
      isPro: false,
      isAdmin: false,
    });
  });

  it("login qilingan mijoz — form ko'rinadi", () => {
    render(<Step5Contact onComplete={vi.fn()} />);
    expect(screen.getByTestId('step-5-contact-form')).toBeInTheDocument();
    expect(screen.queryByTestId('step-5-auth-gate')).not.toBeInTheDocument();
  });

  it('profile dan ism + telefon auto-filled', () => {
    render(<Step5Contact onComplete={vi.fn()} />);
    expect(screen.getByTestId('step-5-full-name')).toHaveValue('Bobur Toshmatov');
    expect(screen.getByTestId('step-5-phone')).toHaveValue('90 123 45 67');
  });

  it('draft.contact — profile dan ustun', () => {
    mockUseBookingDraft.mockReturnValue({
      draft: {
        contact: {
          fullName: 'Sherzod Karimov',
          phone: '+998935554433',
        },
      },
      setDraft: mockSetDraft,
      resetDraft: vi.fn(),
      storageMode: 'url',
    });

    render(<Step5Contact onComplete={vi.fn()} />);
    expect(screen.getByTestId('step-5-full-name')).toHaveValue('Sherzod Karimov');
    expect(screen.getByTestId('step-5-phone')).toHaveValue('93 555 44 33');
  });

  it("ism o'zgartirsa — input qiymati yangilanadi", async () => {
    const user = userEvent.setup();
    render(<Step5Contact onComplete={vi.fn()} />);

    const nameInput = screen.getByTestId('step-5-full-name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Aziz');

    expect(nameInput).toHaveValue('Aziz');
  });
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

describe('formatPhoneDisplay', () => {
  it("+998901234567 → '90 123 45 67'", () => {
    expect(__test__.formatPhoneDisplay('+998901234567')).toBe('90 123 45 67');
  });

  it("notavshil format — o'zgarishsiz", () => {
    expect(__test__.formatPhoneDisplay('+12345')).toBe('+12345');
  });
});

describe('normalizePhone', () => {
  it("'90 123 45 67' → '+998901234567'", () => {
    expect(__test__.normalizePhone('90 123 45 67')).toBe('+998901234567');
  });

  it("'+998 90 123 45 67' → '+998901234567'", () => {
    expect(__test__.normalizePhone('+998 90 123 45 67')).toBe('+998901234567');
  });

  it("'998901234567' (no +) → '+998901234567'", () => {
    expect(__test__.normalizePhone('998901234567')).toBe('+998901234567');
  });
});
