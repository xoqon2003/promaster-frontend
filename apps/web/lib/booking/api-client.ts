/**
 * Booking API client — adapter interface + mock implementation.
 *
 * Task: T4.02
 *
 * Arxitektura S03 (`mastersApi`) bilan bir xil — adapter interface mock
 * va real implementatsiyalar bir xil shaklda. Backend tayyor bo'lganda
 * faqat eksport almashtiriladi.
 *
 *   ┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
 *   │  Wizard UI   │ →  │  BookingApi      │ →  │  In-memory   │
 *   │  (RHF + nuqs)│    │  (interface)     │    │  store       │
 *   └──────────────┘    └──────────────────┘    └──────────────┘
 *                               │                       │
 *                               │   Real API tayyor     ▼
 *                               └──────────────── HTTP + multipart
 *
 * R08 mitigation: `create()` ichida `BookingDraftSchema` bilan input
 * validatsiya, va natijaviy `Booking` `BookingSchema.safeParse()` orqali
 * tekshiriladi. Schema drift'ni darhol ushlaydi.
 */
import { mastersApi } from '@/lib/masters/api-client';

import { calculatePriceRange } from './price-calc';
import {
  BookingDraftSchema,
  BookingSchema,
  isBookingDraftComplete,
  type Booking,
  type BookingDraft,
  type BookingPhoto,
  type BookingStatus,
} from './schemas';

// ─── Adapter interface ───────────────────────────────────────────────────────

/**
 * Booking API shartnomasi — mock va real implementatsiyalar mos kelishi shart.
 *
 * Har metod `Promise` qaytaradi (TanStack Query iste'moli uchun).
 */
export interface BookingApi {
  /**
   * Yangi buyurtma yaratish.
   *
   * @throws Error agar draft to'liq emas yoki schema rad etsa
   * (UI darajasida `?errorStep=N` bilan tegishli step ga redirect qiladi).
   */
  create(draft: BookingDraft, opts: { clientId: string }): Promise<Booking>;

  /** Buyurtma ID bo'yicha topish — yo'q bo'lsa `null`. */
  getById(id: string): Promise<Booking | null>;

  /** Bekor qilish — status `cancelled` ga o'tkazadi. Yo'q bo'lsa xato. */
  cancel(id: string): Promise<Booking>;

  /** Mijoz buyurtmalari ro'yxati (S05'da OrdersList sahifa uchun). */
  listByClient(clientId: string): Promise<Booking[]>;
}

// ─── Constants ───────────────────────────────────────────────────────────────

/** Real network feel — UI loading state animatsiyasi uchun kerak. */
const MOCK_LATENCY_MS = 500;

// ─── Mock latency ────────────────────────────────────────────────────────────

async function sleep(ms: number): Promise<void> {
  if (process.env.NODE_ENV === 'test') return; // testlarni tezlashtirish
  await new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── ID generation ───────────────────────────────────────────────────────────

let counter = 0;

/**
 * `bk_<timestamp>_<seq>` — sortable + collision-free.
 *
 * Real backend UUID v7 yoki ULID ishlatadi — mock'da `Date.now()` +
 * counter monotonic qiymat (test ichida `vi.useFakeTimers()` mos keladi).
 */
function generateBookingId(): string {
  counter += 1;
  return `bk_${Date.now()}_${counter.toString().padStart(4, '0')}`;
}

// ─── In-memory store ─────────────────────────────────────────────────────────

/**
 * @internal Faqat test'larda store'ni reset qilish uchun.
 */
const _store = new Map<string, Booking>();

/** @internal Test util — har test boshida store'ni tozalaydi. */
export function __resetBookingStore(): void {
  _store.clear();
  counter = 0;
}

// ─── Mock implementation ─────────────────────────────────────────────────────

export const mockBookingApi: BookingApi = {
  async create(draft, { clientId }) {
    await sleep(MOCK_LATENCY_MS);

    // 1) Input validation — draft schema'ga mos
    const parsedDraft = BookingDraftSchema.safeParse(draft);
    if (!parsedDraft.success) {
      throw new Error(
        `BookingDraft validation failed: ${parsedDraft.error.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join('; ')}`,
      );
    }

    // 2) To'liqlik tekshiruvi — masterId, service, addressSlot, contact
    if (!isBookingDraftComplete(parsedDraft.data)) {
      throw new Error(
        'BookingDraft is incomplete: masterId, service, addressSlot, contact required',
      );
    }

    // 3) Master mavjudligini tasdiqlash + narx range hisoblash
    const master = await mastersApi.getById(parsedDraft.data.masterId!);
    if (!master) {
      throw new Error(`Master not found: ${parsedDraft.data.masterId}`);
    }

    const priceRange = calculatePriceRange(master.priceFrom, master.categoryId);

    // 4) Booking obyektini yig'ish
    const candidate: Booking = {
      id: generateBookingId(),
      masterId: parsedDraft.data.masterId!,
      clientId,
      service: parsedDraft.data.service!,
      addressSlot: parsedDraft.data.addressSlot!,
      photos: (parsedDraft.data.photos ?? []) as BookingPhoto[],
      contact: parsedDraft.data.contact!,
      status: 'pending' as BookingStatus,
      createdAt: new Date().toISOString(),
      priceRange,
    };

    // 5) Output validation — server ham real holatda shunday qiladi
    const parsedBooking = BookingSchema.safeParse(candidate);
    if (!parsedBooking.success) {
      throw new Error(
        `Booking schema rejection (server contract drift): ${parsedBooking.error.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join('; ')}`,
      );
    }

    _store.set(parsedBooking.data.id, parsedBooking.data);
    return parsedBooking.data;
  },

  async getById(id) {
    await sleep(MOCK_LATENCY_MS);
    return _store.get(id) ?? null;
  },

  async cancel(id) {
    await sleep(MOCK_LATENCY_MS);
    const existing = _store.get(id);
    if (!existing) {
      throw new Error(`Booking not found: ${id}`);
    }
    if (existing.status === 'completed') {
      throw new Error('Tugagan buyurtmani bekor qilib bo`lmaydi');
    }
    const updated: Booking = { ...existing, status: 'cancelled' };
    _store.set(id, updated);
    return updated;
  },

  async listByClient(clientId) {
    await sleep(MOCK_LATENCY_MS);
    return Array.from(_store.values())
      .filter((b) => b.clientId === clientId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // newest first
  },
};

// ─── Public export — UI iste'mol qiladi ──────────────────────────────────────

/**
 * Joriy iste'mol nuqtasi. Real backend tayyor bo'lganda bu eksport
 * `httpBookingApi` ga almashtiriladi — UI layer (hooks, komponentlar)
 * o'zgarmaydi.
 */
export const bookingApi: BookingApi = mockBookingApi;
