import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useCurrentUser } from './use-current-user';

// next-auth/react ni mock qilamiz
const mockUseSession = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}));

describe('useCurrentUser', () => {
  it("loading state'da bo'lsa isLoading=true", () => {
    mockUseSession.mockReturnValue({ data: null, status: 'loading' });
    const { result } = renderHook(() => useCurrentUser());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeUndefined();
  });

  it("unauthenticated bo'lsa flaglar false", () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    const { result } = renderHook(() => useCurrentUser());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isClient).toBe(false);
    expect(result.current.isPro).toBe(false);
    expect(result.current.isAdmin).toBe(false);
  });

  it('client user uchun isClient=true', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'usr_1',
          phone: '+998901234567',
          role: 'client',
        },
      },
      status: 'authenticated',
    });
    const { result } = renderHook(() => useCurrentUser());
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isClient).toBe(true);
    expect(result.current.isPro).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.user?.phone).toBe('+998901234567');
  });

  it('pro user uchun isPro=true', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'usr_2',
          phone: '+998901234567',
          role: 'pro',
        },
      },
      status: 'authenticated',
    });
    const { result } = renderHook(() => useCurrentUser());
    expect(result.current.isPro).toBe(true);
    expect(result.current.isClient).toBe(false);
  });

  it('admin user uchun isAdmin=true', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'usr_3',
          phone: '+998901234567',
          role: 'admin',
        },
      },
      status: 'authenticated',
    });
    const { result } = renderHook(() => useCurrentUser());
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isClient).toBe(false);
    expect(result.current.isPro).toBe(false);
  });
});
