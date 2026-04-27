/**
 * Booking API contract — Zod schemas.
 *
 * Source of truth: docs/sprints/S04/PRD.md + tasks.md#t401
 * Task: T4.01
 *
 * Backend hali tayyor emas — bu fayl mock api-client (`api-client.ts`)
 * va wizard formlari uchun shartnoma. Real API tayyor bo'lganda
 * `mockBookingApi` o'rnida `httpBookingApi.create()` `safeParse()` orqali
 * validatsiya qiladi (R08 mitigation).
 *
 * Dizayn qarori:
 *   `BookingDraft` har step optional fields'ni o'z ichiga oladi (wizard
 *   davomida to'ldiriladi). `Booking` esa server tomonidan yaratilgan
 *   strict obyekt — barcha maydonlar majburiy. Submit paytida draft →
 *   Booking transformatsiyasi `BookingSchema.safeParse()` orqali.
 */
import { z } from 'zod';

import { LocationSchema } from '@/lib/masters/schemas';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Foto upload chegaralari (UI + API tomondan validatsiya). */
export const MAX_PHOTOS = 5;
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const PHOTO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

/** Hozirgi vaqtdan minimum 2 soat keyingi slot tanlanadi. */
export const SLOT_LEAD_MINUTES = 120;

/** Tavsif maydoni chegaralari. */
export const DESCRIPTION_MAX = 500;

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

/**
 * Foto biriktirma — UI'da blob URL, server tomonida `id` (presigned URL bilan
 * upload qilingandan keyin). Wizard davomida ikki shakl ishlatiladi:
 *
 *  - `BookingPhotoLocal` — drag-n-drop'dan keyin (`url` blob)
 *  - `BookingPhotoSchema` — submit paytida (`id` server'dan)
 */
export const BookingPhotoSchema = z.object({
  id: z.string().min(1),
  url: z.string().url(),
  /** Server tomondan tasdiqlangan MIME — `safeParse` rad etadi notavshil. */
  mimeType: z.enum(PHOTO_MIME_TYPES),
  /** Bayt o'lchami — UI throttling uchun. */
  bytes: z.number().int().positive().max(PHOTO_MAX_BYTES),
});

export type BookingPhoto = z.infer<typeof BookingPhotoSchema>;

/**
 * Step 1 — xizmat tafsilotlari.
 *
 * `categoryId` — `MasterSchema.categoryId` bilan bir xil enum (S03'dan).
 * `subServiceId` — kategoriya ichidagi xizmat (mock'da statik ro'yxat).
 */
export const ServiceDetailsSchema = z.object({
  categoryId: z.string().min(1),
  subServiceId: z.string().min(1),
  description: z.string().max(DESCRIPTION_MAX),
});

export type ServiceDetails = z.infer<typeof ServiceDetailsSchema>;

/**
 * Step 2 — manzil va vaqt.
 *
 * `slotAt` — ISO datetime. Refinement: hozirdan + 2 soat keyin minimum.
 * Bu UTC qiymatda saqlanadi, UI Asia/Tashkent timezone'ida ko'rsatadi.
 */
export const AddressSlotSchema = z
  .object({
    location: LocationSchema,
    slotAt: z.string().datetime({ offset: true }),
  })
  .refine(
    (val) => {
      const minLead = Date.now() + SLOT_LEAD_MINUTES * 60 * 1000;
      return new Date(val.slotAt).getTime() >= minLead;
    },
    {
      message: `Slot kamida ${SLOT_LEAD_MINUTES / 60} soat keyin bo'lishi kerak`,
      path: ['slotAt'],
    },
  );

export type AddressSlot = z.infer<typeof AddressSlotSchema>;

/**
 * Step 3 — fotolar (ixtiyoriy).
 *
 * Submit paytida `BookingPhoto` (server-validated) array. UI mahalliy
 * blob'ni `BookingPhotoLocal` shaklida saqlaydi va upload tugagach
 * `BookingPhoto` ga aylantiradi.
 */
export const PhotosSchema = z.object({
  photos: z.array(BookingPhotoSchema).max(MAX_PHOTOS),
});

export type Photos = z.infer<typeof PhotosSchema>;

/** UI-only: drag-n-drop'dan keyin server upload kutishda. */
export interface BookingPhotoLocal {
  /** Mahalliy ID — `crypto.randomUUID()` orqali generatsiya. */
  localId: string;
  blobUrl: string;
  file: File;
  /** Upload jarayonida progress (0..1) yoki `'uploading' | 'done' | 'error'`. */
  status: 'pending' | 'uploading' | 'done' | 'error';
  /** Server tomonidan qaytgan ma'lumot — `done` bo'lganda. */
  uploaded?: BookingPhoto;
}

/**
 * Step 5 — kontakt ma'lumotlari.
 *
 * `phone` — E.164 formatida (+998901234567). Login qilingan mijozda
 * profile'dan to'ldiriladi, lekin override mumkin.
 */
export const ContactSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().regex(/^\+998\d{9}$/, "Telefon +998 XX XXX XX XX shaklida bo'lishi kerak"),
  /** Ixtiyoriy 2-raqam (oila a'zosi yoki ish telefoni). */
  alternativePhone: z
    .string()
    .regex(/^\+998\d{9}$/)
    .optional(),
});

export type Contact = z.infer<typeof ContactSchema>;

// ─── Wizard draft (har step partial) ─────────────────────────────────────────

/**
 * `BookingDraft` — wizard davomida to'ldirilayotgan partial state.
 *
 * Har step alohida form'da to'ldiriladi va `setDraft()` orqali qo'shiladi.
 * Submit paytida `BookingSchema.safeParse()` orqali strict validatsiya
 * o'tkaziladi — agar rad etilsa, UI'da `?errorStep=N` ga redirect.
 *
 * `step` — joriy URL state, type yo'q (UI faqat `?step=` URL parami orqali).
 */
export const BookingDraftSchema = z.object({
  /** Master ID — Search'dan kelganda URL'da bo'ladi. */
  masterId: z.string().min(1).optional(),
  service: ServiceDetailsSchema.optional(),
  addressSlot: AddressSlotSchema.optional(),
  photos: PhotosSchema.shape.photos.optional(),
  contact: ContactSchema.optional(),
});

export type BookingDraft = z.infer<typeof BookingDraftSchema>;

// ─── Submitted Booking (server source-of-truth) ──────────────────────────────

/**
 * Buyurtma holati (lifecycle):
 *  - `pending`  — yaratildi, usta hali javob bermagan
 *  - `accepted` — usta qabul qildi, vaqt kelib qoladi
 *  - `in_progress` — usta yetib keldi (S05 tracking start)
 *  - `completed` — ish yakunlandi
 *  - `cancelled` — mijoz yoki usta bekor qildi
 */
export const BookingStatusSchema = z.enum([
  'pending',
  'accepted',
  'in_progress',
  'completed',
  'cancelled',
]);

export type BookingStatus = z.infer<typeof BookingStatusSchema>;

/**
 * `Booking` — server tomonidan yaratilgan strict obyekt.
 *
 * Barcha maydonlar majburiy. `BookingDraft` → `Booking` aylanish faqat
 * draft to'liq to'ldirilgandan keyin mumkin (BookingSchema refinement).
 */
export const BookingSchema = z
  .object({
    id: z.string().min(1),
    masterId: z.string().min(1),
    clientId: z.string().min(1),
    service: ServiceDetailsSchema,
    addressSlot: AddressSlotSchema,
    photos: z.array(BookingPhotoSchema).max(MAX_PHOTOS),
    contact: ContactSchema,
    status: BookingStatusSchema,
    /** Yaratilgan vaqt — server timestamp (ISO). */
    createdAt: z.string().datetime({ offset: true }),
    /** Hisoblangan narx oralig'i (read-only, UI step 4'da ko'rsatildi). */
    priceRange: z.object({
      from: z.number().int().nonnegative(),
      to: z.number().int().nonnegative(),
      currency: z.literal('UZS'),
    }),
  })
  .refine((val) => val.priceRange.to >= val.priceRange.from, {
    message: "priceRange.to priceRange.from'dan kichik bo'la olmaydi",
    path: ['priceRange'],
  });

export type Booking = z.infer<typeof BookingSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Draft to'liq to'ldirilganligini tekshiradi (submit'dan oldin).
 *
 * Photos optional — bo'sh array ham to'liqlikni buzmaydi.
 */
export function isBookingDraftComplete(draft: BookingDraft): boolean {
  return (
    Boolean(draft.masterId) &&
    Boolean(draft.service) &&
    Boolean(draft.addressSlot) &&
    Boolean(draft.contact)
  );
}
