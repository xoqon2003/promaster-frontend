/**
 * Slot picker matematikasi — vaqt tanlash uchun yordamchi funksiyalar.
 *
 * Task: T4.05
 *
 * Qoidalar:
 *  - Slot uzunligi: 30 daqiqa
 *  - Ish vaqti: 09:00 - 21:00 (kunduzgi xizmatlar uchun)
 *  - Lead vaqt: hozirdan +2 soat (`SLOT_LEAD_MINUTES`)
 *  - Kalendar oraligi: 7 kun (bugun + 6)
 *  - Toshkent timezone (+05:00) — UTC string ham qaytariladi
 */
import { SLOT_LEAD_MINUTES } from './schemas';

// ─── Constants ───────────────────────────────────────────────────────────────

export const SLOT_DURATION_MINUTES = 30;
export const WORKING_HOUR_START = 9; // 09:00
export const WORKING_HOUR_END = 21; // 21:00 (oxirgi slot 20:30 da)
export const CALENDAR_DAYS = 7;

// ─── Day model ───────────────────────────────────────────────────────────────

export interface CalendarDay {
  /** UTC ISO date (00:00:00 Toshkent) — kalit sifatida ishlatiladi. */
  isoDate: string;
  /** "Bugun" / "Ertaga" / "Sht 27 Apr" kabi label. */
  label: string;
  /** Bu kun bugun? */
  isToday: boolean;
}

const DAYS_SHORT = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Sht'];
const MONTHS_SHORT = [
  'Yan',
  'Fev',
  'Mar',
  'Apr',
  'May',
  'Iyn',
  'Iyl',
  'Avg',
  'Sen',
  'Okt',
  'Noy',
  'Dek',
];

function formatDayLabel(date: Date, isToday: boolean, isTomorrow: boolean): string {
  if (isToday) return 'Bugun';
  if (isTomorrow) return 'Ertaga';
  const d = DAYS_SHORT[date.getDay()];
  const m = MONTHS_SHORT[date.getMonth()];
  return `${d} ${date.getDate()} ${m}`;
}

/**
 * Hozirdan boshlab `CALENDAR_DAYS` kun ro'yxatini qaytaradi.
 * Vaqt qismi 00:00 ga o'rnatiladi (faqat sana muhim).
 */
export function buildCalendarDays(now: Date): CalendarDay[] {
  const days: CalendarDay[] = [];
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < CALENDAR_DAYS; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const isToday = i === 0;
    const isTomorrow = i === 1;
    days.push({
      isoDate: date.toISOString(),
      label: formatDayLabel(date, isToday, isTomorrow),
      isToday,
    });
  }

  return days;
}

// ─── Slot model ──────────────────────────────────────────────────────────────

export interface TimeSlot {
  /** ISO datetime (UTC bilan offset) — submit'da shu yoziladi. */
  isoDateTime: string;
  /** "09:00" formatida UI label. */
  label: string;
  /** Bu slot tanlanish uchun ochiqmi (cutoff'dan keyin)? */
  enabled: boolean;
}

/**
 * Bir kun uchun barcha 30-daqiqali slot ro'yxati.
 *
 * Cutoff: hozirdan + `SLOT_LEAD_MINUTES`. Bundan oldingi slotlar
 * `enabled: false` bilan qaytadi (UI'da disabled rendered).
 */
export function buildTimeSlots(dayIso: string, now: Date): TimeSlot[] {
  const dayStart = new Date(dayIso);
  const cutoff = new Date(now.getTime() + SLOT_LEAD_MINUTES * 60 * 1000);

  const slots: TimeSlot[] = [];
  for (let h = WORKING_HOUR_START; h < WORKING_HOUR_END; h += 1) {
    for (let m = 0; m < 60; m += SLOT_DURATION_MINUTES) {
      const slot = new Date(dayStart);
      slot.setHours(h, m, 0, 0);
      const enabled = slot.getTime() >= cutoff.getTime();
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      slots.push({
        isoDateTime: slot.toISOString(),
        label: `${hh}:${mm}`,
        enabled,
      });
    }
  }
  return slots;
}

/**
 * `slotAt` ISO ga bog'liq bo'lgan kun (kalendar tugmasi uchun).
 */
export function isoDateForSlot(slotAtIso: string): string {
  const d = new Date(slotAtIso);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
