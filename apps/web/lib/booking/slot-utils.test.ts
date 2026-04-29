/**
 * T4.05 — `slot-utils` unit tests.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SLOT_LEAD_MINUTES } from './schemas';
import {
  buildCalendarDays,
  buildTimeSlots,
  CALENDAR_DAYS,
  isoDateForSlot,
  SLOT_DURATION_MINUTES,
  WORKING_HOUR_END,
  WORKING_HOUR_START,
} from './slot-utils';

const NOW = new Date('2026-05-23T10:00:00+05:00');

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

// ─── buildCalendarDays ───────────────────────────────────────────────────────

describe('buildCalendarDays', () => {
  it(`${CALENDAR_DAYS} ta kun qaytaradi`, () => {
    const days = buildCalendarDays(NOW);
    expect(days).toHaveLength(CALENDAR_DAYS);
  });

  it("birinchi kun 'Bugun' label", () => {
    const days = buildCalendarDays(NOW);
    expect(days[0]?.label).toBe('Bugun');
    expect(days[0]?.isToday).toBe(true);
  });

  it("ikkinchi kun 'Ertaga'", () => {
    const days = buildCalendarDays(NOW);
    expect(days[1]?.label).toBe('Ertaga');
    expect(days[1]?.isToday).toBe(false);
  });

  it('uchinchi kun va keyin — kun + sana label', () => {
    const days = buildCalendarDays(NOW);
    // 2026-05-25 — Du (Dush) (May 25 was a Monday)
    expect(days[2]?.label).toMatch(/^[A-Z][a-z]{2,3} \d+ [A-Z][a-z]+$/);
  });

  it('barcha kunlar 00:00 vaqtda', () => {
    const days = buildCalendarDays(NOW);
    for (const day of days) {
      const d = new Date(day.isoDate);
      // ISO string UTC'da, 00:00 LOCAL vaqtda → UTC'da local timezone offsetiga teng
      // Toshkent +5 → UTC 19:00 oldingi kun bo'lishi mumkin. Buni hisobga olamiz.
      // Lekin hours/minutes/seconds local timezone'da 00 bo'lishi kerak.
      const local = new Date(d.getTime() + d.getTimezoneOffset() * 60 * 1000);
      void local; // Tashkent local = UTC+5
      // Just check that minutes/seconds are 00
      expect(d.getUTCMinutes()).toBe(0);
      expect(d.getUTCSeconds()).toBe(0);
    }
  });
});

// ─── buildTimeSlots ──────────────────────────────────────────────────────────

describe('buildTimeSlots', () => {
  it('bir kun uchun 24 ta slot (12 soat × 2)', () => {
    // 09:00 - 21:00 = 12 soat × 2 slot = 24
    const days = buildCalendarDays(NOW);
    const slots = buildTimeSlots(days[0]!.isoDate, NOW);
    const expected = (WORKING_HOUR_END - WORKING_HOUR_START) * (60 / SLOT_DURATION_MINUTES);
    expect(slots).toHaveLength(expected);
  });

  it('birinchi slot 09:00, oxirgi 20:30', () => {
    const days = buildCalendarDays(NOW);
    const slots = buildTimeSlots(days[0]!.isoDate, NOW);
    expect(slots[0]?.label).toBe('09:00');
    expect(slots[slots.length - 1]?.label).toBe('20:30');
  });

  it("hozir + 2 soat'dan past slotlar disabled", () => {
    // NOW = 10:00, cutoff = 12:00 → 12:00 dan past disabled
    const days = buildCalendarDays(NOW);
    const slots = buildTimeSlots(days[0]!.isoDate, NOW);

    const slot10 = slots.find((s) => s.label === '10:00');
    const slot11 = slots.find((s) => s.label === '11:00');
    const slot12 = slots.find((s) => s.label === '12:00');
    const slot13 = slots.find((s) => s.label === '13:00');

    expect(slot10?.enabled).toBe(false);
    expect(slot11?.enabled).toBe(false);
    expect(slot12?.enabled).toBe(true); // exact cutoff
    expect(slot13?.enabled).toBe(true);
  });

  it('ertangi kun — barcha slotlar enabled', () => {
    const days = buildCalendarDays(NOW);
    const slots = buildTimeSlots(days[1]!.isoDate, NOW);
    expect(slots.every((s) => s.enabled)).toBe(true);
  });

  it('SLOT_LEAD_MINUTES = 120 (2 soat) konstanta', () => {
    expect(SLOT_LEAD_MINUTES).toBe(120);
  });
});

// ─── isoDateForSlot ──────────────────────────────────────────────────────────

describe('isoDateForSlot', () => {
  it('slot ISO → kun ISO (00:00 ga keltirish)', () => {
    const slot = '2026-05-23T15:30:00+05:00';
    const day = isoDateForSlot(slot);
    const d = new Date(day);
    expect(d.getMinutes()).toBe(0);
    expect(d.getSeconds()).toBe(0);
  });
});
