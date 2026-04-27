/**
 * T4.06 — `photo-upload` helper unit tests.
 */
import { describe, expect, it } from 'vitest';

import {
  canAddPhotos,
  formatBytes,
  generateLocalId,
  reasonLabel,
  uploadPhotoMock,
  validatePhotoFile,
  makeLocalPhoto,
} from './photo-upload';
import { MAX_PHOTOS, PHOTO_MAX_BYTES } from './schemas';

// jsdom'da File mavjud — global File constructor ishlatamiz
function makeFile(opts: { name?: string; size?: number; type?: string }): File {
  const { name = 'pic.jpg', size = 1024, type = 'image/jpeg' } = opts;
  // Buffer of `size` bytes — jsdom File constructor accepts BlobParts
  const data = new Uint8Array(size);
  return new File([data], name, { type });
}

// ─── validatePhotoFile ──────────────────────────────────────────────────────

describe('validatePhotoFile', () => {
  it.each(['image/jpeg', 'image/png', 'image/webp'])('MIME %s — qabul', (type) => {
    const file = makeFile({ type, size: 1024 });
    expect(validatePhotoFile(file).ok).toBe(true);
  });

  it.each(['image/gif', 'application/pdf', 'video/mp4'])(
    "noto'g'ri MIME (%s) — wrong_mime",
    (type) => {
      const file = makeFile({ type, size: 1024 });
      const result = validatePhotoFile(file);
      expect(result.ok).toBe(false);
      expect(result.reason).toBe('wrong_mime');
    },
  );

  it('5 MB dan katta — too_large', () => {
    const file = makeFile({ size: PHOTO_MAX_BYTES + 1 });
    const result = validatePhotoFile(file);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('too_large');
  });

  it('MIME va size cheklov chegarada — qabul', () => {
    const file = makeFile({ size: PHOTO_MAX_BYTES });
    expect(validatePhotoFile(file).ok).toBe(true);
  });
});

// ─── canAddPhotos ────────────────────────────────────────────────────────────

describe('canAddPhotos', () => {
  it('0 + 5 = 5 — qabul', () => {
    expect(canAddPhotos(0, MAX_PHOTOS)).toBe(true);
  });

  it('3 + 2 = 5 — qabul', () => {
    expect(canAddPhotos(3, 2)).toBe(true);
  });

  it('3 + 3 = 6 — rad', () => {
    expect(canAddPhotos(3, 3)).toBe(false);
  });

  it('MAX_PHOTOS + 1 — rad', () => {
    expect(canAddPhotos(MAX_PHOTOS, 1)).toBe(false);
  });
});

// ─── generateLocalId ─────────────────────────────────────────────────────────

describe('generateLocalId', () => {
  it('ikki chaqiriq — har xil ID', () => {
    expect(generateLocalId()).not.toBe(generateLocalId());
  });

  it('string format', () => {
    expect(typeof generateLocalId()).toBe('string');
  });
});

// ─── makeLocalPhoto ──────────────────────────────────────────────────────────

describe('makeLocalPhoto', () => {
  it("File'dan BookingPhotoLocal yaratadi", () => {
    const file = makeFile({ name: 'test.jpg', size: 2048 });
    const local = makeLocalPhoto(file);
    expect(local.localId).toBeTruthy();
    expect(local.file).toBe(file);
    expect(local.status).toBe('pending');
    // jsdom'da blobUrl bo'sh string yoki "blob:..." bo'lishi mumkin
    expect(typeof local.blobUrl).toBe('string');
  });
});

// ─── uploadPhotoMock ─────────────────────────────────────────────────────────

describe('uploadPhotoMock', () => {
  it('BookingPhoto qaytaradi (id, url, mimeType, bytes)', async () => {
    const file = makeFile({ size: 1500, type: 'image/png' });
    const local = makeLocalPhoto(file);
    const result = await uploadPhotoMock(local);
    expect(result.id).toContain('ph_');
    expect(result.url).toBe(local.blobUrl);
    expect(result.mimeType).toBe('image/png');
    expect(result.bytes).toBe(1500);
  });
});

// ─── formatBytes ─────────────────────────────────────────────────────────────

describe('formatBytes', () => {
  it.each([
    [500, '500 B'],
    [2048, '2 KB'],
    [1024 * 1024, '1.0 MB'],
    [1.5 * 1024 * 1024, '1.5 MB'],
  ])('%i → %s', (bytes, expected) => {
    expect(formatBytes(bytes)).toBe(expected);
  });
});

// ─── reasonLabel ─────────────────────────────────────────────────────────────

describe('reasonLabel', () => {
  it('har reason uchun matn qaytadi', () => {
    expect(reasonLabel('too_large')).toMatch(/MB/);
    expect(reasonLabel('wrong_mime')).toMatch(/JPG/);
    expect(reasonLabel('too_many')).toMatch(/Maksimum/);
    expect(reasonLabel(undefined)).toBeTruthy();
  });
});
