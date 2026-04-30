/**
 * NextAuth v5 canonical entry point.
 * Barcha import'lar shu fayldan bo'ladi: `import { auth, signIn, signOut } from '@/auth'`
 *
 * S05 T5.04 — `getOtpAdapter()` env switcher (mock | eskiz).
 *
 * **Edge-safe split** — `auth.config.ts` minimal config (middleware
 * uchun), `auth.ts` (bu fayl) full config Credentials provider bilan
 * (DB import'lar shu yerda). Middleware bu fayl'ni import qilmaydi.
 *
 * **`@auth/drizzle-adapter` ataylab ishlatilmadi** — bu adapter NextAuth'ning
 * standart `users`/`accounts`/`sessions` jadvallarini yaratadi (OAuth +
 * database session strategiyalari uchun). Bizda:
 *   - Custom OTP Credentials provider (OAuth yo'q)
 *   - JWT session strategiyasi (DB session yo'q)
 *   - O'z `users` jadvali (`lib/db/schema/users.ts`) custom shape bilan
 *     (`role` enum, `phone` E.164, `name` nullable)
 *
 * User persistence `getOtpAdapter().verifyOtp` ichida `findOrCreateUserByPhone`
 * orqali boshqariladi — duplicate storage'siz, single source-of-truth.
 *
 * Kelajakda OAuth (MyID.uz S07) yoki revoke imkoniyatli DB session (S08+)
 * kerak bo'lsa, `@auth/drizzle-adapter` qo'shiladi va schema migration
 * bilan jadvallar yaratiladi.
 */
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { authConfig } from '@/auth.config';
import { getOtpAdapter } from '@/lib/auth/otp-adapter';
import { OtpVerifySchema, SessionUserSchema } from '@/lib/auth/schemas';

// ─── NextAuth config ─────────────────────────────────────────────────────────

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: 'otp',
      name: 'OTP',
      credentials: {
        phone: { label: 'Telefon', type: 'tel' },
        code: { label: 'OTP Kod', type: 'text' },
      },
      async authorize(credentials) {
        const parsed = OtpVerifySchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { phone, code } = parsed.data;
        // `OTP_PROVIDER` env'iga qarab mock yoki eskiz adapter chaqiriladi.
        // Default `mock` — Eskiz aktivatsiya defer (planning Q1).
        const user = await getOtpAdapter().verifyOtp(phone, code);
        if (!user) return null;

        const result = SessionUserSchema.safeParse(user);
        if (!result.success) return null;

        return {
          id: result.data.id,
          name: result.data.name ?? null,
          // NextAuth `email` maydon NOT NULL — DB user'da email yo'q,
          // shuning uchun synthetic placeholder. Frontend'da ishlatilmaydi.
          email: `${result.data.id}@mock.ustatop.uz`,
          phone: result.data.phone,
          role: result.data.role,
        };
      },
    }),
  ],
});
