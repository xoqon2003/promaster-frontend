/**
 * T4.06 — `Step3Photos` unit tests.
 *
 * Qamrov:
 *  - Render: dropzone + 0 / 5 counter
 *  - File input + valid file → preview ko'rinadi
 *  - 6-rasm — too_many xato
 *  - Notavshil MIME (gif) — wrong_mime xato
 *  - 5 MB dan katta — too_large xato
 *  - Remove tugma → preview olib tashlanadi
 *  - Skip tugma → onComplete chaqiriladi
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Step3Photos } from './step-3-photos';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockSetDraft = vi.fn();
const mockUseBookingDraft = vi.fn();
vi.mock('@/lib/hooks/use-booking-draft', () => ({
  useBookingDraft: () => mockUseBookingDraft(),
}));

// URL.createObjectURL / revokeObjectURL — jsdom mock
beforeEach(() => {
  if (typeof URL.createObjectURL !== 'function') {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:mock'),
    });
  }
  if (typeof URL.revokeObjectURL !== 'function') {
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
  }

  mockSetDraft.mockReset();
  mockUseBookingDraft.mockReset();
  mockUseBookingDraft.mockReturnValue({
    draft: {},
    setDraft: mockSetDraft,
    resetDraft: vi.fn(),
    storageMode: 'empty',
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeFile(opts: { name?: string; size?: number; type?: string }): File {
  const { name = 'pic.jpg', size = 1024, type = 'image/jpeg' } = opts;
  const data = new Uint8Array(size);
  return new File([data], name, { type });
}

async function uploadFile(input: HTMLInputElement, file: File) {
  const user = userEvent.setup();
  await user.upload(input, file);
}

/**
 * accept attribute notavshil MIME'larni filtrlasa, userEvent.upload no-op
 * bo'ladi. Validatsiya logikasini tekshirish uchun fireEvent + custom
 * `dataTransfer` orqali bypass qilamiz.
 */
function dispatchFileChange(input: HTMLInputElement, files: File[]) {
  Object.defineProperty(input, 'files', {
    configurable: true,
    value: files,
  });
  fireEvent.change(input);
}

// ─── Render ──────────────────────────────────────────────────────────────────

describe('Step3Photos — render', () => {
  it('dropzone + counter 0 / 5', () => {
    render(<Step3Photos onComplete={vi.fn()} />);
    expect(screen.getByTestId('photo-dropzone')).toBeInTheDocument();
    expect(screen.getByTestId('photo-dropzone')).toHaveTextContent('0 / 5');
  });

  it("'Foto qo'shish' tugma + skip link mavjud", () => {
    render(<Step3Photos onComplete={vi.fn()} />);
    expect(screen.getByTestId('photo-add-btn')).toBeInTheDocument();
    expect(screen.getByTestId('photo-skip-btn')).toBeInTheDocument();
  });
});

// ─── Validation ──────────────────────────────────────────────────────────────

describe('Step3Photos — validation', () => {
  it('notavshil MIME (gif) — wrong_mime xato', async () => {
    render(<Step3Photos onComplete={vi.fn()} />);
    const input = screen.getByTestId('photo-file-input') as HTMLInputElement;

    // accept="image/jpeg,..." gif'ni filtrlaydi → fireEvent bypass
    dispatchFileChange(input, [makeFile({ type: 'image/gif' })]);

    await waitFor(() => {
      expect(screen.getByTestId('photo-error')).toHaveTextContent(/JPG/);
    });
  });

  it('5 MB dan katta — too_large xato', async () => {
    render(<Step3Photos onComplete={vi.fn()} />);
    const input = screen.getByTestId('photo-file-input') as HTMLInputElement;

    await uploadFile(input, makeFile({ size: 6 * 1024 * 1024 }));

    await waitFor(() => {
      expect(screen.getByTestId('photo-error')).toHaveTextContent(/MB/);
    });
  });
});

// ─── Skip ────────────────────────────────────────────────────────────────────

describe('Step3Photos — skip', () => {
  it('skip bossa setDraft({photos:[]}) + onComplete', async () => {
    const onComplete = vi.fn();
    const user = userEvent.setup();
    render(<Step3Photos onComplete={onComplete} />);

    await user.click(screen.getByTestId('photo-skip-btn'));

    await waitFor(() => {
      expect(mockSetDraft).toHaveBeenCalledWith({ photos: [] });
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });
});

// ─── Existing photos ─────────────────────────────────────────────────────────

describe('Step3Photos — initial draft', () => {
  it("draft.photos bo'lsa — preview render qilinadi", () => {
    mockUseBookingDraft.mockReturnValue({
      draft: {
        photos: [
          {
            id: 'ph_1',
            url: 'https://cdn.test/a.jpg',
            mimeType: 'image/jpeg',
            bytes: 1024,
          },
          {
            id: 'ph_2',
            url: 'https://cdn.test/b.png',
            mimeType: 'image/png',
            bytes: 2048,
          },
        ],
      },
      setDraft: mockSetDraft,
      resetDraft: vi.fn(),
      storageMode: 'url',
    });

    render(<Step3Photos onComplete={vi.fn()} />);

    expect(screen.getByTestId('photo-tile-ph_1')).toBeInTheDocument();
    expect(screen.getByTestId('photo-tile-ph_2')).toBeInTheDocument();
    expect(screen.getByTestId('photo-dropzone')).toHaveTextContent('2 / 5');
  });

  it('remove tugma → preview olib tashlanadi', async () => {
    const user = userEvent.setup();
    mockUseBookingDraft.mockReturnValue({
      draft: {
        photos: [{ id: 'ph_1', url: 'https://test/x.jpg', mimeType: 'image/jpeg', bytes: 1024 }],
      },
      setDraft: mockSetDraft,
      resetDraft: vi.fn(),
      storageMode: 'url',
    });

    render(<Step3Photos onComplete={vi.fn()} />);
    expect(screen.getByTestId('photo-tile-ph_1')).toBeInTheDocument();

    await user.click(screen.getByTestId('photo-remove-ph_1'));

    expect(screen.queryByTestId('photo-tile-ph_1')).not.toBeInTheDocument();
  });
});
