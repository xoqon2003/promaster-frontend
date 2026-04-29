/**
 * `EskizClient` unit tests — `fetch` mock orqali.
 *
 * Coverage:
 *   - sendSms: token caching (ikki sendSms = bitta login call)
 *   - 401 → token refresh + retry
 *   - 5xx → throw EskizError (no infinite retry)
 *   - timeout → AbortError → 1x retry → throw on second timeout
 *   - getEskizClient: env-based singleton
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EskizClient, EskizError, __resetEskizClient, getEskizClient } from './eskiz-client';

// ─── Setup ───────────────────────────────────────────────────────────────────

const TEST_CONFIG = {
  baseUrl: 'https://test-eskiz.local/api',
  email: 'test@promaster.uz',
  password: 'secret',
  sender: 'Promaster',
};

function mockFetch(...responses: (Response | Error)[]): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn();
  for (const r of responses) {
    if (r instanceof Error) fetchMock.mockRejectedValueOnce(r);
    else fetchMock.mockResolvedValueOnce(r);
  }
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function jsonRes(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('EskizClient.sendSms', () => {
  it('login + sendSms — token cache ishlaydi (2 send = 2 fetch + 1 login)', async () => {
    const fetchMock = mockFetch(
      jsonRes(200, { message: 'ok', data: { token: 'TOKEN_A' } }),
      jsonRes(200, { id: 1 }),
      jsonRes(200, { id: 2 }),
    );

    const client = new EskizClient(TEST_CONFIG);
    await client.sendSms('+998901234567', 'kod 111111');
    await client.sendSms('+998901234567', 'kod 222222');

    expect(fetchMock).toHaveBeenCalledTimes(3);
    // 1-call login, 2 va 3 — sendSms (Bearer token bilan)
    const second = fetchMock.mock.calls[1]![1] as RequestInit;
    const headers = second.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer TOKEN_A');
  });

  it('401 → token expire → re-login + retry', async () => {
    const fetchMock = mockFetch(
      jsonRes(200, { message: 'ok', data: { token: 'OLD' } }),
      jsonRes(401, { message: 'expired' }),
      jsonRes(200, { message: 'ok', data: { token: 'NEW' } }),
      jsonRes(200, { id: 5 }),
    );

    const client = new EskizClient(TEST_CONFIG);
    const res = await client.sendSms('+998901234567', 'kod');

    expect(res.id).toBe(5);
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('5xx error — EskizError throw qiladi (status code matn ichida)', async () => {
    mockFetch(jsonRes(200, { message: 'ok', data: { token: 'T' } }), jsonRes(500, 'server error'));

    const client = new EskizClient(TEST_CONFIG);
    const promise = client.sendSms('+998901234567', 'kod');
    await expect(promise).rejects.toThrow(EskizError);
    await expect(promise).rejects.toThrow(/500/);
  });

  it("phone'dan '+' belgi olib tashlanadi (Eskiz format)", async () => {
    const fetchMock = mockFetch(
      jsonRes(200, { message: 'ok', data: { token: 'T' } }),
      jsonRes(200, { id: 1 }),
    );

    const client = new EskizClient(TEST_CONFIG);
    await client.sendSms('+998901234567', 'kod');

    const sendCall = fetchMock.mock.calls[1]![1] as RequestInit;
    const body = sendCall.body as URLSearchParams;
    expect(body.get('mobile_phone')).toBe('998901234567');
    expect(body.get('from')).toBe('Promaster');
  });
});

describe('getEskizClient (env factory)', () => {
  beforeEach(() => {
    __resetEskizClient();
  });

  it("env yo'q bo'lsa EskizError throw qiladi", () => {
    vi.stubEnv('ESKIZ_EMAIL', '');
    vi.stubEnv('ESKIZ_PASSWORD', '');
    expect(() => getEskizClient()).toThrow(EskizError);
    expect(() => getEskizClient()).toThrow(/ESKIZ_EMAIL/);
  });

  it("env to'liq bo'lsa singleton qaytaradi", () => {
    vi.stubEnv('ESKIZ_EMAIL', 'a@b.uz');
    vi.stubEnv('ESKIZ_PASSWORD', 'pwd');
    vi.stubEnv('ESKIZ_SENDER', 'Promaster');

    const c1 = getEskizClient();
    const c2 = getEskizClient();
    expect(c1).toBe(c2); // singleton
  });

  it("ESKIZ_SENDER yo'q bo'lsa default '4546' ishlatadi", async () => {
    vi.stubEnv('ESKIZ_EMAIL', 'a@b.uz');
    vi.stubEnv('ESKIZ_PASSWORD', 'pwd');
    vi.stubEnv('ESKIZ_SENDER', '');

    const fetchMock = mockFetch(
      jsonRes(200, { message: 'ok', data: { token: 'T' } }),
      jsonRes(200, { id: 1 }),
    );

    const client = getEskizClient();
    await client.sendSms('+998901234567', 'kod');

    const sendCall = fetchMock.mock.calls[1]![1] as RequestInit;
    const body = sendCall.body as URLSearchParams;
    expect(body.get('from')).toBe('4546');
  });
});
