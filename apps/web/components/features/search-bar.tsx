'use client';

/**
 * `SearchBar` — Home Hero va Search sahifa yuqorisida ishlatiladigan
 * autocomplete'li qidiruv input.
 *
 * Task: T3.08
 *
 * Xususiyatlar:
 *  - Debounced filtering (300ms) — `suggestions` ro'yxati input bo'yicha filtrlanadi
 *  - Recent searches — localStorage'da oxirgi 5 ta so'rov saqlanadi
 *  - Popular suggestions — props orqali statik ro'yxat (S05'da real)
 *  - Submit → `onSubmit(query)`. Recent ro'yxatga qo'shiladi.
 *  - Klaviatura: Arrow Up/Down — option highlight, Enter — tanlash, Esc — tozalash
 *  - Outside click — dropdown yopiladi
 *  - SSR-safe: localStorage faqat `useEffect` ichida o'qiladi
 *
 * Combobox WAI-ARIA pattern (listbox tomonida):
 *  - input `role="combobox" aria-expanded aria-controls aria-activedescendant`
 *  - dropdown `role="listbox"` + har option `role="option" aria-selected`
 */
import { Search, X } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import { useDebounce } from 'use-debounce';

import { cn } from '@/lib/utils';

// ─── Constants ───────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 300;
const MAX_RECENT = 5;
const DEFAULT_STORAGE_KEY = 'ustatop:recent-searches';
const DEFAULT_PLACEHOLDER = 'Sizga qanday usta kerak?';

// ─── Helpers (localStorage I/O, SSR-safe) ────────────────────────────────────

function readRecent(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === 'string').slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

function writeRecent(key: string, items: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(items.slice(0, MAX_RECENT)));
  } catch {
    // localStorage quota / disabled — silently ignore
  }
}

/**
 * Yangi so'rovni recent ro'yxat boshiga qo'yadi, dublikat olib tashlaydi va
 * oxirgi 5'ga qisqartiradi. Bo'sh string e'tiborga olinmaydi.
 */
function pushRecent(prev: string[], next: string): string[] {
  const trimmed = next.trim();
  if (!trimmed) return prev;
  const without = prev.filter((x) => x.toLowerCase() !== trimmed.toLowerCase());
  return [trimmed, ...without].slice(0, MAX_RECENT);
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface SearchBarProps {
  defaultValue?: string;
  onSubmit: (query: string) => void;
  suggestions?: string[];
  recentStorageKey?: string;
  placeholder?: string;
  className?: string;
}

type DropdownOption = {
  value: string;
  source: 'recent' | 'suggestion';
};

// ─── Component ───────────────────────────────────────────────────────────────

export function SearchBar({
  defaultValue = '',
  onSubmit,
  suggestions = [],
  recentStorageKey = DEFAULT_STORAGE_KEY,
  placeholder = DEFAULT_PLACEHOLDER,
  className,
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);
  const [debouncedValue] = useDebounce(value, DEBOUNCE_MS);
  const [isOpen, setIsOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  // ─ localStorage hydration (SSR-safe — useEffect mount'da bir marta) ─────
  useEffect(() => {
    setRecent(readRecent(recentStorageKey));
  }, [recentStorageKey]);

  // ─ Outside click close ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // ─ Dropdown options (recent + filtered suggestions) ──────────────────────
  const options = useMemo<DropdownOption[]>(() => {
    const query = debouncedValue.trim().toLowerCase();
    const filteredSuggestions = query
      ? suggestions.filter((s) => s.toLowerCase().includes(query))
      : suggestions;

    const recentOpts: DropdownOption[] = recent
      .filter((r) => !query || r.toLowerCase().includes(query))
      .map((r) => ({ value: r, source: 'recent' as const }));

    // Recent va suggestion'larda bir xil matn — recent'ni qoldiramiz
    const seen = new Set(recentOpts.map((r) => r.value.toLowerCase()));
    const suggestionOpts: DropdownOption[] = filteredSuggestions
      .filter((s) => !seen.has(s.toLowerCase()))
      .map((s) => ({ value: s, source: 'suggestion' as const }));

    return [...recentOpts, ...suggestionOpts];
  }, [debouncedValue, recent, suggestions]);

  // ─ Handlers ──────────────────────────────────────────────────────────────

  const submit = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) return;
      const nextRecent = pushRecent(recent, trimmed);
      setRecent(nextRecent);
      writeRecent(recentStorageKey, nextRecent);
      setIsOpen(false);
      setHighlight(-1);
      onSubmit(trimmed);
    },
    [onSubmit, recent, recentStorageKey],
  );

  const clear = useCallback(() => {
    setValue('');
    setHighlight(-1);
    inputRef.current?.focus();
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    setIsOpen(true);
    setHighlight(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (options.length === 0) return;
      setIsOpen(true);
      setHighlight((h) => (h + 1) % options.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (options.length === 0) return;
      setIsOpen(true);
      setHighlight((h) => (h <= 0 ? options.length - 1 : h - 1));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (highlight >= 0 && options[highlight]) {
        const picked = options[highlight].value;
        setValue(picked);
        submit(picked);
      } else {
        submit(value);
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      if (value) {
        clear();
      } else {
        setIsOpen(false);
      }
    }
  };

  const handleOptionClick = (opt: DropdownOption) => {
    setValue(opt.value);
    submit(opt.value);
  };

  const showClear = value.length > 0;
  const showDropdown = isOpen && options.length > 0;
  const activeOptionId = highlight >= 0 ? `${listboxId}-opt-${highlight}` : undefined;

  return (
    <div ref={containerRef} data-slot="search-bar" className={cn('relative w-full', className)}>
      <div
        className={cn(
          'border-border bg-card flex h-12 w-full items-center gap-2 rounded-2xl border px-4 shadow-sm transition-colors',
          'focus-within:border-brand-500 focus-within:ring-brand-500/20 focus-within:ring-2',
        )}
      >
        <Search aria-hidden="true" className="text-muted-foreground h-5 w-5 shrink-0" />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label="Qidiruv"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeOptionId}
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="placeholder:text-muted-foreground text-foreground h-full flex-1 bg-transparent text-base outline-none"
        />
        {showClear && (
          <button
            type="button"
            aria-label="Tozalash"
            onClick={clear}
            className={cn(
              'text-muted-foreground hover:text-foreground inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors',
              'focus-visible:ring-brand-500 focus-visible:ring-2 focus-visible:outline-none',
            )}
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Takliflar"
          className={cn(
            'border-border bg-popover absolute top-full right-0 left-0 z-20 mt-2 max-h-80 overflow-y-auto rounded-xl border py-1 shadow-lg',
          )}
        >
          {options.map((opt, index) => {
            const isHighlighted = index === highlight;
            return (
              <li
                key={`${opt.source}-${opt.value}`}
                id={`${listboxId}-opt-${index}`}
                role="option"
                aria-selected={isHighlighted}
                data-source={opt.source}
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleOptionClick(opt);
                }}
                onMouseEnter={() => setHighlight(index)}
                className={cn(
                  'flex cursor-pointer items-center gap-3 px-4 py-2 text-sm',
                  isHighlighted ? 'bg-muted text-foreground' : 'text-foreground',
                )}
              >
                {opt.source === 'recent' ? (
                  <span aria-hidden="true" className="text-muted-foreground text-xs">
                    ⏱
                  </span>
                ) : (
                  <Search aria-hidden="true" className="text-muted-foreground h-3.5 w-3.5" />
                )}
                <span className="flex-1 truncate">{opt.value}</span>
                {opt.source === 'recent' && (
                  <span className="text-muted-foreground text-[10px] uppercase">Oxirgi</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
