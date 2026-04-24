import { describe, expect, it } from 'vitest';
import {
  OtpCodeSchema,
  OtpVerifySchema,
  PhoneSchema,
  SessionUserSchema,
  SignupSchema,
  UserRoleSchema,
} from './schemas';

describe('PhoneSchema', () => {
  it('+998 formatini qabul qiladi', () => {
    const result = PhoneSchema.safeParse('+998901234567');
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe('+998901234567');
  });

  it('998 prefiks bilan formatni normallashtiradi', () => {
    const result = PhoneSchema.safeParse('998901234567');
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe('+998901234567');
  });

  it('0 bilan boshlanuvchi raqamni normallashtiradi (0901234567 → +998901234567)', () => {
    const result = PhoneSchema.safeParse('0901234567');
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe('+998901234567');
  });

  it('9 xonali raqamni normallashtiradi (901234567 → +998901234567)', () => {
    const result = PhoneSchema.safeParse('901234567');
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe('+998901234567');
  });

  it("bo'sh string'ni rad etadi", () => {
    const result = PhoneSchema.safeParse('');
    expect(result.success).toBe(false);
  });

  it("noto'g'ri formatni rad etadi", () => {
    const result = PhoneSchema.safeParse('123');
    expect(result.success).toBe(false);
  });

  it("O'zbek raqami bo'lmasa rad etadi", () => {
    const result = PhoneSchema.safeParse('+15551234567');
    expect(result.success).toBe(false);
  });

  it('probel va tire bilan raqamni tozalaydi', () => {
    const result = PhoneSchema.safeParse('+998 90 123-45-67');
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe('+998901234567');
  });
});

describe('OtpCodeSchema', () => {
  it('6 xonali kodni qabul qiladi', () => {
    expect(OtpCodeSchema.safeParse('123456').success).toBe(true);
  });

  it('5 xonali kodni rad etadi', () => {
    expect(OtpCodeSchema.safeParse('12345').success).toBe(false);
  });

  it('7 xonali kodni rad etadi', () => {
    expect(OtpCodeSchema.safeParse('1234567').success).toBe(false);
  });

  it('harfli kodni rad etadi', () => {
    expect(OtpCodeSchema.safeParse('12a456').success).toBe(false);
  });

  it("bo'sh stringni rad etadi", () => {
    expect(OtpCodeSchema.safeParse('').success).toBe(false);
  });
});

describe('OtpVerifySchema', () => {
  it('phone + code kombinatsiyasini qabul qiladi', () => {
    const result = OtpVerifySchema.safeParse({
      phone: '+998901234567',
      code: '123456',
    });
    expect(result.success).toBe(true);
  });

  it("phone bo'lmaganda rad etadi", () => {
    const result = OtpVerifySchema.safeParse({ code: '123456' });
    expect(result.success).toBe(false);
  });

  it("code bo'lmaganda rad etadi", () => {
    const result = OtpVerifySchema.safeParse({ phone: '+998901234567' });
    expect(result.success).toBe(false);
  });
});

describe('UserRoleSchema', () => {
  it.each(['client', 'pro', 'admin'] as const)('%s rolini qabul qiladi', (role) => {
    expect(UserRoleSchema.safeParse(role).success).toBe(true);
  });

  it("noma'lum rolni rad etadi", () => {
    expect(UserRoleSchema.safeParse('guest').success).toBe(false);
  });
});

describe('SignupSchema', () => {
  it("to'liq ma'lumotlarni qabul qiladi", () => {
    const result = SignupSchema.safeParse({ name: 'Bobur', role: 'client' });
    expect(result.success).toBe(true);
  });

  it('qisqa ismni rad etadi (< 2 harf)', () => {
    expect(SignupSchema.safeParse({ name: 'A', role: 'client' }).success).toBe(false);
  });

  it('50 harfdan uzun ismni rad etadi', () => {
    const longName = 'A'.repeat(51);
    expect(SignupSchema.safeParse({ name: longName, role: 'client' }).success).toBe(false);
  });

  it('raqamli ismni rad etadi', () => {
    expect(SignupSchema.safeParse({ name: 'Bobur123', role: 'client' }).success).toBe(false);
  });

  it('Kirill alifbosini qabul qiladi', () => {
    expect(SignupSchema.safeParse({ name: 'Бобур', role: 'pro' }).success).toBe(true);
  });

  it("qo'shma ismni qabul qiladi (tire bilan)", () => {
    expect(SignupSchema.safeParse({ name: 'Ali-Muhammad', role: 'pro' }).success).toBe(true);
  });
});

describe('SessionUserSchema', () => {
  it('minimal foydalanuvchini qabul qiladi', () => {
    const result = SessionUserSchema.safeParse({
      id: 'usr_1',
      phone: '+998901234567',
      role: 'client',
    });
    expect(result.success).toBe(true);
  });

  it("to'liq ma'lumotlarni qabul qiladi", () => {
    const result = SessionUserSchema.safeParse({
      id: 'usr_1',
      phone: '+998901234567',
      name: 'Bobur',
      role: 'pro',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it("id bo'lmaganda rad etadi", () => {
    expect(
      SessionUserSchema.safeParse({
        phone: '+998901234567',
        role: 'client',
      }).success,
    ).toBe(false);
  });
});
