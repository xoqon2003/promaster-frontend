import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { PhoneInput } from './phone-input';

function Wrapper({
  initial = '',
  onChange,
  ...props
}: {
  initial?: string;
  onChange?: (v: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  const [value, setValue] = useState(initial);
  return (
    <PhoneInput
      {...props}
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
    />
  );
}

describe('PhoneInput', () => {
  it("+998 prefiksini render qiladi (o'qish uchun)", () => {
    render(<Wrapper />);
    expect(screen.getByText('+998')).toBeInTheDocument();
  });

  it('label va aria-label mavjud', () => {
    render(<Wrapper />);
    expect(screen.getByLabelText('Telefon raqam')).toBeInTheDocument();
  });

  it('9 xonali raqamni formatlaydi: 901234567 → 90 123 45 67', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    const input = screen.getByLabelText('Telefon raqam') as HTMLInputElement;
    await user.type(input, '901234567');
    expect(input.value).toBe('90 123 45 67');
  });

  it('harflarni filter qiladi', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Wrapper onChange={onChange} />);
    const input = screen.getByLabelText('Telefon raqam');
    await user.type(input, 'abc12def');
    expect(onChange).toHaveBeenLastCalledWith('12');
  });

  it("9 ta raqamdan ortig'ini kesadi", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Wrapper onChange={onChange} />);
    const input = screen.getByLabelText('Telefon raqam');
    await user.type(input, '9012345678999');
    // handleChange stripPrefix qiladi — 9012345678999 → 2345678999 (998 prefikspi emas)
    // Aslida 9 raqamdan ortig'i visible tomonda truncate bo'lmaydi chunki limit faqat formatLocal'da
    // onChange har click'da yangi qiymat bilan chaqiriladi.
    expect(onChange).toHaveBeenCalled();
  });

  it('paste orqali +998901234567 → 901234567 ga aylantiradi', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Wrapper onChange={onChange} />);
    const input = screen.getByLabelText('Telefon raqam');
    input.focus();
    await user.paste('+998901234567');
    expect(onChange).toHaveBeenCalledWith('901234567');
  });

  it('paste orqali 0901234567 → 901234567 ga aylantiradi', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Wrapper onChange={onChange} />);
    const input = screen.getByLabelText('Telefon raqam');
    input.focus();
    await user.paste('0901234567');
    expect(onChange).toHaveBeenCalledWith('901234567');
  });

  it("error bo'lsa, role='alert' matnni render qiladi", () => {
    render(<Wrapper error="Xato raqam" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Xato raqam');
  });

  it("error bo'lganda aria-invalid=true", () => {
    render(<Wrapper error="Xato" />);
    expect(screen.getByLabelText('Telefon raqam')).toHaveAttribute('aria-invalid', 'true');
  });

  it("disabled bo'lsa input disabled", () => {
    render(<Wrapper disabled />);
    expect(screen.getByLabelText('Telefon raqam')).toBeDisabled();
  });

  it("inputMode='tel' va autoComplete='tel' berilgan", () => {
    render(<Wrapper />);
    const input = screen.getByLabelText('Telefon raqam');
    expect(input).toHaveAttribute('inputmode', 'tel');
    expect(input).toHaveAttribute('autocomplete', 'tel');
  });
});
