/**
 * T4.05 — `SlotPicker` unit tests.
 *
 * Qamrov:
 *  - 7 ta day tab
 *  - Bugun selected default
 *  - Slot grid 24 ta (12 soat × 2)
 *  - O'tgan slot disabled
 *  - Slot click → onChange
 *  - Day tab click — internal state, slotlar yangilanadi
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SlotPicker } from './slot-picker';

const NOW = new Date('2026-05-23T10:00:00+05:00');

describe('SlotPicker', () => {
  it('7 ta day tab', () => {
    render(<SlotPicker value={null} onChange={vi.fn()} now={NOW} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(7);
  });

  it("Bugun + Ertaga label'lari", () => {
    render(<SlotPicker value={null} onChange={vi.fn()} now={NOW} />);
    expect(screen.getByText('Bugun')).toBeInTheDocument();
    expect(screen.getByText('Ertaga')).toBeInTheDocument();
  });

  it('Bugun aria-selected default', () => {
    render(<SlotPicker value={null} onChange={vi.fn()} now={NOW} />);
    const today = screen.getByRole('tab', { name: 'Bugun' });
    expect(today).toHaveAttribute('aria-selected', 'true');
  });

  it('24 ta slot (09:00 - 20:30, 30 daqiqa)', () => {
    render(<SlotPicker value={null} onChange={vi.fn()} now={NOW} />);
    const slots = screen.getAllByRole('radio');
    expect(slots).toHaveLength(24);
  });

  it("o'tgan slot (10:00 — hozirgi vaqt) disabled", () => {
    // NOW = 10:00, cutoff = 12:00 → 10:00 disabled
    render(<SlotPicker value={null} onChange={vi.fn()} now={NOW} />);
    const slot10 = screen.getByTestId('slot-10:00');
    expect(slot10).toBeDisabled();
  });

  it('12:00 slot (cutoff) — enabled', () => {
    render(<SlotPicker value={null} onChange={vi.fn()} now={NOW} />);
    const slot12 = screen.getByTestId('slot-12:00');
    expect(slot12).not.toBeDisabled();
  });

  it('slot click → onChange chaqiriladi ISO bilan', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<SlotPicker value={null} onChange={onChange} now={NOW} />);
    await user.click(screen.getByTestId('slot-15:00'));

    expect(onChange).toHaveBeenCalledTimes(1);
    const isoArg = onChange.mock.lastCall![0];
    expect(typeof isoArg).toBe('string');
    expect(new Date(isoArg).getHours()).toBe(15);
  });

  it('day tab bossa slot grid yangilanadi', async () => {
    const user = userEvent.setup();
    render(<SlotPicker value={null} onChange={vi.fn()} now={NOW} />);

    // Bugun: 10:00 disabled
    expect(screen.getByTestId('slot-10:00')).toBeDisabled();

    // Ertaga tabni bossa
    await user.click(screen.getByRole('tab', { name: 'Ertaga' }));

    // Endi 10:00 enabled (kelgusi kun)
    expect(screen.getByTestId('slot-10:00')).not.toBeDisabled();
  });

  it("value tanlangan bo'lsa — mos slot selected ko'rinadi", () => {
    // Tomorrow 15:00 ISO
    const tomorrow = new Date(NOW);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(15, 0, 0, 0);

    render(<SlotPicker value={tomorrow.toISOString()} onChange={vi.fn()} now={NOW} />);

    const slot = screen.getByTestId('slot-15:00');
    expect(slot).toHaveAttribute('aria-checked', 'true');
  });
});
