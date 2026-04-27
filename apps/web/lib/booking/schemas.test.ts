/**
 * T4.01 — Booking Zod schemas acceptance tests.
 *
 * Qamrov:
 *  - Sub-schemas (Photo, ServiceDetails, AddressSlot, Photos, Contact)
 *  - Boundary qiymatlar (min/max length, file size, photo count)
 *  - Refinements (slotAt past, priceRange.to < priceRange.from)
 *  - BookingDraft optional/partial holati
 *  - Booking strict — barcha maydon majburiy
 *  - isBookingDraftComplete helper
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AddressSlotSchema,
  BookingDraftSchema,
  BookingPhotoSchema,
  BookingSchema,
  BookingStatusSchema,
  ContactSchema,
  DESCRIPTION_MAX,
  isBookingDraftComplete,
  MAX_PHOTOS,
  PhotosSchema,
  PHOTO_MAX_BYTES,
  ServiceDetailsSchema,
  SLOT_LEAD_MINUTES,
} from './schemas';
import type { BookingDraft, BookingPhoto } from './schemas';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const VALID_PHOTO: BookingPhoto = {
  id: 'ph_1',
  url: 'https://cdn.ustatop.uz/uploads/abc.jpg',
  mimeType: 'image/jpeg',
  bytes: 1024 * 1024,
};

const VALID_SERVICE = {
  categoryId: 'elektrik',
  subServiceId: 'rozetka-almashtirish',
  description: "Devordagi 3 ta rozetkani almashtirish kerak. Eski simlardan o'zi qulflanyapti.",
};

const FUTURE_SLOT = new Date(Date.now() + (SLOT_LEAD_MINUTES + 60) * 60 * 1000).toISOString();

const VALID_ADDRESS_SLOT = {
  location: { lat: 41.31, lng: 69.28, address: 'Toshkent, Chilonzor' },
  slotAt: FUTURE_SLOT,
};

const VALID_CONTACT = {
  fullName: 'Bobur Toshmatov',
  phone: '+998901234567',
};

// ─── BookingPhotoSchema ──────────────────────────────────────────────────────

describe('BookingPhotoSchema', () => {
  it('valid foto qabul qilinadi', () => {
    expect(BookingPhotoSchema.safeParse(VALID_PHOTO).success).toBe(true);
  });

  it.each(['image/gif', 'image/svg+xml', 'application/pdf', 'video/mp4'])(
    "noto'g'ri MIME (%s) rad etiladi",
    (mimeType) => {
      expect(BookingPhotoSchema.safeParse({ ...VALID_PHOTO, mimeType }).success).toBe(false);
    },
  );

  it('5 MB dan katta — rad etiladi', () => {
    expect(
      BookingPhotoSchema.safeParse({ ...VALID_PHOTO, bytes: PHOTO_MAX_BYTES + 1 }).success,
    ).toBe(false);
  });

  it('0 bayt — rad etiladi (positive)', () => {
    expect(BookingPhotoSchema.safeParse({ ...VALID_PHOTO, bytes: 0 }).success).toBe(false);
  });

  it('URL emas — rad etiladi', () => {
    expect(BookingPhotoSchema.safeParse({ ...VALID_PHOTO, url: 'not-a-url' }).success).toBe(false);
  });
});

// ─── ServiceDetailsSchema ────────────────────────────────────────────────────

describe('ServiceDetailsSchema', () => {
  it('valid xizmat qabul qilinadi', () => {
    expect(ServiceDetailsSchema.safeParse(VALID_SERVICE).success).toBe(true);
  });

  it("bo'sh tavsif qabul qilinadi (empty string max emas)", () => {
    expect(ServiceDetailsSchema.safeParse({ ...VALID_SERVICE, description: '' }).success).toBe(
      true,
    );
  });

  it(`tavsif > ${DESCRIPTION_MAX} belgi — rad etiladi`, () => {
    expect(
      ServiceDetailsSchema.safeParse({
        ...VALID_SERVICE,
        description: 'a'.repeat(DESCRIPTION_MAX + 1),
      }).success,
    ).toBe(false);
  });

  it("bo'sh categoryId — rad etiladi", () => {
    expect(ServiceDetailsSchema.safeParse({ ...VALID_SERVICE, categoryId: '' }).success).toBe(
      false,
    );
  });

  it("bo'sh subServiceId — rad etiladi", () => {
    expect(ServiceDetailsSchema.safeParse({ ...VALID_SERVICE, subServiceId: '' }).success).toBe(
      false,
    );
  });
});

// ─── AddressSlotSchema (vaqt refinement) ─────────────────────────────────────

describe('AddressSlotSchema', () => {
  // Vaqtga bog'liq testlar uchun — fake timer
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-23T10:00:00+05:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('hozirdan +2 soat va keyingi slot — qabul', () => {
    const slot = new Date('2026-05-23T13:00:00+05:00').toISOString(); // +3 soat
    expect(AddressSlotSchema.safeParse({ ...VALID_ADDRESS_SLOT, slotAt: slot }).success).toBe(true);
  });

  it("hozir + 1 soat (cutoff'dan past) — rad etiladi", () => {
    const slot = new Date('2026-05-23T11:00:00+05:00').toISOString();
    const result = AddressSlotSchema.safeParse({ ...VALID_ADDRESS_SLOT, slotAt: slot });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('soat keyin');
    }
  });

  it("o'tmishga slot — rad etiladi", () => {
    const slot = new Date('2026-05-23T08:00:00+05:00').toISOString();
    expect(AddressSlotSchema.safeParse({ ...VALID_ADDRESS_SLOT, slotAt: slot }).success).toBe(
      false,
    );
  });

  it("location.lat noto'g'ri — rad etiladi", () => {
    expect(
      AddressSlotSchema.safeParse({
        ...VALID_ADDRESS_SLOT,
        slotAt: new Date('2026-05-23T13:00:00+05:00').toISOString(),
        location: { lat: 91, lng: 69, address: 'x' },
      }).success,
    ).toBe(false);
  });

  it('slotAt — ISO emas — rad etiladi', () => {
    expect(
      AddressSlotSchema.safeParse({ ...VALID_ADDRESS_SLOT, slotAt: '2026-05-23 13:00' }).success,
    ).toBe(false);
  });
});

// ─── PhotosSchema ────────────────────────────────────────────────────────────

describe('PhotosSchema', () => {
  it("bo'sh array qabul qilinadi (foto ixtiyoriy)", () => {
    expect(PhotosSchema.safeParse({ photos: [] }).success).toBe(true);
  });

  it(`${MAX_PHOTOS} ta foto — qabul`, () => {
    const photos = Array.from({ length: MAX_PHOTOS }, (_, i) => ({
      ...VALID_PHOTO,
      id: `ph_${i}`,
    }));
    expect(PhotosSchema.safeParse({ photos }).success).toBe(true);
  });

  it(`${MAX_PHOTOS + 1} ta foto — rad etiladi`, () => {
    const photos = Array.from({ length: MAX_PHOTOS + 1 }, (_, i) => ({
      ...VALID_PHOTO,
      id: `ph_${i}`,
    }));
    expect(PhotosSchema.safeParse({ photos }).success).toBe(false);
  });
});

// ─── ContactSchema ───────────────────────────────────────────────────────────

describe('ContactSchema', () => {
  it('valid kontakt qabul qilinadi', () => {
    expect(ContactSchema.safeParse(VALID_CONTACT).success).toBe(true);
  });

  it('alternativePhone — qabul qilinadi (ixtiyoriy)', () => {
    expect(
      ContactSchema.safeParse({ ...VALID_CONTACT, alternativePhone: '+998935554433' }).success,
    ).toBe(true);
  });

  it.each(['998901234567', '+99890123456', '+9989012345678', '998 90 123 45 67'])(
    "noto'g'ri telefon (%s) rad etiladi",
    (phone) => {
      expect(ContactSchema.safeParse({ ...VALID_CONTACT, phone }).success).toBe(false);
    },
  );

  it('ism 1 belgi — rad etiladi (min 2)', () => {
    expect(ContactSchema.safeParse({ ...VALID_CONTACT, fullName: 'B' }).success).toBe(false);
  });

  it('ism > 100 belgi — rad etiladi', () => {
    expect(ContactSchema.safeParse({ ...VALID_CONTACT, fullName: 'a'.repeat(101) }).success).toBe(
      false,
    );
  });
});

// ─── BookingDraftSchema (partial) ────────────────────────────────────────────

describe('BookingDraftSchema', () => {
  it("bo'sh draft qabul qilinadi (hamma optional)", () => {
    expect(BookingDraftSchema.safeParse({}).success).toBe(true);
  });

  it('faqat masterId qisman draft', () => {
    expect(BookingDraftSchema.safeParse({ masterId: 'm_1' }).success).toBe(true);
  });

  it("to'liq draft", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-23T10:00:00+05:00'));

    const draft: BookingDraft = {
      masterId: 'm_1',
      service: VALID_SERVICE,
      addressSlot: {
        ...VALID_ADDRESS_SLOT,
        slotAt: new Date('2026-05-23T13:00:00+05:00').toISOString(),
      },
      photos: [VALID_PHOTO],
      contact: VALID_CONTACT,
    };
    expect(BookingDraftSchema.safeParse(draft).success).toBe(true);

    vi.useRealTimers();
  });
});

// ─── BookingSchema (strict, server) ──────────────────────────────────────────

describe('BookingSchema', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-23T10:00:00+05:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const VALID_BOOKING = {
    id: 'bk_123',
    masterId: 'm_1',
    clientId: 'u_42',
    service: VALID_SERVICE,
    addressSlot: {
      ...VALID_ADDRESS_SLOT,
      slotAt: new Date('2026-05-23T13:00:00+05:00').toISOString(),
    },
    photos: [VALID_PHOTO],
    contact: VALID_CONTACT,
    status: 'pending' as const,
    createdAt: new Date('2026-05-23T10:00:00+05:00').toISOString(),
    priceRange: { from: 50_000, to: 150_000, currency: 'UZS' as const },
  };

  it("to'liq valid booking — qabul", () => {
    expect(BookingSchema.safeParse(VALID_BOOKING).success).toBe(true);
  });

  it('priceRange.to < priceRange.from — rad etiladi', () => {
    const result = BookingSchema.safeParse({
      ...VALID_BOOKING,
      priceRange: { from: 200_000, to: 100_000, currency: 'UZS' },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('priceRange');
    }
  });

  it('yetishmayotgan service — rad etiladi', () => {
    const { service: _service, ...withoutService } = VALID_BOOKING;
    expect(_service).toBeDefined();
    expect(BookingSchema.safeParse(withoutService).success).toBe(false);
  });

  it('currency UZS emas — rad etiladi', () => {
    expect(
      BookingSchema.safeParse({
        ...VALID_BOOKING,
        priceRange: { from: 50_000, to: 100_000, currency: 'USD' },
      }).success,
    ).toBe(false);
  });
});

// ─── BookingStatusSchema ─────────────────────────────────────────────────────

describe('BookingStatusSchema', () => {
  it.each(['pending', 'accepted', 'in_progress', 'completed', 'cancelled'] as const)(
    "'%s' status — qabul",
    (status) => {
      expect(BookingStatusSchema.safeParse(status).success).toBe(true);
    },
  );

  it("noma'lum status — rad etiladi", () => {
    expect(BookingStatusSchema.safeParse('archived').success).toBe(false);
  });
});

// ─── isBookingDraftComplete ──────────────────────────────────────────────────

describe('isBookingDraftComplete', () => {
  it("bo'sh draft — false", () => {
    expect(isBookingDraftComplete({})).toBe(false);
  });

  it("photos'siz to'liq — true (photos ixtiyoriy)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-23T10:00:00+05:00'));

    const draft: BookingDraft = {
      masterId: 'm_1',
      service: VALID_SERVICE,
      addressSlot: {
        ...VALID_ADDRESS_SLOT,
        slotAt: new Date('2026-05-23T13:00:00+05:00').toISOString(),
      },
      contact: VALID_CONTACT,
    };
    expect(isBookingDraftComplete(draft)).toBe(true);

    vi.useRealTimers();
  });

  it("contact yo'q — false", () => {
    const draft: BookingDraft = {
      masterId: 'm_1',
      service: VALID_SERVICE,
      addressSlot: VALID_ADDRESS_SLOT,
    };
    expect(isBookingDraftComplete(draft)).toBe(false);
  });
});
