import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Hammer, UserRound } from 'lucide-react';
import { RoleSelector } from './role-selector';

const OPTIONS = [
  {
    value: 'client' as const,
    label: 'Mijoz',
    subtitle: 'Xizmat topaman',
    icon: UserRound,
  },
  {
    value: 'pro' as const,
    label: 'Usta',
    subtitle: "Xizmat ko'rsataman",
    icon: Hammer,
  },
];

describe('RoleSelector', () => {
  it('radiogroup semantikasini render qiladi', () => {
    render(<RoleSelector value={undefined} onChange={() => {}} options={OPTIONS} />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it("har bir rolning label va subtitle'ini ko'rsatadi", () => {
    render(<RoleSelector value={undefined} onChange={() => {}} options={OPTIONS} />);
    expect(screen.getByText('Mijoz')).toBeInTheDocument();
    expect(screen.getByText('Xizmat topaman')).toBeInTheDocument();
    expect(screen.getByText('Usta')).toBeInTheDocument();
    expect(screen.getByText("Xizmat ko'rsataman")).toBeInTheDocument();
  });

  it('tanlangan rolni aria-checked=true qiladi', () => {
    render(<RoleSelector value="pro" onChange={() => {}} options={OPTIONS} />);
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
    expect(radios[1]).toHaveAttribute('aria-checked', 'true');
  });

  it('click bilan onChange chaqiradi', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RoleSelector value={undefined} onChange={onChange} options={OPTIONS} />);
    await user.click(screen.getAllByRole('radio')[0]!);
    expect(onChange).toHaveBeenCalledWith('client');
  });

  it('Enter tugmasi bilan onChange chaqiradi', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RoleSelector value={undefined} onChange={onChange} options={OPTIONS} />);
    const radio = screen.getAllByRole('radio')[1]!;
    radio.focus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('pro');
  });

  it('Space tugmasi bilan onChange chaqiradi', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RoleSelector value={undefined} onChange={onChange} options={OPTIONS} />);
    const radio = screen.getAllByRole('radio')[0]!;
    radio.focus();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledWith('client');
  });

  it("radiogroup'da aria-label mavjud", () => {
    render(<RoleSelector value={undefined} onChange={() => {}} options={OPTIONS} />);
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', 'Rolingizni tanlang');
  });
});
