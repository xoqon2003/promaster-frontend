/**
 * NextAuth Edge-safe konfiguratsiya (S05 T5.04).
 *
 * Edge runtime (middleware) Node.js API'larsiz ishlaydi → Drizzle, bcrypt,
 * `@neondatabase/serverless` import'lari bundle'ga oqsa, middleware
 * 1 MB chegarasini buzishi yoki silent crash qilishi mumkin.
 *
 * **Strategy: split config**
 *   - `auth.config.ts` (bu fayl) — minimal config: callbacks, pages.
 *     Edge-safe import'larsiz.
 *   - `auth.ts` — full config: `authConfig` + Credentials provider
 *     (DB orqali ishlovchi `getOtpAdapter()`).
 *   - `middleware.ts` — `authConfig` ni `NextAuth(authConfig).auth`
 *     orqali ishlatadi (bundle'da DB code'i yo'q).
 *
 * Reference: https://authjs.dev/guides/edge-compatibility
 */
import type { NextAuthConfig } from 'next-auth';
import type { DefaultSession } from 'next-auth';

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

// ─── Config (edge-safe — no DB imports) ──────────────────────────────────────

export const authConfig = {
  // Providers `auth.ts` da qo'shiladi — middleware'ga DB import oqmaydi
  providers: [],

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
    maxAge: 30 * 24 * 60 * 60, // 30 kun
  },
} satisfies NextAuthConfig;
