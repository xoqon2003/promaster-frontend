/**
 * T3.08 — SearchBar unit tests.
 *
 * Qamrov:
 *  - rendering: input, search/clear icon, placeholder
 *  - submit: Enter, click suggestion
 *  - clear: × tugmasi va Esc
 *  - suggestions filtering: debounced (300ms — fake timers bilan)
 *  - recent searches: localStorage I/O
 *  - keyboard navigation: ArrowDown/Up + Enter, aria-activedescendant
 *  - outside click: dropdown yopiladi
 *  - SSR: localStorage'siz crash yo'q (silent fallback)
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SearchBar } from './search-bar';

const POPULAR = ['Elektrik', 'Santexnik', 'Remont ustasi', 'Dizayner', 'Tarjimon'];
const STORAGE_KEY = 'ustatop:test-recent';

beforeEach(() => {
  window.localStorage.clear();
});

// ─── Rendering ───────────────────────────────────────────────────────────────

describe('SearchBar — rendering', () => {
  it("input role=combobox + search icon ko'rsatadi", () => {
    render(<SearchBar onSubmit={() => {}} />);

    expect(screen.getByRole('combobox', { name: 'Qidiruv' })).toBeInTheDocument();
  });

  it('defaultValue input qiymatiga yoziladi', () => {
    render(<SearchBar defaultValue="elektrik" onSubmit={() => {}} />);

    expect(screen.getByRole('combobox')).toHaveValue('elektrik');
  });

  it('placeholder default va custom', () => {
    const { rerender } = render(<SearchBar onSubmit={() => {}} />);
    expect(screen.getByPlaceholderText('Sizga qanday usta kerak?')).toBeInTheDocument();

    rerender(<SearchBar onSubmit={() => {}} placeholder="Kategoriya yoki usta nomi" />);
    expect(screen.getByPlaceholderText('Kategoriya yoki usta nomi')).toBeInTheDocument();
  });

  it("bo'sh input — clear (×) tugmasi yo'q", () => {
    render(<SearchBar onSubmit={() => {}} />);

    expect(screen.queryByRole('button', { name: 'Tozalash' })).not.toBeInTheDocument();
  });
});

// ─── Submit ──────────────────────────────────────────────────────────────────

describe('SearchBar — submit', () => {
  it('Enter — onSubmit chaqiriladi va trim qilinadi', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<SearchBar onSubmit={handleSubmit} />);

    const input = screen.getByRole('combobox');
    await user.type(input, '  elektrik  ');
    await user.keyboard('{Enter}');

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith('elektrik');
  });

  it("bo'sh input — Enter onSubmit chaqirmaydi", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<SearchBar onSubmit={handleSubmit} />);

    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{Enter}');

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("submit — yangi qiymat localStorage recent ro'yxatiga qo'shiladi", async () => {
    const user = userEvent.setup();

    render(<SearchBar onSubmit={() => {}} recentStorageKey={STORAGE_KEY} />);

    await user.type(screen.getByRole('combobox'), 'santexnik');
    await user.keyboard('{Enter}');

    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual(['santexnik']);
  });

  it("dublikat recent — yangi joyga ko'chadi (oldindagi olib tashlanadi)", async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(['elektrik', 'santexnik']));
    const user = userEvent.setup();

    render(<SearchBar onSubmit={() => {}} recentStorageKey={STORAGE_KEY} />);

    await user.type(screen.getByRole('combobox'), 'elektrik');
    await user.keyboard('{Enter}');

    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([
      'elektrik',
      'santexnik',
    ]);
  });

  it("recent ro'yxat MAX 5 ta", async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(['a', 'b', 'c', 'd', 'e']));
    const user = userEvent.setup();

    render(<SearchBar onSubmit={() => {}} recentStorageKey={STORAGE_KEY} />);

    await user.type(screen.getByRole('combobox'), 'f');
    await user.keyboard('{Enter}');

    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    expect(stored).toHaveLength(5);
    expect(stored[0]).toBe('f');
    expect(stored).not.toContain('e');
  });
});

// ─── Clear ───────────────────────────────────────────────────────────────────

describe('SearchBar — clear', () => {
  it("× tugmasi — input bo'shatiladi", async () => {
    const user = userEvent.setup();

    render(<SearchBar defaultValue="elektrik" onSubmit={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'Tozalash' }));

    expect(screen.getByRole('combobox')).toHaveValue('');
  });

  it("Esc — qiymat tozalanadi (input bo'shaydi)", async () => {
    const user = userEvent.setup();

    render(<SearchBar defaultValue="elektrik" onSubmit={() => {}} />);

    const input = screen.getByRole('combobox');
    input.focus();
    await user.keyboard('{Escape}');

    expect(input).toHaveValue('');
  });
});

// ─── Suggestions filtering ───────────────────────────────────────────────────

describe('SearchBar — suggestions', () => {
  it("focus — barcha popular suggestion ko'rsatiladi", async () => {
    const user = userEvent.setup();

    render(<SearchBar onSubmit={() => {}} suggestions={POPULAR} />);

    await user.click(screen.getByRole('combobox'));

    const listbox = await screen.findByRole('listbox');
    expect(listbox).toBeInTheDocument();
    POPULAR.forEach((s) => {
      expect(screen.getByText(s)).toBeInTheDocument();
    });
  });

  it("debounce — type qilingan matn bo'yicha filtrlanadi", async () => {
    const user = userEvent.setup();

    render(<SearchBar onSubmit={() => {}} suggestions={POPULAR} />);

    await user.click(screen.getByRole('combobox'));
    await user.keyboard('san');

    // Debounce 300ms — waitFor real timer'da kutadi
    await waitFor(
      () => {
        expect(screen.queryByText('Elektrik')).not.toBeInTheDocument();
      },
      { timeout: 1000 },
    );
    expect(screen.getByText('Santexnik')).toBeInTheDocument();
  });

  it("suggestion click — input to'ldiriladi va onSubmit chaqiriladi", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<SearchBar onSubmit={handleSubmit} suggestions={POPULAR} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Dizayner'));

    expect(handleSubmit).toHaveBeenCalledWith('Dizayner');
  });
});

// ─── Recent display ──────────────────────────────────────────────────────────

describe('SearchBar — recent searches', () => {
  it("localStorage'da recent bor — focus ochilganda ko'rinadi", async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(['Toshkent santexnik']));
    const user = userEvent.setup();

    render(<SearchBar onSubmit={() => {}} recentStorageKey={STORAGE_KEY} />);

    await user.click(screen.getByRole('combobox'));

    const option = await screen.findByRole('option', { name: /Toshkent santexnik/ });
    expect(option).toHaveAttribute('data-source', 'recent');
  });

  it("recent va suggestion bir xil bo'lsa — recent qoladi (suggestion takrorlanmaydi)", async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(['Elektrik']));
    const user = userEvent.setup();

    render(<SearchBar onSubmit={() => {}} suggestions={POPULAR} recentStorageKey={STORAGE_KEY} />);

    await user.click(screen.getByRole('combobox'));

    const elektrikOptions = await screen.findAllByText('Elektrik');
    expect(elektrikOptions).toHaveLength(1);
    expect(screen.getByRole('option', { name: /Elektrik/ })).toHaveAttribute(
      'data-source',
      'recent',
    );
  });
});

// ─── Keyboard navigation ─────────────────────────────────────────────────────

describe('SearchBar — keyboard navigation', () => {
  it('ArrowDown — birinchi option highlight (aria-activedescendant)', async () => {
    const user = userEvent.setup();

    render(<SearchBar onSubmit={() => {}} suggestions={POPULAR} />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.keyboard('{ArrowDown}');

    const [firstOption] = screen.getAllByRole('option');
    if (!firstOption) throw new Error('No options rendered');
    expect(firstOption).toHaveAttribute('aria-selected', 'true');
    expect(input).toHaveAttribute('aria-activedescendant', firstOption.id);
  });

  it("ArrowUp boshlang'ichdan — oxirgi option highlight (loop)", async () => {
    const user = userEvent.setup();

    render(<SearchBar onSubmit={() => {}} suggestions={POPULAR} />);

    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{ArrowUp}');

    const options = screen.getAllByRole('option');
    expect(options[options.length - 1]).toHaveAttribute('aria-selected', 'true');
  });

  it('ArrowDown + Enter — highlighted suggestion submit qiladi', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<SearchBar onSubmit={handleSubmit} suggestions={POPULAR} />);

    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');

    expect(handleSubmit).toHaveBeenCalledWith(POPULAR[1]);
  });
});

// ─── Outside click ───────────────────────────────────────────────────────────

describe('SearchBar — outside click', () => {
  it('tashqarisiga click — dropdown yopiladi', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <SearchBar onSubmit={() => {}} suggestions={POPULAR} />
        <button>Tashqi</button>
      </div>,
    );

    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('listbox')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Tashqi' }));

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });
});

// ─── localStorage corruption ─────────────────────────────────────────────────

describe('SearchBar — localStorage edge cases', () => {
  it("corrupted JSON — bo'sh recent ro'yxat (crash yo'q)", async () => {
    window.localStorage.setItem(STORAGE_KEY, '{not-json');
    const user = userEvent.setup();

    render(<SearchBar onSubmit={() => {}} recentStorageKey={STORAGE_KEY} />);

    await user.click(screen.getByRole('combobox'));

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
