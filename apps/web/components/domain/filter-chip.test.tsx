/**
 * T3.07 — FilterChip unit tests.
 *
 * Qamrov:
 *  - rendering: label, count, active/inactive holatlar
 *  - toggle variant: onToggle chaqiriladi (click + Enter + Space)
 *  - dismissible variant: × bilan onDismiss
 *  - static variant: span, hech qanday tugma yo'q
 *  - disabled: chaqiruvlar bloklanadi
 *  - a11y: role="switch" + aria-pressed, dismiss tugmasida aria-label
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FilterChip } from './filter-chip';

// ─── Rendering ───────────────────────────────────────────────────────────────

describe('FilterChip — rendering', () => {
  it("label'ni ko'rsatadi", () => {
    render(<FilterChip label="Online" onToggle={() => {}} />);

    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it("count berilgan bo'lsa (42) formatida ko'rsatadi", () => {
    render(<FilterChip label="Elektrik" count={42} onToggle={() => {}} />);

    expect(screen.getByTestId('filter-chip-count')).toHaveTextContent('(42)');
  });

  it("count=0 ham ko'rsatiladi (boshqa filterga o'tkazish uchun)", () => {
    render(<FilterChip label="Nikoh" count={0} onToggle={() => {}} />);

    expect(screen.getByTestId('filter-chip-count')).toHaveTextContent('(0)');
  });

  it("count berilmasa — count badge yo'q", () => {
    render(<FilterChip label="Online" onToggle={() => {}} />);

    expect(screen.queryByTestId('filter-chip-count')).not.toBeInTheDocument();
  });

  it('data-active attribut active props ga mos keladi', () => {
    const { rerender } = render(<FilterChip label="Online" onToggle={() => {}} />);
    expect(screen.getByRole('switch')).toHaveAttribute('data-active', 'false');

    rerender(<FilterChip label="Online" active onToggle={() => {}} />);
    expect(screen.getByRole('switch')).toHaveAttribute('data-active', 'true');
  });
});

// ─── Toggle variant ──────────────────────────────────────────────────────────

describe('FilterChip — toggle variant', () => {
  it('role="switch" + aria-pressed bilan render qiladi', () => {
    render(<FilterChip label="Online" active onToggle={() => {}} />);

    const chip = screen.getByRole('switch');
    expect(chip).toHaveAttribute('aria-pressed', 'true');
    expect(chip).toHaveAttribute('aria-label', 'Online');
  });

  it('click — onToggle teskari qiymat bilan chaqiriladi', async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();

    render(<FilterChip label="Online" active={false} onToggle={handleToggle} />);

    await user.click(screen.getByRole('switch'));

    expect(handleToggle).toHaveBeenCalledTimes(1);
    expect(handleToggle).toHaveBeenCalledWith(true);
  });

  it("active bo'lsa click — false qiymat keladi", async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();

    render(<FilterChip label="Online" active onToggle={handleToggle} />);

    await user.click(screen.getByRole('switch'));

    expect(handleToggle).toHaveBeenCalledWith(false);
  });

  it('klaviatura Enter — onToggle chaqiriladi', async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();

    render(<FilterChip label="Online" onToggle={handleToggle} />);

    screen.getByRole('switch').focus();
    await user.keyboard('{Enter}');

    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('klaviatura Space — onToggle chaqiriladi', async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();

    render(<FilterChip label="Online" onToggle={handleToggle} />);

    screen.getByRole('switch').focus();
    await user.keyboard(' ');

    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it("Tab bilan fokusga o'tadi", async () => {
    const user = userEvent.setup();

    render(
      <>
        <button>Oldingi</button>
        <FilterChip label="Online" onToggle={() => {}} />
      </>,
    );

    await user.tab();
    await user.tab();

    expect(screen.getByRole('switch')).toHaveFocus();
  });

  it("disabled bo'lsa onToggle chaqirilmaydi", async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();

    render(<FilterChip label="Online" onToggle={handleToggle} disabled />);

    await user.click(screen.getByRole('switch'));

    expect(handleToggle).not.toHaveBeenCalled();
  });
});

// ─── Dismissible variant ─────────────────────────────────────────────────────

describe('FilterChip — dismissible variant', () => {
  it('× tugmasi aria-label bilan render qiladi', () => {
    render(<FilterChip label="Kategoriya: Elektrik" dismissible onDismiss={() => {}} />);

    expect(
      screen.getByRole('button', { name: 'Kategoriya: Elektrik filtrini olib tashlash' }),
    ).toBeInTheDocument();
  });

  it('× bosilsa — onDismiss chaqiriladi', async () => {
    const user = userEvent.setup();
    const handleDismiss = vi.fn();

    render(<FilterChip label="Elektrik" dismissible onDismiss={handleDismiss} />);

    await user.click(screen.getByRole('button', { name: /olib tashlash/ }));

    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('klaviatura Enter (× tugma) — onDismiss chaqiriladi', async () => {
    const user = userEvent.setup();
    const handleDismiss = vi.fn();

    render(<FilterChip label="Elektrik" dismissible onDismiss={handleDismiss} />);

    screen.getByRole('button', { name: /olib tashlash/ }).focus();
    await user.keyboard('{Enter}');

    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it("outer element span — toggle tugmasi yo'q", () => {
    render(<FilterChip label="Elektrik" dismissible onDismiss={() => {}} />);

    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });

  it('count + dismissible birga ishlaydi', () => {
    render(<FilterChip label="Elektrik" count={42} dismissible onDismiss={() => {}} />);

    expect(screen.getByTestId('filter-chip-count')).toHaveTextContent('(42)');
    expect(screen.getByRole('button', { name: /olib tashlash/ })).toBeInTheDocument();
  });

  it("disabled bo'lsa × bosilsa onDismiss chaqirilmaydi", async () => {
    const user = userEvent.setup();
    const handleDismiss = vi.fn();

    render(<FilterChip label="Elektrik" dismissible onDismiss={handleDismiss} disabled />);

    await user.click(screen.getByRole('button', { name: /olib tashlash/ }));

    expect(handleDismiss).not.toHaveBeenCalled();
  });
});

// ─── Static variant ──────────────────────────────────────────────────────────

describe('FilterChip — static variant (read-only)', () => {
  it("hech qanday tugma yo'q — span sifatida", () => {
    render(<FilterChip label="124 natija" count={124} />);

    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('124 natija')).toBeInTheDocument();
  });

  it('aria-label label dan olinadi', () => {
    render(<FilterChip label="Filter qo'llanmagan" />);

    expect(screen.getByLabelText("Filter qo'llanmagan")).toBeInTheDocument();
  });
});
