/**
 * T4.03 — `useWizardStep` hook tests.
 *
 * Qamrov:
 *  - Default step = 1
 *  - URL'dan step parse
 *  - goNext / goBack — step ortib/kamayadi
 *  - goBack birinchi stepda — router.push('/search')
 *  - goNext oxirgi stepda — no-op
 *  - goToStep — aniq step
 *  - clamp — < 1 yoki > 6 qiymatlar
 */
import { act, renderHook } from '@testing-library/react';
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useWizardStep } from './use-wizard-step';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), refresh: vi.fn() }),
}));

beforeEach(() => {
  mockPush.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

// ─── Default ─────────────────────────────────────────────────────────────────

describe('useWizardStep — initial', () => {
  it("bo'sh URL — step=1, isFirstStep=true", () => {
    const { result } = renderHook(() => useWizardStep(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '' }),
    });

    expect(result.current.step).toBe(1);
    expect(result.current.isFirstStep).toBe(true);
    expect(result.current.isLastStep).toBe(false);
  });

  it('step=3 URL — current=3', () => {
    const { result } = renderHook(() => useWizardStep(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '?step=3' }),
    });
    expect(result.current.step).toBe(3);
    expect(result.current.isFirstStep).toBe(false);
    expect(result.current.isLastStep).toBe(false);
  });

  it('step=6 — isLastStep=true', () => {
    const { result } = renderHook(() => useWizardStep(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '?step=6' }),
    });
    expect(result.current.step).toBe(6);
    expect(result.current.isLastStep).toBe(true);
  });

  it('step=99 — clamp to 6', () => {
    const { result } = renderHook(() => useWizardStep(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '?step=99' }),
    });
    expect(result.current.step).toBe(6);
  });

  it('step=-5 — clamp to 1', () => {
    const { result } = renderHook(() => useWizardStep(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '?step=-5' }),
    });
    expect(result.current.step).toBe(1);
  });
});

// ─── goNext / goBack ─────────────────────────────────────────────────────────

describe('useWizardStep.goNext', () => {
  it('step=2 → goNext → URL ?step=3', async () => {
    const onUrlUpdate = vi.fn();
    const { result } = renderHook(() => useWizardStep(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '?step=2', onUrlUpdate }),
    });

    await act(async () => {
      await result.current.goNext();
    });

    const event = onUrlUpdate.mock.lastCall![0];
    expect(event.searchParams.get('step')).toBe('3');
  });

  it('step=6 → goNext — no-op (oxirgi step)', async () => {
    const onUrlUpdate = vi.fn();
    const { result } = renderHook(() => useWizardStep(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '?step=6', onUrlUpdate }),
    });

    await act(async () => {
      await result.current.goNext();
    });

    expect(onUrlUpdate).not.toHaveBeenCalled();
  });
});

describe('useWizardStep.goBack', () => {
  it('step=3 → goBack → URL ?step=2', async () => {
    const onUrlUpdate = vi.fn();
    const { result } = renderHook(() => useWizardStep(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '?step=3', onUrlUpdate }),
    });

    await act(async () => {
      await result.current.goBack();
    });

    const event = onUrlUpdate.mock.lastCall![0];
    expect(event.searchParams.get('step')).toBe('2');
  });

  it("step=1 → goBack → router.push('/search')", async () => {
    const { result } = renderHook(() => useWizardStep(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '' }),
    });

    await act(async () => {
      await result.current.goBack();
    });

    expect(mockPush).toHaveBeenCalledWith('/search');
  });
});

// ─── goToStep ────────────────────────────────────────────────────────────────

describe('useWizardStep.goToStep', () => {
  it('aniq step ga o`tadi', async () => {
    const onUrlUpdate = vi.fn();
    const { result } = renderHook(() => useWizardStep(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '?step=2', onUrlUpdate }),
    });

    await act(async () => {
      await result.current.goToStep(5);
    });

    const event = onUrlUpdate.mock.lastCall![0];
    expect(event.searchParams.get('step')).toBe('5');
  });
});
