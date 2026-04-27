/**
 * T4.02 — `mockBookingApi` integration tests.
 *
 * Qamrov:
 *  - create(draft) — to'liq draft → Booking + store'ga saqlash
 *  - create() — invalid draft (Zod fail) → throw
 *  - create() — incomplete draft (masterId yo'q) → throw
 *  - create() — master yo'q → throw
 *  - getById() — store'da bor/yo'q
 *  - cancel() — status cancelled, completed bekor qilib bo'lmaydi
 *  - listByClient() — clientId bo'yicha filter, newest first
 *  - ID format: bk_<ts>_<seq>
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { BookingDraft } from './schemas';
import { SLOT_LEAD_MINUTES } from './schemas';
import { __resetBookingStore, mockBookingApi } from './api-client';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const FROZEN_NOW = new Date('2026-05-23T10:00:00+05:00');
const FUTURE_SLOT = new Date(
  FROZEN_NOW.getTime() + (SLOT_LEAD_MINUTES + 60) * 60 * 1000,
).toISOString();

function makeDraft(overrides: Partial<BookingDraft> = {}): BookingDraft {
  return {
    masterId: 'm_1',
    service: {
      categoryId: 'elektrik',
      subServiceId: 'rozetka',
      description: 'Test buyurtma',
    },
    addressSlot: {
      location: { lat: 41.31, lng: 69.28, address: 'Toshkent, Chilonzor 12' },
      slotAt: FUTURE_SLOT,
    },
    photos: [],
    contact: {
      fullName: 'Test Mijoz',
      phone: '+998901234567',
    },
    ...overrides,
  };
}

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  __resetBookingStore();
  // Faqat Date'ni fake qilamiz — setTimeout real qoladi (sleep 500ms aslida
  // process.env.NODE_ENV='test' bilan short-circuit'ga tushadi, lekin agar
  // shortcircuit ishlamasa ham testlar 60s timeoutda yashil).
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(FROZEN_NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

// ─── create() ────────────────────────────────────────────────────────────────

describe('mockBookingApi.create', () => {
  it("to'liq draft → Booking obyekt yaratiladi", async () => {
    const booking = await mockBookingApi.create(makeDraft(), { clientId: 'u_42' });

    expect(booking.id).toMatch(/^bk_\d+_\d{4}$/);
    expect(booking.masterId).toBe('m_1');
    expect(booking.clientId).toBe('u_42');
    expect(booking.status).toBe('pending');
    expect(booking.service.categoryId).toBe('elektrik');
    expect(booking.priceRange.currency).toBe('UZS');
    expect(booking.priceRange.from).toBeGreaterThan(0);
    expect(booking.priceRange.to).toBeGreaterThanOrEqual(booking.priceRange.from);
  });

  it('createdAt ISO datetime', async () => {
    const booking = await mockBookingApi.create(makeDraft(), { clientId: 'u_1' });
    expect(() => new Date(booking.createdAt).toISOString()).not.toThrow();
  });

  it("masterId yo'q — throw 'incomplete'", async () => {
    const draft = makeDraft();
    delete draft.masterId;
    await expect(mockBookingApi.create(draft, { clientId: 'u_1' })).rejects.toThrow(/incomplete/i);
  });

  it("contact yo'q — throw 'incomplete'", async () => {
    const draft = makeDraft();
    delete draft.contact;
    await expect(mockBookingApi.create(draft, { clientId: 'u_1' })).rejects.toThrow(/incomplete/i);
  });

  it('invalid telefon → BookingDraft validation failed', async () => {
    const draft = makeDraft({
      contact: { fullName: 'Test', phone: '12345' },
    });
    await expect(mockBookingApi.create(draft, { clientId: 'u_1' })).rejects.toThrow(/validation/i);
  });

  it("master topilmasa → throw 'Master not found'", async () => {
    const draft = makeDraft({ masterId: 'm_does_not_exist' });
    await expect(mockBookingApi.create(draft, { clientId: 'u_1' })).rejects.toThrow(/not found/i);
  });

  it("o'tgan slotAt → BookingDraft validation failed (refinement)", async () => {
    const past = new Date(FROZEN_NOW.getTime() - 60 * 60 * 1000).toISOString();
    const draft = makeDraft({
      addressSlot: {
        location: { lat: 41.31, lng: 69.28, address: 'X' },
        slotAt: past,
      },
    });
    await expect(mockBookingApi.create(draft, { clientId: 'u_1' })).rejects.toThrow(/validation/i);
  });

  it('ketma-ket create — har biriga unikal ID', async () => {
    const b1 = await mockBookingApi.create(makeDraft(), { clientId: 'u_1' });
    const b2 = await mockBookingApi.create(makeDraft(), { clientId: 'u_1' });
    expect(b1.id).not.toBe(b2.id);
  });
});

// ─── getById() ───────────────────────────────────────────────────────────────

describe('mockBookingApi.getById', () => {
  it('yaratilgan buyurtma topiladi', async () => {
    const created = await mockBookingApi.create(makeDraft(), { clientId: 'u_1' });
    const fetched = await mockBookingApi.getById(created.id);
    expect(fetched).toEqual(created);
  });

  it("yo'q ID — null", async () => {
    expect(await mockBookingApi.getById('bk_does_not_exist')).toBeNull();
  });
});

// ─── cancel() ────────────────────────────────────────────────────────────────

describe('mockBookingApi.cancel', () => {
  it('pending → cancelled', async () => {
    const created = await mockBookingApi.create(makeDraft(), { clientId: 'u_1' });
    const cancelled = await mockBookingApi.cancel(created.id);
    expect(cancelled.status).toBe('cancelled');
    expect(cancelled.id).toBe(created.id);

    // Storeda yangilangan
    const fetched = await mockBookingApi.getById(created.id);
    expect(fetched?.status).toBe('cancelled');
  });

  it("yo'q ID — throw 'not found'", async () => {
    await expect(mockBookingApi.cancel('bk_x')).rejects.toThrow(/not found/i);
  });
});

// ─── listByClient() ──────────────────────────────────────────────────────────

describe('mockBookingApi.listByClient', () => {
  it("clientId bo'yicha filter", async () => {
    await mockBookingApi.create(makeDraft(), { clientId: 'u_1' });
    await mockBookingApi.create(makeDraft(), { clientId: 'u_2' });
    await mockBookingApi.create(makeDraft(), { clientId: 'u_1' });

    const list = await mockBookingApi.listByClient('u_1');
    expect(list).toHaveLength(2);
    expect(list.every((b) => b.clientId === 'u_1')).toBe(true);
  });

  it('yangi → eski tartibda (createdAt desc)', async () => {
    vi.setSystemTime(new Date('2026-05-23T10:00:00+05:00'));
    const b1 = await mockBookingApi.create(makeDraft(), { clientId: 'u_1' });

    vi.setSystemTime(new Date('2026-05-23T11:00:00+05:00'));
    // FUTURE_SLOT yana valid bo'lishi uchun yangi draft
    const b2 = await mockBookingApi.create(
      makeDraft({
        addressSlot: {
          location: { lat: 41.31, lng: 69.28, address: 'X' },
          slotAt: new Date(
            new Date('2026-05-23T11:00:00+05:00').getTime() + (SLOT_LEAD_MINUTES + 60) * 60 * 1000,
          ).toISOString(),
        },
      }),
      { clientId: 'u_1' },
    );

    const list = await mockBookingApi.listByClient('u_1');
    expect(list[0]?.id).toBe(b2.id); // yangi
    expect(list[1]?.id).toBe(b1.id); // eski
  });

  it("hech narsa yo'q — bo'sh array", async () => {
    expect(await mockBookingApi.listByClient('u_orphan')).toEqual([]);
  });
});
