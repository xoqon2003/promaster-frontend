/**
 * Side-effect modul — `z` global'iga `.openapi()` metodi qo'shadi.
 *
 * MUHIM: bu modul boshqa schema fayllaridan oldin import qilinishi kerak,
 * aks holda `PhoneSchema.openapi(...)` "is not a function" xatosi
 * berishadi.
 *
 * Foydalanish:
 *   import './extend-zod';                            // birinchi qator!
 *   import { PhoneSchema } from '@/lib/auth/schemas'; // endi .openapi() ishlaydi
 */
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);
