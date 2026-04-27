/**
 * T3.03 — useRecommendedMasters hook tests.
 */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createQueryClientWrapper } from '@/lib/testing/query-client-wrapper';
import { useRecommendedMasters } from './use-recommended-masters';

describe('useRecommendedMasters', () => {
  it('default 8 ta tavsiya qaytaradi', async () => {
    const { result } = renderHook(() => useRecommendedMasters(), {
      wrapper: createQueryClientWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(8);
  });

  it('limit=5 bilan 5 ta qaytaradi', async () => {
    const { result } = renderHook(() => useRecommendedMasters({ limit: 5 }), {
      wrapper: createQueryClientWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(5);
  });

  it("rating bo'yicha descending", async () => {
    const { result } = renderHook(() => useRecommendedMasters({ limit: 8 }), {
      wrapper: createQueryClientWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const data = result.current.data!;
    for (let i = 1; i < data.length; i++) {
      expect(data[i - 1]!.rating).toBeGreaterThanOrEqual(data[i]!.rating);
    }
  });

  it("basic trust-level ustalar ro'yxatda bo'lmaydi", async () => {
    const { result } = renderHook(() => useRecommendedMasters({ limit: 50 }), {
      wrapper: createQueryClientWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    for (const m of result.current.data!) {
      expect(m.trustLevel).not.toBe('basic');
    }
  });
});
