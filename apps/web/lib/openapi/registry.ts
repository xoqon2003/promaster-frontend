/**
 * OpenAPI registry — auth API hujjatlash uchun zod schema'lar va path'lar.
 *
 * Task: T5.11 (S05 Backend Foundation)
 *
 * Source-of-truth: zod schema'lar (`lib/auth/schemas.ts`). Bu fayl shu
 * schema'larni `extendZodWithOpenApi` orqali metadata qo'shadi va
 * endpoint'larni registratsiya qiladi.
 *
 * Generate:
 *   pnpm --filter web openapi:gen
 *   → docs/api/auth.openapi.yaml
 *
 * Schema drift detection: zod schema o'zgarib YAML regenerate qilinmasa,
 * `.github/workflows/openapi-drift.yml` PR'da git diff orqali ushlaydi.
 */
// MUHIM: extend-zod side-effect import — `.openapi()` metodi schemas
// import qilinishidan oldin qo'shilishi kerak (ESM module-graph ordering)
import './extend-zod';

import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import {
  OtpCodeSchema,
  OtpVerifySchema,
  PhoneSchema,
  SessionUserSchema,
  SignupSchema,
  UserRoleSchema,
} from '@/lib/auth/schemas';

// ─── Registry ────────────────────────────────────────────────────────────────

export const registry = new OpenAPIRegistry();

// ─── Schema registratsiyasi ──────────────────────────────────────────────────

registry.register(
  'Phone',
  PhoneSchema.openapi({
    description: "O'zbek telefon raqami E.164 formatda",
    example: '+998901234567',
  }),
);

registry.register(
  'UserRole',
  UserRoleSchema.openapi({
    description: 'Foydalanuvchi roli',
    example: 'client',
  }),
);

registry.register(
  'SessionUser',
  SessionUserSchema.openapi({
    description: 'NextAuth session ichidagi foydalanuvchi ma`lumotlari',
  }),
);

registry.register(
  'OtpCode',
  OtpCodeSchema.openapi({
    description: '6 raqamli OTP kod',
    example: '123456',
  }),
);

registry.register(
  'OtpVerify',
  OtpVerifySchema.openapi({
    description: 'OTP tasdiqlash so`rovi (NextAuth Credentials provider input)',
  }),
);

registry.register(
  'Signup',
  SignupSchema.openapi({
    description: 'Profile yangilash so`rovi (rol + ism)',
  }),
);

// ─── Path registratsiyalari ──────────────────────────────────────────────────

const SendOtpRequestSchema = z
  .object({
    phone: PhoneSchema,
  })
  .openapi('SendOtpRequest');

const SendOtpResponseSchema = z
  .object({
    ok: z.literal(true),
    expiresAt: z.number().int().openapi({
      description: 'Unix timestamp (ms) — OTP muddati',
      example: 1714400000000,
    }),
  })
  .openapi('SendOtpResponse');

const ErrorResponseSchema = z
  .object({
    error: z.string().openapi({ example: "SMS yuborib bo'lmadi" }),
    details: z.array(z.unknown()).optional(),
  })
  .openapi('ErrorResponse');

const SessionResponseSchema = z
  .object({
    user: SessionUserSchema.optional().openapi({
      description: 'Logged-in foydalanuvchi (yo`q bo`lsa session bo`sh)',
    }),
    expires: z.string().datetime({ offset: true }).optional(),
  })
  .openapi('SessionResponse');

const UpdateProfileResponseSchema = z
  .object({
    ok: z.literal(true),
    user: SessionUserSchema,
  })
  .openapi('UpdateProfileResponse');

const CsrfResponseSchema = z
  .object({
    csrfToken: z.string().openapi({ example: 'abc123def456' }),
  })
  .openapi('CsrfResponse');

// ─── Endpoint paths ──────────────────────────────────────────────────────────

// POST /api/auth/send-otp — bizning custom endpoint (T5.05)
registry.registerPath({
  method: 'post',
  path: '/api/auth/send-otp',
  description: 'OTP kod yuborish (mock yoki Eskiz SMS)',
  tags: ['Auth'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: SendOtpRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'OTP yuborildi',
      content: {
        'application/json': {
          schema: SendOtpResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid request — telefon raqami noto`g`ri format',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    502: {
      description: 'SMS provider xatosi (Eskiz down yoki timeout)',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

// GET /api/auth/csrf — NextAuth built-in
registry.registerPath({
  method: 'get',
  path: '/api/auth/csrf',
  description: 'CSRF token olish. NextAuth `Credentials` provider sign-in oldidan kerak.',
  tags: ['Auth (NextAuth)'],
  responses: {
    200: {
      description: 'CSRF token',
      content: { 'application/json': { schema: CsrfResponseSchema } },
    },
  },
});

// POST /api/auth/callback/otp — NextAuth Credentials provider
registry.registerPath({
  method: 'post',
  path: '/api/auth/callback/otp',
  description:
    'OTP kod bilan login. NextAuth `signIn("otp", { phone, code })` ' +
    'shu endpoint`ga POST qiladi. Muvaffaqiyatda `next-auth.session-token` ' +
    'cookie o`rnatiladi.',
  tags: ['Auth (NextAuth)'],
  request: {
    body: {
      required: true,
      content: {
        'application/x-www-form-urlencoded': {
          schema: OtpVerifySchema.extend({
            csrfToken: z.string(),
            callbackUrl: z.string().optional(),
            json: z.literal('true').optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Login muvaffaqiyatli (session-token cookie o`rnatildi)',
    },
    302: {
      description: 'Login muvaffaqiyatli — callbackUrl`ga redirect',
    },
    401: {
      description: 'OTP noto`g`ri yoki muddati o`tgan',
    },
  },
});

// GET /api/auth/session — NextAuth built-in
registry.registerPath({
  method: 'get',
  path: '/api/auth/session',
  description:
    'Joriy session ma`lumotlarini olish. Cookie orqali. Logout bo`lsa ' + 'bo`sh `{}` qaytadi.',
  tags: ['Auth (NextAuth)'],
  responses: {
    200: {
      description: 'Session ma`lumotlari',
      content: { 'application/json': { schema: SessionResponseSchema } },
    },
  },
});

// POST /api/auth/signout — NextAuth built-in
registry.registerPath({
  method: 'post',
  path: '/api/auth/signout',
  description: 'Session cookie`ni tozalash. CSRF token kerak.',
  tags: ['Auth (NextAuth)'],
  request: {
    body: {
      content: {
        'application/x-www-form-urlencoded': {
          schema: z.object({
            csrfToken: z.string(),
            callbackUrl: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    302: {
      description: 'Logout — callbackUrl`ga redirect (default `/login`)',
    },
  },
});

// PATCH /api/users/me — bizning custom endpoint (T5.05)
registry.registerPath({
  method: 'patch',
  path: '/api/users/me',
  description:
    'Joriy user`ning profilini yangilash (signup form submit). ' +
    'Authorization: NextAuth session cookie majburiy.',
  tags: ['Users'],
  security: [{ sessionCookie: [] }],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: SignupSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Profile yangilandi',
      content: {
        'application/json': {
          schema: UpdateProfileResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid body — name yoki role noto`g`ri format',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    401: {
      description: 'Unauthorized — session cookie yo`q',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    500: {
      description: 'DB yoki internal error',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

// ─── Security scheme ─────────────────────────────────────────────────────────

registry.registerComponent('securitySchemes', 'sessionCookie', {
  type: 'apiKey',
  in: 'cookie',
  name: 'next-auth.session-token',
  description: 'NextAuth JWT session token cookie. Login`dan keyin avtomatik o`rnatiladi.',
});
