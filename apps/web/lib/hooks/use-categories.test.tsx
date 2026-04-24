/**
 * T3.03 — useCategories hook tests.
 */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MOCK_CATEGORIES } from '@/lib/masters/mock-data';
import { createQueryClientWrapper } from '@/lib/testing/query-client-wrapper';
import { useCategories } from './use-categories';

describe('useCategories', () => {
  it('10 ta kategoriyani qaytaradi', async () => {
    const { result } = renderHook(() => useCategories(), {
      wrapper: createQueryClientWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(10);
    expect(result.current.data).toEqual(MOCK_CATEGORIES);
  });
});
