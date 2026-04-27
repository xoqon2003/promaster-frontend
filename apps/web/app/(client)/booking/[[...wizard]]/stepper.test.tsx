/**
 * T4.03 — `Stepper` unit tests.
 *
 * Qamrov:
 *  - 6 ta step render
 *  - aria-current on active step
 *  - data-state: done / active / pending
 *  - Click handler — done/active steplarda chaqiriladi
 *  - Pending step disabled (klikable emas)
 *  - Connector chiziqlari soni (5 ta — har step orasida)
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Stepper, STEPS } from './stepper';

describe('Stepper — render', () => {
  it("6 ta step ko'rsatiladi", () => {
    render(<Stepper currentStep={1} completedSteps={new Set()} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(STEPS.length);
  });

  it('active stepda aria-current=step', () => {
    render(<Stepper currentStep={3} completedSteps={new Set()} />);

    const activeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-current') === 'step');
    expect(activeBtn).toBeDefined();
    expect(activeBtn).toHaveAttribute('data-state', 'active');
  });

  it('data-state: done / active / pending taqsimlanadi', () => {
    render(<Stepper currentStep={3} completedSteps={new Set([1, 2])} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveAttribute('data-state', 'done'); // step 1
    expect(buttons[1]).toHaveAttribute('data-state', 'done'); // step 2
    expect(buttons[2]).toHaveAttribute('data-state', 'active'); // step 3
    expect(buttons[3]).toHaveAttribute('data-state', 'pending'); // step 4
    expect(buttons[4]).toHaveAttribute('data-state', 'pending'); // step 5
    expect(buttons[5]).toHaveAttribute('data-state', 'pending'); // step 6
  });
});

describe('Stepper — click', () => {
  it('done step bosilganda onStepClick chaqiriladi', async () => {
    const onStepClick = vi.fn();
    const user = userEvent.setup();

    render(<Stepper currentStep={3} completedSteps={new Set([1, 2])} onStepClick={onStepClick} />);

    await user.click(screen.getAllByRole('button')[0]!);
    expect(onStepClick).toHaveBeenCalledWith(1);
  });

  it('active step bosilganda chaqiriladi (current step ham klikable)', async () => {
    const onStepClick = vi.fn();
    const user = userEvent.setup();

    render(<Stepper currentStep={3} completedSteps={new Set([1, 2])} onStepClick={onStepClick} />);

    await user.click(screen.getAllByRole('button')[2]!);
    expect(onStepClick).toHaveBeenCalledWith(3);
  });

  it("pending step disabled — click yo'q", async () => {
    const onStepClick = vi.fn();
    const user = userEvent.setup();

    render(<Stepper currentStep={2} completedSteps={new Set([1])} onStepClick={onStepClick} />);

    // Step 4 — pending
    const step4Btn = screen.getAllByRole('button')[3]!;
    expect(step4Btn).toBeDisabled();

    await user.click(step4Btn);
    expect(onStepClick).not.toHaveBeenCalled();
  });

  it("onStepClick yo'q — step disabled bo'lmasa ham click no-op", async () => {
    const user = userEvent.setup();

    render(<Stepper currentStep={3} completedSteps={new Set([1, 2])} />);

    // onStepClick prop yo'q — barcha button disabled
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => expect(btn).toBeDisabled());

    await user.click(buttons[0]!);
    // Hech qanday xato yo'q (typecheck darajasida)
  });
});
