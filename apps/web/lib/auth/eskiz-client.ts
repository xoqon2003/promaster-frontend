/**
 * Eskiz.uz REST API HTTP client (S05 T5.03).
 *
 * Eskiz docs: https://documenter.getpostman.com/view/663428/RzfmES4z
 *
 * S05 fazasida **aktivatsiya defer** (Q1 javob): kod tayyor, lekin
 * production tier yoqilmaydi. `OTP_PROVIDER=eskiz` env switcher orqali
 * kelajakda yoqiladi (`docs/runbooks/eskiz-activation.md`).
 *
 * Auth flow:
 *   1. POST /api/auth/login   { email, password }      → token (~1 oy TTL)
 *   2. POST /api/message/sms/send  { mobile_phone, message, from }  (Bearer)
 *
 * Token lifetime: ~30 kun. In-memory cache (har request'da yangi token
 * olish kerakmas). Production'da edge env'da modul-level cache OK
 * (har container instance o'z token'iga ega).
 *
 * R02 mitigation: timeout 5s, 1x retry, Sentry capture (T5.09).
 * R11 mitigation: delivery rate Eskiz dashboard'da kuzatiladi.
 */

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_BASE_URL = 'https://notify.eskiz.uz/api';
const REQUEST_TIMEOUT_MS = 5_000;
const RETRY_LIMIT = 1;

// ─── Types ───────────────────────────────────────────────────────────────────

interface EskizConfig {
  baseUrl?: string;
  email: string;
  password: string;
  /** Approval'gacha "4546" default test sender; approved bo'lganda "Promaster". */
  sender: string;
}

interface LoginResponse {
  message: string;
  data: { token: string };
}

interface SendSmsResponse {
  /** Eskiz `id` field — message tracking uchun. */
  id?: number;
  message?: string;
  status?: string;
}

export class EskizError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'EskizError';
  }
}

// ─── Client ──────────────────────────────────────────────────────────────────

export class EskizClient {
  private token: string | null = null;
  private readonly baseUrl: string;

  constructor(private readonly config: EskizConfig) {
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
  }

  /**
   * SMS yuborish. Birinchi marta token yoki token expired bo'lsa,
   * avval `loginToken()` chaqiriladi.
   *
   * @param phone E.164 format `+998901234567`
   * @param message OTP matni — `Tasdiqlash kodi: 123456` kabi
   */
  async sendSms(phone: string, message: string): Promise<SendSmsResponse> {
    if (!this.token) await this.loginToken();

    return this.fetchWithRetry<SendSmsResponse>('/message/sms/send', {
      method: 'POST',
      body: new URLSearchParams({
        mobile_phone: phone.replace('+', ''),
        message,
        from: this.config.sender,
      }),
    });
  }

  /**
   * Login → Bearer token. Cache instance level — birinchi sendSms da
   * chaqiriladi.
   *
   * @internal
   */
  async loginToken(): Promise<string> {
    const data = await this.fetchWithRetry<LoginResponse>('/auth/login', {
      method: 'POST',
      body: new URLSearchParams({
        email: this.config.email,
        password: this.config.password,
      }),
      skipAuth: true,
    });

    this.token = data.data.token;
    return this.token;
  }

  /**
   * Eskiz API'ga so'rov — timeout, retry, Bearer token bilan.
   */
  private async fetchWithRetry<T>(
    path: string,
    init: RequestInit & { skipAuth?: boolean },
    attempt = 0,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = new Headers(init.headers);
    if (!init.skipAuth && this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }
    headers.set('Accept', 'application/json');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(url, { ...init, headers, signal: controller.signal });

      if (res.status === 401 && !init.skipAuth && attempt === 0) {
        // Token expired — qayta login va so'rovni takrorlash
        this.token = null;
        await this.loginToken();
        return this.fetchWithRetry<T>(path, init, attempt + 1);
      }

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new EskizError(`Eskiz API ${res.status}: ${text || res.statusText}`);
      }

      return (await res.json()) as T;
    } catch (err) {
      const isAbort = err instanceof Error && err.name === 'AbortError';
      if (isAbort && attempt < RETRY_LIMIT) {
        // Timeout — bir marta qayta urinish
        return this.fetchWithRetry<T>(path, init, attempt + 1);
      }
      if (err instanceof EskizError) throw err;
      throw new EskizError(isAbort ? 'Eskiz API timeout (5s)' : 'Eskiz API network error', err);
    } finally {
      clearTimeout(timer);
    }
  }

  /** @internal — testlarda token'ni reset qilish uchun */
  __resetToken(): void {
    this.token = null;
  }
}

// ─── Factory (env'dan client yaratadi) ───────────────────────────────────────

let cachedClient: EskizClient | null = null;

/**
 * Singleton Eskiz client — env'lardan config oladi.
 *
 * `ESKIZ_EMAIL`, `ESKIZ_PASSWORD`, `ESKIZ_SENDER` (defaultga "4546" agar
 * yo'q bo'lsa) — `.env.local` yoki Vercel env'dan.
 */
export function getEskizClient(): EskizClient {
  if (cachedClient) return cachedClient;

  const email = process.env.ESKIZ_EMAIL;
  const password = process.env.ESKIZ_PASSWORD;
  if (!email || !password) {
    throw new EskizError(
      'ESKIZ_EMAIL or ESKIZ_PASSWORD env not set. Adapter aktivatsiya: ' +
        'docs/runbooks/eskiz-activation.md',
    );
  }

  cachedClient = new EskizClient({
    baseUrl: process.env.ESKIZ_API_BASE,
    email,
    password,
    // Empty string ham "not set" deb hisoblanadi → default fallback
    sender: process.env.ESKIZ_SENDER || '4546',
  });
  return cachedClient;
}

/** @internal — testlarda client'ni reset qilish uchun */
export function __resetEskizClient(): void {
  cachedClient = null;
}
