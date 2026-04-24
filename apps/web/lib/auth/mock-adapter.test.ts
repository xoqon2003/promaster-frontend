import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockAdapter, updateMockUser } from './mock-adapter';

describe('mockAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendOtp', () => {
    it('expiresAt ni qaytaradi', async () => {
      const { expiresAt } = await mockAdapter.sendOtp('+998901234567');
      expect(expiresAt).toBeTypeOf('number');
      expect(expiresAt).toBeGreaterThan(Date.now());
    });

    it('2 daqiqalik muddat beradi (~120_000 ms)', async () => {
      const before = Date.now();
      const { expiresAt } = await mockAdapter.sendOtp('+998901234567');
      const delta = expiresAt - before;
      expect(delta).toBeGreaterThanOrEqual(119_000);
      expect(delta).toBeLessThanOrEqual(121_000);
    });
  });

  describe('verifyOtp', () => {
    it("to'g'ri kod bilan foydalanuvchini qaytaradi", async () => {
      const user = await mockAdapter.verifyOtp('+998901234999', '123456');
      expect(user).not.toBeNull();
      expect(user?.phone).toBe('+998901234999');
      expect(user?.role).toBe('client');
    });

    it("noto'g'ri kod bilan null qaytaradi", async () => {
      const user = await mockAdapter.verifyOtp('+998901234567', '000000');
      expect(user).toBeNull();
    });

    it('bir xil telefon raqam bir xil foydalanuvchini qaytaradi', async () => {
      const u1 = await mockAdapter.verifyOtp('+998901111111', '123456');
      const u2 = await mockAdapter.verifyOtp('+998901111111', '123456');
      expect(u1?.id).toBe(u2?.id);
    });
  });

  describe('refreshUser', () => {
    it("mavjud foydalanuvchini id bo'yicha qaytaradi", async () => {
      const created = await mockAdapter.verifyOtp('+998902222222', '123456');
      expect(created).not.toBeNull();
      const refreshed = await mockAdapter.refreshUser(created!.id);
      expect(refreshed?.id).toBe(created!.id);
    });

    it("noma'lum id uchun null qaytaradi", async () => {
      const user = await mockAdapter.refreshUser('unknown_id');
      expect(user).toBeNull();
    });
  });
});

describe('updateMockUser', () => {
  it('ism va rolni yangilaydi', async () => {
    await mockAdapter.verifyOtp('+998903333333', '123456');
    const updated = updateMockUser('+998903333333', {
      name: 'Bobur',
      role: 'pro',
    });
    expect(updated.name).toBe('Bobur');
    expect(updated.role).toBe('pro');
  });

  it('faqat berilgan maydonlarni yangilaydi (qisman patch)', async () => {
    await mockAdapter.verifyOtp('+998904444444', '123456');
    updateMockUser('+998904444444', { name: 'Bobur' });
    const updated = updateMockUser('+998904444444', { role: 'pro' });
    expect(updated.name).toBe('Bobur');
    expect(updated.role).toBe('pro');
  });

  it("foydalanuvchi mavjud bo'lmasa yaratadi", () => {
    const updated = updateMockUser('+998905555555', {
      name: 'Yangi',
      role: 'client',
    });
    expect(updated.name).toBe('Yangi');
    expect(updated.role).toBe('client');
  });
});
