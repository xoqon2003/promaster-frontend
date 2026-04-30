/**
 * Duration formatter — Vitest unit tests (S06 T6.06).
 */
import { describe, expect, it } from 'vitest';

import { formatRelativeDuration, formatRelativeFromNow } from './duration';

describe('formatRelativeDuration — uz (default)', () => {
  it("daqiqadan kam → 'hozirgina'", () => {
    expect(formatRelativeDuration(45_000)).toBe('hozirgina');
  });

  it('12 daqiqa', () => {
    expect(formatRelativeDuration(12 * 60_000)).toBe('12 daqiqa');
  });

  it('2 soat', () => {
    expect(formatRelativeDuration(2 * 60 * 60_000)).toBe('2 soat');
  });

  it('1 kun', () => {
    expect(formatRelativeDuration(24 * 60 * 60_000)).toBe('1 kun');
  });

  it("manfiy duration → 'hozirgina' (kelajak vaqt)", () => {
    expect(formatRelativeDuration(-1_000)).toBe('hozirgina');
  });
});

describe('formatRelativeDuration — ru', () => {
  it("'только что'", () => {
    expect(formatRelativeDuration(45_000, 'ru')).toBe('только что');
  });

  it('5 мин', () => {
    expect(formatRelativeDuration(5 * 60_000, 'ru')).toBe('5 мин');
  });

  it('1 день / 2 дня / 5 дней (RU plural)', () => {
    expect(formatRelativeDuration(24 * 60 * 60_000, 'ru')).toBe('1 день');
    expect(formatRelativeDuration(2 * 24 * 60 * 60_000, 'ru')).toBe('2 дня');
    expect(formatRelativeDuration(5 * 24 * 60 * 60_000, 'ru')).toBe('5 дней');
  });
});

describe('formatRelativeDuration — en', () => {
  it("'just now'", () => {
    expect(formatRelativeDuration(45_000, 'en')).toBe('just now');
  });

  it('singular vs plural (1 minute / 5 minutes)', () => {
    expect(formatRelativeDuration(60_000, 'en')).toBe('1 minute');
    expect(formatRelativeDuration(5 * 60_000, 'en')).toBe('5 minutes');
  });

  it('1 hour / 3 hours', () => {
    expect(formatRelativeDuration(60 * 60_000, 'en')).toBe('1 hour');
    expect(formatRelativeDuration(3 * 60 * 60_000, 'en')).toBe('3 hours');
  });
});

describe('formatRelativeFromNow', () => {
  it('ISO string + now param bilan deterministik', () => {
    const now = new Date('2026-05-09T12:00:00Z');
    const past = new Date('2026-05-09T11:48:00Z'); // 12 daqiqa oldin
    expect(formatRelativeFromNow(past, 'uz', now)).toBe('12 daqiqa');
  });

  it('string format date qabul qiladi', () => {
    const now = new Date('2026-05-09T12:00:00Z');
    expect(formatRelativeFromNow('2026-05-09T11:00:00Z', 'en', now)).toBe('1 hour');
  });
});
