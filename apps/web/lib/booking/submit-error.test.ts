/**
 * T4.11 — `classifySubmitError` unit tests.
 */
import { describe, expect, it } from 'vitest';

import { classifySubmitError } from './submit-error';

describe('classifySubmitError', () => {
  it("validation: contact.phone xatosi → kind='validation', step=5", () => {
    const err = new Error(
      "BookingDraft validation failed: contact.phone: Telefon +998 XX XXX XX XX shaklida bo'lishi kerak",
    );
    const info = classifySubmitError(err);
    expect(info.kind).toBe('validation');
    expect(info.redirectStep).toBe(5);
    expect(info.retryable).toBe(false);
    expect(info.message).toContain("Ma'lumotlarda xato");
  });

  it('validation: addressSlot.slotAt xatosi → step=2', () => {
    const err = new Error(
      "BookingDraft validation failed: addressSlot.slotAt: Slot kamida 2 soat keyin bo'lishi kerak",
    );
    expect(classifySubmitError(err).redirectStep).toBe(2);
  });

  it('validation: service.description xatosi → step=1', () => {
    const err = new Error('BookingDraft validation failed: service.description: too long');
    expect(classifySubmitError(err).redirectStep).toBe(1);
  });

  it("incomplete draft → kind='incomplete', step=1", () => {
    const err = new Error(
      'BookingDraft is incomplete: masterId, service, addressSlot, contact required',
    );
    const info = classifySubmitError(err);
    expect(info.kind).toBe('incomplete');
    expect(info.redirectStep).toBe(1);
    expect(info.retryable).toBe(false);
  });

  it("master not found → kind='master-not-found'", () => {
    const err = new Error('Master not found: m_x');
    const info = classifySubmitError(err);
    expect(info.kind).toBe('master-not-found');
    expect(info.retryable).toBe(false);
    expect(info.redirectStep).toBeUndefined();
  });

  it("server contract drift → kind='server-contract', retryable=true", () => {
    const err = new Error('Booking schema rejection (server contract drift): ...');
    const info = classifySubmitError(err);
    expect(info.kind).toBe('server-contract');
    expect(info.retryable).toBe(true);
  });

  it.each(['Failed to fetch', 'Network error', 'Connection timeout', 'Request aborted'])(
    "network error: '%s' → kind='network', retryable=true",
    (msg) => {
      const info = classifySubmitError(new Error(msg));
      expect(info.kind).toBe('network');
      expect(info.retryable).toBe(true);
    },
  );

  it("noma'lum xato → kind='unknown', retryable=true", () => {
    const info = classifySubmitError(new Error('Strange error xyz'));
    expect(info.kind).toBe('unknown');
    expect(info.retryable).toBe(true);
  });

  it('non-Error value (string) ham qabul qilinadi', () => {
    const info = classifySubmitError('plain string error');
    expect(info.kind).toBe('unknown');
    expect(info.message).toContain('plain string error');
  });
});
