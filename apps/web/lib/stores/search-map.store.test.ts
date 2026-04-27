/**
 * T3.18 — `searchMapStore` unit tests.
 *
 * Qamrov:
 *  - Boshlang'ich holat: hoveredMasterId === null
 *  - setHoveredMasterId(id) — qiymat yangilanadi
 *  - setHoveredMasterId(null) — tozalash ishlaydi
 *  - Ketma-ket chaqiriqlar: oxirgi qiymat saqlanadi
 *  - Subscriber'lar yangi qiymatni oladi
 *  - Bir xil qiymatni qayta yozish — referensial barqarorlik
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useSearchMapStore } from './search-map.store';

// Har testdan keyin store'ni standart holatiga qaytaramiz (test izolyatsiyasi)
afterEach(() => {
  useSearchMapStore.setState({ hoveredMasterId: null });
});

describe('searchMapStore — initial state', () => {
  it("hoveredMasterId boshlang'ichda null", () => {
    expect(useSearchMapStore.getState().hoveredMasterId).toBeNull();
  });

  it('setHoveredMasterId — funksiya', () => {
    expect(typeof useSearchMapStore.getState().setHoveredMasterId).toBe('function');
  });
});

describe('searchMapStore — setHoveredMasterId', () => {
  it('ID berilganda hoveredMasterId yangilanadi', () => {
    useSearchMapStore.getState().setHoveredMasterId('m-42');
    expect(useSearchMapStore.getState().hoveredMasterId).toBe('m-42');
  });

  it('null berilganda hoveredMasterId tozalanadi', () => {
    useSearchMapStore.getState().setHoveredMasterId('m-1');
    expect(useSearchMapStore.getState().hoveredMasterId).toBe('m-1');

    useSearchMapStore.getState().setHoveredMasterId(null);
    expect(useSearchMapStore.getState().hoveredMasterId).toBeNull();
  });

  it('ketma-ket chaqiriqlarda oxirgi qiymat saqlanadi', () => {
    const { setHoveredMasterId } = useSearchMapStore.getState();

    setHoveredMasterId('m-1');
    setHoveredMasterId('m-2');
    setHoveredMasterId('m-3');

    expect(useSearchMapStore.getState().hoveredMasterId).toBe('m-3');
  });
});

describe('searchMapStore — subscribers', () => {
  it("subscribe orqali o'zgarishlar tarqaladi", () => {
    const listener = vi.fn();
    const unsubscribe = useSearchMapStore.subscribe(listener);

    useSearchMapStore.getState().setHoveredMasterId('m-99');

    expect(listener).toHaveBeenCalledTimes(1);
    const [nextState, prevState] = listener.mock.lastCall!;
    expect(nextState.hoveredMasterId).toBe('m-99');
    expect(prevState.hoveredMasterId).toBeNull();

    unsubscribe();
  });

  it('unsubscribe — listener boshqa chaqirilmaydi', () => {
    const listener = vi.fn();
    const unsubscribe = useSearchMapStore.subscribe(listener);
    unsubscribe();

    useSearchMapStore.getState().setHoveredMasterId('m-1');

    expect(listener).not.toHaveBeenCalled();
  });
});
