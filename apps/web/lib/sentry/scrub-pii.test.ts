import { describe, expect, it } from 'vitest';

import { scrubPhoneDeep, scrubPhoneFromString } from './scrub-pii';

describe('scrubPhoneFromString', () => {
  it('telefon raqamini maskaga almashtiradi', () => {
    expect(scrubPhoneFromString('User +998901234567 logged in')).toBe(
      'User +998********* logged in',
    );
  });

  it('bir necha raqamni almashtiradi', () => {
    expect(scrubPhoneFromString('From +998901234567 to +998937654321')).toBe(
      'From +998********* to +998*********',
    );
  });

  it('raqamsiz string o`zgartirmaydi', () => {
    expect(scrubPhoneFromString('No phone here')).toBe('No phone here');
  });

  it('non-string qiymatni qaytaradi', () => {
    expect(scrubPhoneFromString(42)).toBe(42);
    expect(scrubPhoneFromString(null)).toBeNull();
    expect(scrubPhoneFromString(undefined)).toBeUndefined();
  });

  it('faqat O`zbek (+998) raqamlarini ushlaydi, boshqa kodlar tegmaydi', () => {
    expect(scrubPhoneFromString('Call +12025550100 or +998901234567')).toBe(
      'Call +12025550100 or +998*********',
    );
  });
});

describe('scrubPhoneDeep', () => {
  it('nested object ichidagi raqamni tozalaydi', () => {
    const event = {
      message: 'OTP verify failed for +998901234567',
      extra: {
        phone: '+998901234567',
        user: { id: 'u1', contact: '+998937654321' },
      },
    };

    const scrubbed = scrubPhoneDeep(event);

    expect(scrubbed.message).toBe('OTP verify failed for +998*********');
    expect(scrubbed.extra.phone).toBe('+998*********');
    expect(scrubbed.extra.user.contact).toBe('+998*********');
    expect(scrubbed.extra.user.id).toBe('u1');
  });

  it('array ichidagi raqamni tozalaydi', () => {
    const data = {
      breadcrumbs: [
        { message: 'send-otp +998901234567', level: 'info' },
        { message: 'verify-otp +998937654321', level: 'info' },
      ],
    };

    const scrubbed = scrubPhoneDeep(data);

    expect(scrubbed.breadcrumbs[0]?.message).toBe('send-otp +998*********');
    expect(scrubbed.breadcrumbs[1]?.message).toBe('verify-otp +998*********');
  });

  it('null va primitive qiymatlarni saqlaydi', () => {
    expect(scrubPhoneDeep(null)).toBeNull();
    expect(scrubPhoneDeep(123)).toBe(123);
    expect(scrubPhoneDeep(true)).toBe(true);
  });

  it('depth limit — circular reference cheksiz emas', () => {
    const obj: { self?: unknown; phone: string } = { phone: '+998901234567' };
    obj.self = obj;
    expect(() => scrubPhoneDeep(obj)).not.toThrow();
  });
});
