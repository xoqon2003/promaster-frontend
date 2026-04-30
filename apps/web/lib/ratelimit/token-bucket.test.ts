/**
 * TokenBucket — Vitest unit tests (S06 T6.05).
 */
import { describe, expect, it } from 'vitest';

import { TokenBucket } from './token-bucket';

describe('TokenBucket', () => {
  it("birinchi consume sig'im ichida allowed=true qaytaradi", () => {
    const limiter = new TokenBucket({ capacity: 1, intervalMs: 30_000 });
    const result = limiter.consume('user-1', 1_000);
    expect(result.allowed).toBe(true);
    expect(result.retryAfterMs).toBe(0);
  });

  it("sig'im tugagach allowed=false va retryAfterMs > 0", () => {
    const limiter = new TokenBucket({ capacity: 1, intervalMs: 30_000 });

    // 1-token iste'mol qilingan
    expect(limiter.consume('user-1', 1_000).allowed).toBe(true);

    // 2-urinish — token yo'q
    const blocked = limiter.consume('user-1', 1_500);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
    expect(blocked.retryAfterMs).toBeLessThanOrEqual(30_000);
  });

  it("intervalMs o'tgach token qayta to'ldiriladi", () => {
    const limiter = new TokenBucket({ capacity: 1, intervalMs: 30_000 });

    expect(limiter.consume('user-1', 1_000).allowed).toBe(true);
    expect(limiter.consume('user-1', 1_500).allowed).toBe(false);

    // 30s o'tdi — yangi token mavjud
    expect(limiter.consume('user-1', 31_001).allowed).toBe(true);
  });

  it('har key uchun alohida bucket', () => {
    const limiter = new TokenBucket({ capacity: 1, intervalMs: 30_000 });

    expect(limiter.consume('user-1', 1_000).allowed).toBe(true);
    // user-2 alohida — o'z token'i bor
    expect(limiter.consume('user-2', 1_000).allowed).toBe(true);
    // user-1 hali blocked
    expect(limiter.consume('user-1', 2_000).allowed).toBe(false);
  });

  it('capacity > 1 — burst ruxsat etiladi', () => {
    const limiter = new TokenBucket({ capacity: 3, intervalMs: 60_000 });

    expect(limiter.consume('user-1', 1_000).allowed).toBe(true);
    expect(limiter.consume('user-1', 1_001).allowed).toBe(true);
    expect(limiter.consume('user-1', 1_002).allowed).toBe(true);
    // 4-urinish — token yo'q
    expect(limiter.consume('user-1', 1_003).allowed).toBe(false);
  });

  it("reset() bucket'ni tozalaydi", () => {
    const limiter = new TokenBucket({ capacity: 1, intervalMs: 30_000 });

    expect(limiter.consume('user-1', 1_000).allowed).toBe(true);
    expect(limiter.consume('user-1', 1_500).allowed).toBe(false);

    limiter.reset('user-1');
    expect(limiter.consume('user-1', 1_500).allowed).toBe(true);
  });

  it('reset() (kalitsiz) — barcha bucketlarni tozalaydi', () => {
    const limiter = new TokenBucket({ capacity: 1, intervalMs: 30_000 });

    limiter.consume('user-1', 1_000);
    limiter.consume('user-2', 1_000);

    limiter.reset();
    expect(limiter.consume('user-1', 1_500).allowed).toBe(true);
    expect(limiter.consume('user-2', 1_500).allowed).toBe(true);
  });

  it("retryAfterMs intervalMs'dan oshmaydi", () => {
    const limiter = new TokenBucket({ capacity: 1, intervalMs: 30_000 });

    limiter.consume('user-1', 1_000);
    const result = limiter.consume('user-1', 1_001);
    expect(result.retryAfterMs).toBeLessThanOrEqual(30_000);
  });
});
