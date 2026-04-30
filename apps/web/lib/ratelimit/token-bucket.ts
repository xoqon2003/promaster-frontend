/**
 * In-memory token bucket rate limiter (S06 T6.05).
 *
 * **Cheklov:** Vercel Edge Runtime'da har region'da alohida instance
 * bo'lishi mumkin — bu cheklagich **per-instance**. Production'da
 * 1 ta region (eu-central-1) ishlatilsa, 1 instance = global. Multi-region
 * yoki autoscale paytida soft cap (haqiqiy 2-3x bo'lishi mumkin).
 *
 * To'liq distributed rate limiter (Upstash Ratelimit) S08+ ga qoldirilgan
 * — S06 da bu MVP yetarli (R08 cost spike mitigation, aniq 1-req-per-N
 * emas, abuse-protection uchun).
 *
 * Token bucket — har key (`pro_id`, `phone`, h.k.) uchun N ta token,
 * har `intervalMs`'da N ta yangidan to'ldiriladi. `consume()` 1 token
 * oladi va `{ allowed, retryAfterMs }` qaytaradi.
 *
 * @example
 *   const limiter = new TokenBucket({ capacity: 1, intervalMs: 30_000 });
 *   const result = limiter.consume(`tracking:${proId}`);
 *   if (!result.allowed) {
 *     return new Response('Too Many Requests', {
 *       status: 429,
 *       headers: { 'Retry-After': String(Math.ceil(result.retryAfterMs / 1000)) },
 *     });
 *   }
 */

interface BucketEntry {
  /** Mavjud token soni. */
  tokens: number;
  /** So'nggi to'liq to'ldirish vaqti (ms). */
  lastRefill: number;
}

export interface TokenBucketOptions {
  /** Bucket sig'imi (max token). */
  capacity: number;
  /** Har shu vaqtda `capacity` ta token to'ldiriladi (ms). */
  intervalMs: number;
}

export interface ConsumeResult {
  allowed: boolean;
  /** Qancha vaqtdan keyin keyingi token bo'shaydi (allowed=false bo'lsa). */
  retryAfterMs: number;
}

export class TokenBucket {
  private readonly capacity: number;
  private readonly intervalMs: number;
  private readonly buckets = new Map<string, BucketEntry>();

  constructor({ capacity, intervalMs }: TokenBucketOptions) {
    this.capacity = capacity;
    this.intervalMs = intervalMs;
  }

  consume(key: string, now = Date.now()): ConsumeResult {
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = { tokens: this.capacity, lastRefill: now };
      this.buckets.set(key, bucket);
    }

    // Refill — `intervalMs` o'tgan to'liq tsikllar uchun token qo'shish.
    const elapsed = now - bucket.lastRefill;
    if (elapsed >= this.intervalMs) {
      const cycles = Math.floor(elapsed / this.intervalMs);
      bucket.tokens = Math.min(this.capacity, bucket.tokens + cycles * this.capacity);
      bucket.lastRefill = bucket.lastRefill + cycles * this.intervalMs;
    }

    if (bucket.tokens > 0) {
      bucket.tokens -= 1;
      return { allowed: true, retryAfterMs: 0 };
    }

    const retryAfterMs = this.intervalMs - (now - bucket.lastRefill);
    return { allowed: false, retryAfterMs };
  }

  /** Test'lar uchun — bucket'ni tozalash. */
  reset(key?: string): void {
    if (key === undefined) {
      this.buckets.clear();
    } else {
      this.buckets.delete(key);
    }
  }
}
