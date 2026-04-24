/**
 * T3.03 — useMasters hook tests.
 *
 * Qamrov:
 *  - Loading → Success data flow
 *  - Filter o'zgarganda yangi fetch (queryKey stability)
 *  - Error holati (reject qilingan adapter)
 */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { createQueryClientWrapper } from '@/lib/testing/query-client-wrapper';
import { useMasters } from './use-masters';

vi.mock('@/lib/masters/api-client', async () => {
  const actual = await vi.importActual<typeof import('@/lib/masters/api-client')>(
    '@/lib/masters/api-client',
  );
  return {
    ...actual,
    mastersApi: {
      ...actual.mockMastersApi,
      search: vi.fn(actual.mockMastersApi.search),
    },
  };
});

import { mastersApi } from '@/lib/masters/api-client';

describe('useMasters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("boshlang'ichda isLoading=true, keyin success data keladi", async () => {
    const { result } = renderHook(() => useMasters({}), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.masters.length).toBeGreaterThan(0);
    expect(result.current.data?.page).toBe(1);
  });

  it('filter uzatilganda adapter search o`sha filter bilan chaqirildi', async () => {
    const filter = { categoryId: 'elektrik', rating: 4.5 };
    const { result } = renderHook(() => useMasters(filter), {
      wrapper: createQueryClientWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mastersApi.search).toHaveBeenCalledWith(filter);
  });

  it('adapter xato qaytarsa — isError=true', async () => {
    vi.mocked(mastersApi.search).mockRejectedValueOnce(new Error('Server xato'));

    const { result } = renderHook(() => useMasters({}), {
      wrapper: createQueryClientWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
