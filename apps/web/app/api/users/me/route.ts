/**
 * `PATCH /api/users/me` — joriy user profile yangilash (S05 T5.05).
 *
 * Signup form submit'da chaqiriladi: rol + ism kiritilgach DB yoki mock
 * store'da user yangilanadi.
 *
 * Authorization: NextAuth session cookie majburiy. Session.user.phone
 * orqali user identifikatsiya qilinadi (id emas — chunki mock id va
 * DB id sintetik farqli bo'lishi mumkin S05 boshida).
 *
 * Provider dispatch:
 *   - `OTP_PROVIDER=mock` → `updateMockUser` (in-memory, dev/test)
 *   - `OTP_PROVIDER=eskiz` → `updateUserProfile` (Drizzle UPDATE)
 *
 * Production'da Vercel env `OTP_PROVIDER=eskiz` qo'yilsa, real DB write.
 */
import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { updateUserProfile } from '@/lib/auth/db-adapter';
import { updateMockUser } from '@/lib/auth/mock-adapter';
import { SignupSchema } from '@/lib/auth/schemas';

export async function PATCH(request: Request) {
  // 1. Auth check
  const session = await auth();
  if (!session?.user?.phone) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Body parsing + validation
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = SignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.issues },
      { status: 400 },
    );
  }

  // 3. Provider-aware update
  const provider = process.env.OTP_PROVIDER ?? 'mock';
  try {
    if (provider === 'eskiz') {
      const updated = await updateUserProfile(session.user.phone, parsed.data);
      return NextResponse.json({ ok: true, user: updated });
    } else {
      const updated = updateMockUser(session.user.phone, parsed.data);
      return NextResponse.json({ ok: true, user: updated });
    }
  } catch (err) {
    console.error('[users/me PATCH] error:', err);
    return NextResponse.json({ error: "Profil yangilab bo'lmadi" }, { status: 500 });
  }
}
