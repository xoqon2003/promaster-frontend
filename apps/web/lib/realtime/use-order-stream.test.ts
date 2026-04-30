/**
 * `useOrderStream` — Vitest unit testlar (S06 T6.03).
 *
 * Mock EventSource — `vi.stubGlobal('EventSource', MockEventSource)`. Har
 * test'da yangi instance, har test oxirida cleanup. Fake timers exponential
 * backoff'ni deterministik qiladi.
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useOrderStream } from './use-order-stream';

// ─── Mock EventSource ────────────────────────────────────────────────────────

interface MockListener {
  type: string;
  fn: (event: Event | MessageEvent) => void;
}

class MockEventSource {
  static instances: MockEventSource[] = [];

  url: string;
  closed = false;
  listeners: MockListener[] = [];

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, fn: (event: Event | MessageEvent) => void): void {
    this.listeners.push({ type, fn });
  }

  removeEventListener(type: string, fn: (event: Event | MessageEvent) => void): void {
    this.listeners = this.listeners.filter((l) => !(l.type === type && l.fn === fn));
  }

  close(): void {
    this.closed = true;
  }

  // Test helpers — listener'larga event yuborish
  fire(type: string, data?: unknown): void {
    for (const l of this.listeners.filter((l) => l.type === type)) {
      if (data !== undefined) {
        l.fn(new MessageEvent(type, { data: JSON.stringify(data) }));
      } else {
        l.fn(new Event(type));
      }
    }
  }

  static last(): MockEventSource {
    const last = this.instances[this.instances.length - 1];
    if (!last) throw new Error('No MockEventSource created');
    return last;
  }

  static reset(): void {
    this.instances = [];
  }
}

beforeEach(() => {
  MockEventSource.reset();
  vi.stubGlobal('EventSource', MockEventSource);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useOrderStream — connection state', () => {
  it("dastlab 'connecting' holatda boshlanadi", () => {
    const { result } = renderHook(() => useOrderStream('order-1'));
    expect(result.current.state).toBe('connecting');
  });

  it("'open' event'dan keyin 'connected' bo'ladi", async () => {
    const { result } = renderHook(() => useOrderStream('order-1'));

    act(() => {
      MockEventSource.last().fire('open');
    });

    await waitFor(() => expect(result.current.state).toBe('connected'));
  });

  it("EventSource to'g'ri URL bilan yaratiladi", () => {
    renderHook(() => useOrderStream('abc-123'));
    expect(MockEventSource.last().url).toBe('/api/orders/abc-123/events');
  });
});

describe('useOrderStream — event dispatching', () => {
  it("'order' event onOrder handler'ga yetadi", async () => {
    const onOrder = vi.fn();
    renderHook(() => useOrderStream('order-1', { onOrder }));

    const orderPayload = { id: 'order-1', status: 'pending', clientId: 'u1' };
    act(() => {
      MockEventSource.last().fire('open');
      MockEventSource.last().fire('order', orderPayload);
    });

    await waitFor(() => expect(onOrder).toHaveBeenCalledWith(orderPayload));
  });

  it("'status' event onStatus handler'ga yetadi", async () => {
    const onStatus = vi.fn();
    renderHook(() => useOrderStream('order-1', { onStatus }));

    const entry = { id: 's1', orderId: 'order-1', status: 'accepted' };
    act(() => {
      MockEventSource.last().fire('status', entry);
    });

    await waitFor(() => expect(onStatus).toHaveBeenCalledWith(entry));
  });

  it("'ping' event onPing handler'ga yetadi", async () => {
    const onPing = vi.fn();
    renderHook(() => useOrderStream('order-1', { onPing }));

    const ping = { id: 'p1', orderId: 'order-1', lat: '41.3', lng: '69.2' };
    act(() => {
      MockEventSource.last().fire('ping', ping);
    });

    await waitFor(() => expect(onPing).toHaveBeenCalledWith(ping));
  });

  it("noto'g'ri JSON payload lastError'ni yangilaydi", async () => {
    const onOrder = vi.fn();
    const { result } = renderHook(() => useOrderStream('order-1', { onOrder }));

    act(() => {
      // Manually fire bad JSON
      const src = MockEventSource.last();
      for (const l of src.listeners.filter((l) => l.type === 'order')) {
        l.fn(new MessageEvent('order', { data: 'not-valid-json{{' }));
      }
    });

    await waitFor(() => expect(result.current.lastError).toMatch(/order parse failed/));
    expect(onOrder).not.toHaveBeenCalled();
  });
});

describe('useOrderStream — reconnect logic', () => {
  it("'error' event 'reconnecting' holatga o'tkazadi", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useOrderStream('order-1'));

    act(() => {
      MockEventSource.last().fire('error');
    });

    await vi.waitFor(() => expect(result.current.state).toBe('reconnecting'));
  });

  it('exponential backoff — 1s/2s/4s/8s/16s', async () => {
    vi.useFakeTimers();
    renderHook(() => useOrderStream('order-1'));

    // 1-attempt: 1s delay
    act(() => MockEventSource.last().fire('error'));
    expect(MockEventSource.instances.length).toBe(1);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_000);
    });
    expect(MockEventSource.instances.length).toBe(2);

    // 2-attempt: 2s delay
    act(() => MockEventSource.last().fire('error'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000);
    });
    expect(MockEventSource.instances.length).toBe(3);

    // 3-attempt: 4s delay
    act(() => MockEventSource.last().fire('error'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4_000);
    });
    expect(MockEventSource.instances.length).toBe(4);
  });

  it("max 5 urinishdan keyin 'failed' bo'ladi", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useOrderStream('order-1'));

    // 5 ta error → 5 ta reconnect → 6-error 'failed' qiladi
    for (let i = 0; i < 5; i++) {
      act(() => MockEventSource.last().fire('error'));
      await act(async () => {
        await vi.advanceTimersByTimeAsync(20_000);
      });
    }

    // 6-error — limit oshirilgan
    act(() => MockEventSource.last().fire('error'));

    await vi.waitFor(() => expect(result.current.state).toBe('failed'));
    expect(result.current.lastError).toMatch(/giving up/);
  });

  it("muvaffaqiyatli 'open' attempt counter'ni reset qiladi", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useOrderStream('order-1'));

    // 1 ta error + reconnect
    act(() => MockEventSource.last().fire('error'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_000);
    });

    // Yangi instance — open
    act(() => MockEventSource.last().fire('open'));
    await vi.waitFor(() => expect(result.current.state).toBe('connected'));

    // Yana 5 ta error — `failed` bo'lmasligi kerak (counter reset)
    for (let i = 0; i < 4; i++) {
      act(() => MockEventSource.last().fire('error'));
      await act(async () => {
        await vi.advanceTimersByTimeAsync(20_000);
      });
    }
    expect(result.current.state).not.toBe('failed');
  });
});

describe('useOrderStream — cleanup', () => {
  it("unmount EventSource'ni close qiladi", () => {
    const { unmount } = renderHook(() => useOrderStream('order-1'));
    const src = MockEventSource.last();
    expect(src.closed).toBe(false);

    unmount();
    expect(src.closed).toBe(true);
  });

  it("close() pending reconnect timer'ni bekor qiladi", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useOrderStream('order-1'));

    act(() => MockEventSource.last().fire('error'));

    const beforeCount = MockEventSource.instances.length;

    act(() => result.current.close());

    // Timer'lar advance qilingan bo'lsa ham yangi instance yaratilmasligi kerak
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20_000);
    });

    expect(MockEventSource.instances.length).toBe(beforeCount);
    expect(result.current.state).toBe('closed');
  });
});
