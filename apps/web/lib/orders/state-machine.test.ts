/**
 * Order state machine — Vitest unit tests (S06 T6.02).
 *
 * 12+ test acceptance: valid forward transitions, invalid skips,
 * terminal lock, cancellation from any non-terminal, self-transition reject.
 */
import { describe, expect, it } from 'vitest';

import { canTransition, isTerminal, nextStatuses } from './state-machine';

describe('canTransition — happy path forward transitions', () => {
  it('pending → accepted ruxsat etiladi', () => {
    expect(canTransition('pending', 'accepted')).toBe(true);
  });

  it('accepted → en_route ruxsat etiladi', () => {
    expect(canTransition('accepted', 'en_route')).toBe(true);
  });

  it('en_route → arrived ruxsat etiladi', () => {
    expect(canTransition('en_route', 'arrived')).toBe(true);
  });

  it('arrived → in_progress ruxsat etiladi', () => {
    expect(canTransition('arrived', 'in_progress')).toBe(true);
  });

  it('in_progress → completed ruxsat etiladi', () => {
    expect(canTransition('in_progress', 'completed')).toBe(true);
  });
});

describe('canTransition — cancellation from non-terminal states', () => {
  it.each([['pending'], ['accepted'], ['en_route'], ['arrived'], ['in_progress']] as const)(
    '%s → cancelled ruxsat etiladi',
    (from) => {
      expect(canTransition(from, 'cancelled')).toBe(true);
    },
  );
});

describe('canTransition — invalid skips', () => {
  it('pending → en_route taqiqlanadi (accepted skip)', () => {
    expect(canTransition('pending', 'en_route')).toBe(false);
  });

  it('accepted → arrived taqiqlanadi (en_route skip)', () => {
    expect(canTransition('accepted', 'arrived')).toBe(false);
  });

  it('pending → completed taqiqlanadi (multi-step skip)', () => {
    expect(canTransition('pending', 'completed')).toBe(false);
  });

  it('en_route → completed taqiqlanadi (arrived + in_progress skip)', () => {
    expect(canTransition('en_route', 'completed')).toBe(false);
  });
});

describe('canTransition — backwards transitions taqiqlanadi', () => {
  it('en_route → accepted taqiqlanadi (orqaga qaytish)', () => {
    expect(canTransition('en_route', 'accepted')).toBe(false);
  });

  it('completed → in_progress taqiqlanadi', () => {
    expect(canTransition('completed', 'in_progress')).toBe(false);
  });
});

describe('canTransition — self-transition taqiqlanadi', () => {
  it.each([
    ['pending'],
    ['accepted'],
    ['en_route'],
    ['arrived'],
    ['in_progress'],
    ['completed'],
    ['cancelled'],
  ] as const)('%s → %s taqiqlanadi (duplicate history)', (status) => {
    expect(canTransition(status, status)).toBe(false);
  });
});

describe("canTransition — terminal holatlardan chiqish yo'q", () => {
  it('completed → cancelled taqiqlanadi (terminal)', () => {
    expect(canTransition('completed', 'cancelled')).toBe(false);
  });

  it('cancelled → pending taqiqlanadi (terminal)', () => {
    expect(canTransition('cancelled', 'pending')).toBe(false);
  });

  it('cancelled → accepted taqiqlanadi (terminal)', () => {
    expect(canTransition('cancelled', 'accepted')).toBe(false);
  });
});

describe('nextStatuses — UI helper', () => {
  it('pending dan 2 ta keyingi holat (accepted, cancelled)', () => {
    expect(nextStatuses('pending')).toEqual(['accepted', 'cancelled']);
  });

  it('in_progress dan 2 ta (completed, cancelled)', () => {
    expect(nextStatuses('in_progress')).toEqual(['completed', 'cancelled']);
  });

  it("completed dan keyingi yo'q (terminal)", () => {
    expect(nextStatuses('completed')).toEqual([]);
  });
});

describe('isTerminal', () => {
  it('completed terminal', () => {
    expect(isTerminal('completed')).toBe(true);
  });

  it('cancelled terminal', () => {
    expect(isTerminal('cancelled')).toBe(true);
  });

  it.each([['pending'], ['accepted'], ['en_route'], ['arrived'], ['in_progress']] as const)(
    '%s terminal emas',
    (status) => {
      expect(isTerminal(status)).toBe(false);
    },
  );
});
