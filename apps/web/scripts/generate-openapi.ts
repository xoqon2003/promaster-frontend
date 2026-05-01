/**
 * OpenAPI YAML generator — registry'dan spec'ni hosil qiladi.
 *
 * Task: T5.11 (S05 Backend Foundation)
 *
 * Run:
 *   pnpm --filter web openapi:gen
 *
 * Output:
 *   ../../docs/api/auth.openapi.yaml (frontend repo'da)
 *
 * CI'da auto-regen + git diff drift check:
 *   .github/workflows/openapi-drift.yml
 */
import { OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stringify } from 'yaml';

import { registry } from '../lib/openapi/registry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, '../../../docs/api/auth.openapi.yaml');

const generator = new OpenApiGeneratorV31(registry.definitions);

const document = generator.generateDocument({
  openapi: '3.1.0',
  info: {
    title: 'Promaster Auth API',
    version: '0.5.0',
    description:
      'UstaTop.uz / Promaster — autentifikatsiya endpoint`lari.\n\n' +
      'S05 Backend Foundation sprint`ida yaratilgan. NextAuth v5 + ' +
      'custom OTP Credentials provider. Mock yoki Eskiz.uz SMS adapter.\n\n' +
      'Source-of-truth: `apps/web/lib/auth/schemas.ts` zod schema`lar. ' +
      'Bu YAML auto-generated — qo`lda tahrirlamang.\n\n' +
      'Regenerate: `pnpm --filter @ustatop/web openapi:gen`',
    contact: {
      name: 'Promaster',
      url: 'https://github.com/xoqon2003/promaster-frontend',
    },
  },
  servers: [
    { url: 'https://promaster.vercel.app', description: 'Staging' },
    { url: 'http://localhost:3000', description: 'Local dev' },
  ],
  tags: [
    { name: 'Auth', description: 'Custom auth endpoint`lar (Promaster-specific)' },
    {
      name: 'Auth (NextAuth)',
      description: 'NextAuth v5 built-in endpoint`lar (handlers)',
    },
    { name: 'Users', description: 'User profile boshqaruvi' },
  ],
});

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
const yamlStr = stringify(document, { lineWidth: 100 });
writeFileSync(OUTPUT_PATH, yamlStr, 'utf8');

const lineCount = yamlStr.split('\n').length;
// eslint-disable-next-line no-console -- script output, not app log
console.log(`✅ OpenAPI generated: ${OUTPUT_PATH}`);
// eslint-disable-next-line no-console -- script output, not app log
console.log(`   ${lineCount} lines, ${Object.keys(document.paths ?? {}).length} paths`);
