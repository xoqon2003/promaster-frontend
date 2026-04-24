import '@testing-library/jest-dom/vitest';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { expect } from 'vitest';

// jest-axe matchers ni vitest expect'ga qo'shish
expect.extend(toHaveNoViolations);

// axe konfiguratsiya (global)
export const axe = configureAxe({
  rules: {
    // Storybook test env'da ba'zi qoidalar noto'g'ri ishga tushadi
    'color-contrast': { enabled: false }, // CSS variables resolved emas
    region: { enabled: false },
  },
});
