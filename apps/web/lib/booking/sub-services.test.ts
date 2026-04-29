/**
 * T4.04 — `sub-services` helper tests.
 */
import { describe, expect, it } from 'vitest';

import { findSubServiceLabel, getSubServices } from './sub-services';

describe('getSubServices', () => {
  it('elektrik — ≥4 sub-xizmat', () => {
    const list = getSubServices('elektrik');
    expect(list.length).toBeGreaterThanOrEqual(4);
    expect(list[0]?.id).toBeTruthy();
    expect(list[0]?.label).toBeTruthy();
  });

  it('santexnik / remont / dizayn — bo`sh emas', () => {
    expect(getSubServices('santexnik').length).toBeGreaterThan(0);
    expect(getSubServices('remont').length).toBeGreaterThan(0);
    expect(getSubServices('dizayn').length).toBeGreaterThan(0);
  });

  it("notanish kategoriya — fallback 'Boshqa'", () => {
    const list = getSubServices('quantum-physics');
    expect(list).toHaveLength(1);
    expect(list[0]?.id).toBe('boshqa');
  });

  it('har sub-service unikal ID', () => {
    const list = getSubServices('elektrik');
    const ids = new Set(list.map((s) => s.id));
    expect(ids.size).toBe(list.length);
  });
});

describe('findSubServiceLabel', () => {
  it('mavjud sub — label qaytadi', () => {
    expect(findSubServiceLabel('elektrik', 'rozetka-almashtirish')).toBe('Rozetka almashtirish');
  });

  it("yo'q sub — null", () => {
    expect(findSubServiceLabel('elektrik', 'noma-lum-id')).toBeNull();
  });

  it('notanish kategoriya + boshqa — label qaytadi', () => {
    expect(findSubServiceLabel('xxx', 'boshqa')).toBe('Boshqa');
  });
});
