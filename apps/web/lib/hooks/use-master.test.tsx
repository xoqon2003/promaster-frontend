/**
 * T3.03 — useMaster hook tests.
 *
 * Qamrov:
 *  - Success with valid id
 *  - Null data for missing id
 *  - `enabled: false` when id=undefined (fetch bo'lmaydi)
 */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { createQueryClientWrapper } from '@/lib/testing/query-client-wrapper';
import { useMaster } from './use-master';

vi.mock('@/lib/masters/api-client', async () => {
  const actual = await vi.importActual<typeof import('@/lib/masters/api-client')>(
    '@/lib/masters/api-client',
  );
  return {
    ...actual,
    mastersApi: {
      ...actual.mockMastersApi,
      getById: vi.fn(actual.mockMastersApi.getById),
    },
  };
});

import { mastersApi } from '@/lib/masters/api-client';

describe('useMaster', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mavjud ID bilan ustani qaytaradi', async () => {
    const { result } = renderHook(() => useMaster('m_1'), {
      wrapper: createQueryClientWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.id).toBe('m_1');
    expect(mastersApi.getById).toHaveBeenCalledWith('m_1');
  });

  it("mavjud bo'lmagan ID uchun null", async () => {
    const { result } = renderHook(() => useMaster('m_9999'), {
      wrapper: createQueryClientWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeNull();
  });

  it('id=undefined — fetch yubormaydi (enabled=false)', () => {
    const { result } = renderHook(() => useMaster(undefined), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mastersApi.getById).not.toHaveBeenCalled();
  });

  it("id='' bo'sh string — fetch yubormaydi", () => {
    const { result } = renderHook(() => useMaster(''), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mastersApi.getById).not.toHaveBeenCalled();
  });
});
