/**
 * `eskizAdapter` integration tests — real Neon DB + mocked Eskiz HTTP.
 *
 * Task: T5.08 (S05 Backend Foundation)
 *
 * Bu testlar `DATABASE_URL` env bilan ishlaydi va Drizzle queries
 * orqali real Neon DB'ga yozadi/o'qiydi. Eskiz HTTP API call'lari
 * `fetch` global mock'i bilan blok qilinadi.
 *
 * **R03 (schema drift) mitigation** — agar DB schema kod bilan mos
 * kelmasa (column rename, type mismatch), bu testlar darhol ushlaydi.
 *
 * **R03 + R08** — eskiz-adapter ↔ Drizzle ↔ Postgres kompozitsiyasi
 * to'liq sinab ko'riladi (unit testlar har layer'ni alohida tekshiradi).
 *
 * Skip strategy: agar `DATABASE_URL` env yo'q bo'lsa, test'lar skip
 * qilinadi (CI'da ham, lokal'da ham). Vitest --env-file=.env.local
 * orqali ishga tushiriladi.
 *
 * Test pool: `+998900000XXX` raqamlar — har test'dan keyin DB'dan
 * tozalanadi (orphan row qoldirmaydi).
 */
import { eq, inArray } from 'drizzle-orm';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/lib/db';
import { otpCodes, users } from '@/lib/db/schema';

import { eskizAdapter } from './eskiz-adapter';

// ─── Skip if no DB ───────────────────────────────────────────────────────────

const HAS_DB = Boolean(process.env.DATABASE_URL);
const describeIfDb = HAS_DB ? describe : describe.skip;

// Neon free tier compute 5 daqiqa idle'dan keyin suspend bo'ladi —
// birinchi DB so'rovi ~5-10s cold-start. Hook + test timeout oshirildi.
const NEON_COLD_START_TIMEOUT_MS = 30_000;

// ─── Test pool ───────────────────────────────────────────────────────────────

const TEST_PHONE_POOL = [
  '+998900000001',
  '+998900000002',
  '+998900000003',
  '+998900000004',
  '+998900000005',
];

async function cleanupTestData(): Promise<void> {
  await db.delete(otpCodes).where(inArray(otpCodes.phone, TEST_PHONE_POOL));
  await db.delete(users).where(inArray(users.phone, TEST_PHONE_POOL));
}

// ─── Mock fetch (faqat Eskiz HTTP — Neon DB fetch passthrough) ───────────────

beforeAll(() => {
  // Asl fetch'ni saqlaymiz — Neon Postgres driver shu fetch'dan foydalanadi
  const realFetch = globalThis.fetch.bind(globalThis);

  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

      // Neon (yoki boshqa DB) URL'lari → real fetch
      if (!url.includes('eskiz.uz')) {
        return realFetch(input, init);
      }

      // Eskiz API mock'i
      const body = init?.body;
      if (body instanceof URLSearchParams && body.has('email')) {
        return new Response(JSON.stringify({ message: 'ok', data: { token: 'TEST_TOKEN' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ id: 1 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }),
  );

  // Eskiz client uchun fake env (haqiqiy network call'siz)
  vi.stubEnv('ESKIZ_EMAIL', 'integration@test.local');
  vi.stubEnv('ESKIZ_PASSWORD', 'test-password');
  vi.stubEnv('ESKIZ_SENDER', 'Promaster');
});

afterAll(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

beforeEach(async () => {
  if (!HAS_DB) return;
  await cleanupTestData();
}, NEON_COLD_START_TIMEOUT_MS);

afterEach(async () => {
  if (!HAS_DB) return;
  await cleanupTestData();
}, NEON_COLD_START_TIMEOUT_MS);

// ─── Tests ───────────────────────────────────────────────────────────────────

describeIfDb('eskizAdapter — DB integration', () => {
  describe('sendOtp', () => {
    it("yangi OTP DB'ga yoziladi (otp_codes row mavjud)", async () => {
      const phone = TEST_PHONE_POOL[0]!;

      const { expiresAt } = await eskizAdapter.sendOtp(phone);

      expect(expiresAt).toBeGreaterThan(Date.now());

      const [row] = await db.select().from(otpCodes).where(eq(otpCodes.phone, phone));
      expect(row).toBeDefined();
      expect(row?.codeHash).toMatch(/^\$2[aby]\$/); // bcrypt hash format
      expect(row?.attempts).toBe(0);
      expect(row?.usedAt).toBeNull();
    });

    it('expiresAt taxminan 2 daqiqa keyin (OTP_TTL_MS)', async () => {
      const phone = TEST_PHONE_POOL[1]!;

      const before = Date.now();
      const { expiresAt } = await eskizAdapter.sendOtp(phone);

      const delta = expiresAt - before;
      expect(delta).toBeGreaterThanOrEqual(119_000); // ~2 daqiqa
      expect(delta).toBeLessThanOrEqual(121_000);
    });

    it('ikki marta sendOtp — ikkala OTP ham DB`da (eski o`chirilmaydi)', async () => {
      const phone = TEST_PHONE_POOL[2]!;

      await eskizAdapter.sendOtp(phone);
      await eskizAdapter.sendOtp(phone);

      const rows = await db.select().from(otpCodes).where(eq(otpCodes.phone, phone));
      expect(rows.length).toBe(2);
    });
  });

  describe('verifyOtp — happy path', () => {
    it('yangi user yaratiladi (users.phone INSERT)', async () => {
      const phone = TEST_PHONE_POOL[0]!;

      // sendOtp orqali OTP yaratamiz, lekin kod random — testda compare
      // qilolmaymiz. Buning o'rniga DB'ga to'g'ri code_hash qo'lda
      // yozamiz va keyin verify qilamiz (real flow simulatsiyasi).
      const { hash } = await import('bcryptjs');
      const codeHash = await hash('123456', 10);
      await db.insert(otpCodes).values({
        phone,
        codeHash,
        expiresAt: new Date(Date.now() + 120_000),
      });

      const sessionUser = await eskizAdapter.verifyOtp(phone, '123456');

      expect(sessionUser).not.toBeNull();
      expect(sessionUser?.phone).toBe(phone);
      expect(sessionUser?.role).toBe('client');
      expect(sessionUser?.id).toBeDefined();

      // DB'da user yaratildi
      const [user] = await db.select().from(users).where(eq(users.phone, phone));
      expect(user).toBeDefined();
      expect(user?.phone).toBe(phone);
      expect(user?.name).toBeNull(); // signup hali tugamagan

      // OTP `used_at` set qilindi
      const [otp] = await db.select().from(otpCodes).where(eq(otpCodes.phone, phone));
      expect(otp?.usedAt).not.toBeNull();
    });

    it('mavjud user qaytadan login — duplicate yaratmaydi', async () => {
      const phone = TEST_PHONE_POOL[1]!;
      const { hash } = await import('bcryptjs');
      const codeHash = await hash('123456', 10);

      // Birinchi marta
      await db.insert(otpCodes).values({
        phone,
        codeHash,
        expiresAt: new Date(Date.now() + 120_000),
      });
      const first = await eskizAdapter.verifyOtp(phone, '123456');

      // Ikkinchi marta — yangi OTP, lekin xuddi shu user
      await db.insert(otpCodes).values({
        phone,
        codeHash,
        expiresAt: new Date(Date.now() + 120_000),
      });
      const second = await eskizAdapter.verifyOtp(phone, '123456');

      expect(first?.id).toBe(second?.id); // bir xil user ID

      // DB'da bitta user
      const allUsers = await db.select().from(users).where(eq(users.phone, phone));
      expect(allUsers.length).toBe(1);
    });
  });

  describe('verifyOtp — error paths', () => {
    it("noto'g'ri kod → null + attempts increment", async () => {
      const phone = TEST_PHONE_POOL[2]!;
      const { hash } = await import('bcryptjs');
      const codeHash = await hash('123456', 10);
      await db.insert(otpCodes).values({
        phone,
        codeHash,
        expiresAt: new Date(Date.now() + 120_000),
      });

      const result = await eskizAdapter.verifyOtp(phone, '999999');
      expect(result).toBeNull();

      const [otp] = await db.select().from(otpCodes).where(eq(otpCodes.phone, phone));
      expect(otp?.attempts).toBe(1);
      expect(otp?.usedAt).toBeNull(); // muvaffaqiyatsiz, used emas
    });

    it("OTP muddati o'tgan → null", async () => {
      const phone = TEST_PHONE_POOL[3]!;
      const { hash } = await import('bcryptjs');
      const codeHash = await hash('123456', 10);
      // Muddati o'tgan OTP
      await db.insert(otpCodes).values({
        phone,
        codeHash,
        expiresAt: new Date(Date.now() - 1000), // 1 sekund oldin
      });

      const result = await eskizAdapter.verifyOtp(phone, '123456');
      expect(result).toBeNull(); // expired
    });

    it("3 marta noto'g'ri urinish → block (attempts >= 3)", async () => {
      const phone = TEST_PHONE_POOL[4]!;
      const { hash } = await import('bcryptjs');
      const codeHash = await hash('123456', 10);
      await db.insert(otpCodes).values({
        phone,
        codeHash,
        attempts: 3, // allaqachon 3 ta urinish bor
        expiresAt: new Date(Date.now() + 120_000),
      });

      const result = await eskizAdapter.verifyOtp(phone, '123456');
      expect(result).toBeNull(); // hatto to'g'ri kod ham — block
    });

    it("OTP yo'q → null (foydalanuvchi sendOtp qilmagan)", async () => {
      const phone = TEST_PHONE_POOL[0]!;

      const result = await eskizAdapter.verifyOtp(phone, '123456');
      expect(result).toBeNull();
    });
  });

  describe('refreshUser', () => {
    it('mavjud user ID — SessionUser qaytaradi', async () => {
      const phone = TEST_PHONE_POOL[1]!;
      const [created] = await db.insert(users).values({ phone }).returning();
      expect(created).toBeDefined();

      const session = await eskizAdapter.refreshUser(created!.id);
      expect(session?.phone).toBe(phone);
      expect(session?.id).toBe(created!.id);
    });

    it('mavjud bo`lmagan ID → null', async () => {
      // Random UUID — DB'da yo'q
      const result = await eskizAdapter.refreshUser('00000000-0000-0000-0000-000000000000');
      expect(result).toBeNull();
    });
  });
});
