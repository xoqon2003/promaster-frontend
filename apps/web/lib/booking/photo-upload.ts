/**
 * Photo upload mock + validatsiya helperlari.
 *
 * Task: T4.06
 *
 * Real backend ga upload qilish uchun `POST /upload` (multipart/form-data)
 * + presigned URL workflow kerak — bu mock'da `URL.createObjectURL()`
 * orqali browser ichida thumbnail saqlanadi. Submit paytida (T4.10)
 * `BookingPhoto[]` ga aylantiriladi.
 *
 * R03 mitigation: `BookingApi.uploadPhoto()` interface keyinroq
 * qo'shiladi — hozircha mock orqali simulyatsiya.
 */
import {
  MAX_PHOTOS,
  PHOTO_MAX_BYTES,
  PHOTO_MIME_TYPES,
  type BookingPhoto,
  type BookingPhotoLocal,
} from './schemas';

// ─── Validation ──────────────────────────────────────────────────────────────

export interface PhotoValidationResult {
  ok: boolean;
  /** Xato kodi (i18n key emas, hozircha string). */
  reason?: 'too_large' | 'wrong_mime' | 'too_many';
}

/** Bitta faylni tekshiradi (MIME + bytes). Soni boshqacha tekshiriladi. */
export function validatePhotoFile(file: File): PhotoValidationResult {
  if (!(PHOTO_MIME_TYPES as readonly string[]).includes(file.type)) {
    return { ok: false, reason: 'wrong_mime' };
  }
  if (file.size > PHOTO_MAX_BYTES) {
    return { ok: false, reason: 'too_large' };
  }
  return { ok: true };
}

/** Joriy foto soni + qo'shilayotgan fayllar — limit oshmaydimi? */
export function canAddPhotos(currentCount: number, addingCount: number): boolean {
  return currentCount + addingCount <= MAX_PHOTOS;
}

// ─── Mock upload ─────────────────────────────────────────────────────────────

/** Local ID generatsiya — drag-n-drop sessiyada unikal. */
export function generateLocalId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Mahalliy fayldan `BookingPhotoLocal` yaratish.
 *
 * `URL.createObjectURL()` blob URL yaratadi — komponent unmount'da
 * `URL.revokeObjectURL()` chaqirish kerak (memory leak oldini olish).
 */
export function makeLocalPhoto(file: File): BookingPhotoLocal {
  return {
    localId: generateLocalId(),
    blobUrl: typeof URL !== 'undefined' ? URL.createObjectURL(file) : '',
    file,
    status: 'pending',
  };
}

/**
 * Mock upload — 800ms keyin server qaytargan ID + URL.
 *
 * Real implementation (T4.10 keyinroq):
 *   1. POST /booking/photos/presign → { uploadUrl, finalUrl, id }
 *   2. PUT uploadUrl (S3 / Yandex Cloud) — multipart
 *   3. Local'dan finalUrl ga almashtirish
 */
export async function uploadPhotoMock(local: BookingPhotoLocal): Promise<BookingPhoto> {
  if (process.env.NODE_ENV !== 'test') {
    await new Promise((resolve) => setTimeout(resolve, 800));
  }
  return {
    id: `ph_${local.localId}`,
    url: local.blobUrl,
    mimeType: local.file.type as BookingPhoto['mimeType'],
    bytes: local.file.size,
  };
}

// ─── Display helpers ─────────────────────────────────────────────────────────

/** Bayt → "1.2 MB" / "850 KB" formatida. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Validation reason → i18n string. */
export function reasonLabel(reason: PhotoValidationResult['reason']): string {
  switch (reason) {
    case 'too_large':
      return 'Fayl 5 MB dan katta';
    case 'wrong_mime':
      return 'Faqat JPG / PNG / WebP';
    case 'too_many':
      return `Maksimum ${MAX_PHOTOS} ta rasm`;
    default:
      return 'Notavshil fayl';
  }
}
