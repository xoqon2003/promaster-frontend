'use client';

/**
 * Step 3 — Foto biriktirish (ixtiyoriy).
 *
 * Task: T4.06
 *
 * UX:
 *  - Drag-n-drop yoki "Foto qo'shish" tugma orqali file input
 *  - Validatsiya: MIME (JPG/PNG/WebP), bytes (≤5MB), count (≤5)
 *  - Preview grid 3 col mobile, 5 col desktop
 *  - Har thumbnail yonida "✕" — bekor qilish
 *  - "Foto kerak emas, davom etish" link — wizard goNext bilan ulanadi
 *  - Notavshil fayl — toast yoki inline xato
 *
 * State: local component state (foto yuborilgandan keyin draft.photos
 * `BookingPhoto[]` ga ko'chadi). Submit'da uploadPhotoMock chaqiriladi.
 *
 * Memory: blob URL'lar unmount'da revoke qilinadi (memory leak yo'q).
 */
import { ImagePlus, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';

import { Button } from '@/components/ui/button';
import { useBookingDraft } from '@/lib/hooks/use-booking-draft';
import {
  canAddPhotos,
  formatBytes,
  makeLocalPhoto,
  reasonLabel,
  uploadPhotoMock,
  validatePhotoFile,
} from '@/lib/booking/photo-upload';
import {
  MAX_PHOTOS,
  PHOTO_MIME_TYPES,
  type BookingPhoto,
  type BookingPhotoLocal,
} from '@/lib/booking/schemas';
import { cn } from '@/lib/utils';

import { WIZARD_FORM_ID } from './step-1-service';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Step3PhotosProps {
  onComplete: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Step3Photos({ onComplete }: Step3PhotosProps) {
  const { draft, setDraft } = useBookingDraft();

  // Tashqi (draft.photos) — server tomondan keladigan BookingPhoto array
  // Ichki (locals) — yuklanayotgan / kutayotgan local fayllar
  const initial: BookingPhoto[] = draft.photos ?? [];
  const [uploaded, setUploaded] = useState<BookingPhoto[]>(initial);
  const [locals, setLocals] = useState<BookingPhotoLocal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Cleanup: blob URL'lar unmount'da revoke
  useEffect(() => {
    return () => {
      locals.forEach((l) => {
        if (l.blobUrl && typeof URL !== 'undefined') {
          URL.revokeObjectURL(l.blobUrl);
        }
      });
    };
  }, [locals]);

  // Foto qo'shish — validatsiya + local saqlash + mock upload trigger
  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      const fileArr = Array.from(files);

      const totalAfter = uploaded.length + locals.length + fileArr.length;
      if (totalAfter > MAX_PHOTOS) {
        setError(reasonLabel('too_many'));
        return;
      }

      const valid: BookingPhotoLocal[] = [];
      for (const file of fileArr) {
        const result = validatePhotoFile(file);
        if (!result.ok) {
          setError(reasonLabel(result.reason));
          continue;
        }
        valid.push(makeLocalPhoto(file));
      }

      if (valid.length === 0) return;

      // Mahalliy state'ga qo'shamiz (UI darhol yangilanadi)
      setLocals((prev) => [...prev, ...valid.map((v) => ({ ...v, status: 'uploading' as const }))]);

      // Mock upload — 800ms keyin server tomondan ID qaytadi
      for (const local of valid) {
        try {
          const photo = await uploadPhotoMock(local);
          setUploaded((prev) => [...prev, photo]);
          setLocals((prev) => prev.filter((l) => l.localId !== local.localId));
        } catch {
          setLocals((prev) =>
            prev.map((l) => (l.localId === local.localId ? { ...l, status: 'error' as const } : l)),
          );
        }
      }
    },
    [uploaded.length, locals.length],
  );

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      void addFiles(e.target.files);
    }
    // Reset input so same file can be re-selected after removal
    e.target.value = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void addFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const removeUploaded = (id: string) => {
    setUploaded((prev) => prev.filter((p) => p.id !== id));
  };

  const removeLocal = (localId: string) => {
    setLocals((prev) => {
      const target = prev.find((l) => l.localId === localId);
      if (target?.blobUrl && typeof URL !== 'undefined') {
        URL.revokeObjectURL(target.blobUrl);
      }
      return prev.filter((l) => l.localId !== localId);
    });
  };

  const handleSubmit = async () => {
    await setDraft({ photos: uploaded });
    onComplete();
  };

  const handleSkip = async () => {
    // Foto kerak emas — bo'sh massiv (yoki avval bor bo'lganini saqlash)
    await setDraft({ photos: uploaded });
    onComplete();
  };

  const totalCount = uploaded.length + locals.length;
  const canAddMore = canAddPhotos(totalCount, 1);

  return (
    <form
      id={WIZARD_FORM_ID}
      data-slot="step-3-photos"
      data-testid="step-3-photos-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
      className="border-border bg-card mx-auto max-w-2xl space-y-5 rounded-2xl border p-5 sm:p-6"
    >
      <div className="space-y-1">
        <h2 className="text-foreground text-lg font-semibold">Fotolar (ixtiyoriy)</h2>
        <p className="text-muted-foreground text-sm">
          Ish joyini ko&apos;rsatuvchi rasm ust narx baholashga yordam beradi.
        </p>
      </div>

      {/* ── Dropzone ──────────────────────────────────────────────── */}
      <div
        data-slot="dropzone"
        data-testid="photo-dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors',
          isDragOver
            ? 'border-brand-500 bg-brand-50'
            : 'border-border bg-background hover:border-brand-300',
          !canAddMore && 'pointer-events-none opacity-50',
        )}
      >
        <Upload aria-hidden="true" className="text-muted-foreground h-8 w-8" />
        <p className="text-foreground text-sm font-medium">Faylni tashlang yoki bosing</p>
        <p className="text-muted-foreground text-xs">
          {totalCount} / {MAX_PHOTOS} · JPG / PNG / WebP · ≤ 5 MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={PHOTO_MIME_TYPES.join(',')}
          multiple
          onChange={handleFileInput}
          data-testid="photo-file-input"
          className="sr-only"
          aria-label="Foto fayl tanlash"
          disabled={!canAddMore}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={!canAddMore}
          data-testid="photo-add-btn"
        >
          <ImagePlus aria-hidden="true" className="mr-2 h-4 w-4" />
          Foto qo&apos;shish
        </Button>
      </div>

      {error && (
        <p role="alert" data-testid="photo-error" className="text-destructive text-sm">
          {error}
        </p>
      )}

      {/* ── Preview grid ──────────────────────────────────────────── */}
      {totalCount > 0 && (
        <div data-testid="photo-preview-grid" className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {uploaded.map((photo) => (
            <div
              key={photo.id}
              data-testid={`photo-tile-${photo.id}`}
              className="group bg-muted relative aspect-square overflow-hidden rounded-xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="Yuklangan rasm" className="h-full w-full object-cover" />
              <button
                type="button"
                aria-label="Foto bekor qilish"
                onClick={() => removeUploaded(photo.id)}
                data-testid={`photo-remove-${photo.id}`}
                className="bg-foreground/70 hover:bg-foreground absolute top-1.5 right-1.5 grid h-6 w-6 place-items-center rounded-full text-white transition-colors"
              >
                <X aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
              <span className="bg-foreground/60 absolute bottom-1.5 left-1.5 rounded px-1.5 py-0.5 text-[10px] text-white">
                {formatBytes(photo.bytes)}
              </span>
            </div>
          ))}

          {locals.map((local) => (
            <div
              key={local.localId}
              data-testid={`photo-tile-local-${local.localId}`}
              data-state={local.status}
              className="group bg-muted relative aspect-square overflow-hidden rounded-xl"
            >
              {local.blobUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={local.blobUrl}
                  alt="Yuklanmoqda"
                  className={cn(
                    'h-full w-full object-cover',
                    local.status === 'uploading' && 'opacity-50',
                  )}
                />
              )}
              {local.status === 'uploading' && (
                <span className="absolute inset-0 flex items-center justify-center text-xs text-white">
                  Yuklanmoqda…
                </span>
              )}
              <button
                type="button"
                aria-label="Foto bekor qilish"
                onClick={() => removeLocal(local.localId)}
                className="bg-foreground/70 hover:bg-foreground absolute top-1.5 right-1.5 grid h-6 w-6 place-items-center rounded-full text-white transition-colors"
              >
                <X aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Skip link ──────────────────────────────────────────── */}
      <div className="text-center">
        <button
          type="button"
          data-testid="photo-skip-btn"
          onClick={() => void handleSkip()}
          className="text-brand-500 hover:text-brand-600 focus-visible:ring-brand-500 rounded text-sm font-medium underline focus-visible:ring-2 focus-visible:outline-none"
        >
          Foto kerak emas, davom etish
        </button>
      </div>
    </form>
  );
}
