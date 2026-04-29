/**
 * NextAuth v5 canonical entry point.
 * Barcha import'lar shu fayldan bo'ladi: `import { auth, signIn, signOut } from '@/auth'`
 */
import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { mockAdapter } from '@/lib/auth/mock-adapter';
import { OtpVerifySchema, SessionUserSchema } from '@/lib/auth/schemas';
import type { UserRole } from '@/lib/auth/schemas';

// ─── Type augmentation ───────────────────────────────────────────────────────

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      phone: string;
      role: UserRole;
    };
  }
}

// ─── NextAuth config ─────────────────────────────────────────────────────────

export const { auth, handlers, signIn, signOut } = NextAuth({
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
        const user = await mockAdapter.verifyOtp(phone, code);
        if (!user) return null;

        const result = SessionUserSchema.safeParse(user);
        if (!result.success) return null;

        return {
          id: result.data.id,
          name: result.data.name ?? null,
          email: `${result.data.id}@mock.ustatop.uz`,
          phone: result.data.phone,
          role: result.data.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as typeof user & { phone: string; role: UserRole };
        token['phone'] = u.phone;
        token['role'] = u.role;
      }
      return token;
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub ?? '',
          phone: (token['phone'] as string | undefined) ?? '',
          role: (token['role'] as UserRole | undefined) ?? 'client',
        },
      };
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
});
