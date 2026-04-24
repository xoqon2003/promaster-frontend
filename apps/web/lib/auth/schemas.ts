import { z } from 'zod';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** O'zbek telefon raqamini normallashtiradi → +998XXXXXXXXX */
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('998') && digits.length === 12) return `+${digits}`;
  if (digits.startsWith('0') && digits.length === 10) return `+998${digits.slice(1)}`;
  if (digits.length === 9) return `+998${digits}`;
  return `+${digits}`;
}

// ─── Schemas ─────────────────────────────────────────────────────────────────

/**
 * O'zbek telefon raqami.
 * Qabul qiladi: "+998901234567", "998901234567", "0901234567", "901234567"
 * Qaytaradi:    "+998901234567"
 */
export const PhoneSchema = z
  .string()
  .min(1, 'Telefon raqam kiritilmagan')
  .transform(normalizePhone)
  .pipe(z.string().regex(/^\+998\d{9}$/, "To'g'ri O'zbek telefon raqami kiriting (90 123 45 67)"));

/** 6 xonali OTP kod — faqat raqamlar */
export const OtpCodeSchema = z.string().regex(/^\d{6}$/, "Kod 6 ta raqamdan iborat bo'lishi kerak");

/** OTP tasdiqlash so'rovi */
export const OtpVerifySchema = z.object({
  phone: PhoneSchema,
  code: OtpCodeSchema,
});

/** Foydalanuvchi roli */
export const UserRoleSchema = z.enum(['client', 'pro', 'admin']);
export type UserRole = z.infer<typeof UserRoleSchema>;

/** Ro'yxatdan o'tish formasi */
export const SignupSchema = z.object({
  name: z
    .string()
    .min(2, "Ism kamida 2 harf bo'lishi kerak")
    .max(50, 'Ism 50 harfdan oshmasligi kerak')
    .regex(/^[\p{L}\s'-]+$/u, "Ismda faqat harflar bo'lishi mumkin"),
  role: UserRoleSchema,
});

/** Session'dagi foydalanuvchi ma'lumotlari */
export const SessionUserSchema = z.object({
  id: z.string(),
  phone: z.string(),
  name: z.string().optional(),
  role: UserRoleSchema,
  createdAt: z.string().datetime().optional(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type Phone = z.infer<typeof PhoneSchema>;
export type OtpCode = z.infer<typeof OtpCodeSchema>;
export type OtpVerify = z.infer<typeof OtpVerifySchema>;
export type Signup = z.infer<typeof SignupSchema>;
export type SessionUser = z.infer<typeof SessionUserSchema>;
