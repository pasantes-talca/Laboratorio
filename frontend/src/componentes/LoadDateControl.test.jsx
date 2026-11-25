import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoadDateProvider } from '../context/LoadDateContext';
import { LoadDateBanner, LoadDateControl } from './LoadDateControl';

function setup() {
  return render(
    <LoadDateProvider>
      <LoadDateControl />
      <LoadDateBanner />
    </LoadDateProvider>,
  );
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 10, 18, 12, 0, 0));
  sessionStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('LoadDateControl', () => {
  it('restricts the picker to the last 7 days and shows no banner by default', () => {
    setup();
    const input = screen.getByLabelText(/fecha de carga/i);
    expect(input).toHaveAttribute('min', '2026-11-11');
    expect(input).toHaveAttribute('max', '2026-11-18');
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('shows a persistent banner for a past date and "Volver a hoy" clears it', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    setup();
    const input = screen.getByLabelText(/fecha de carga/i);
    await user.type(input, '2026-11-15');
    expect(screen.getByRole('status')).toHaveTextContent('Cargando datos del 15/11/2026');
    await user.click(screen.getByRole('button', { name: /volver a hoy/i }));
    expect(screen.queryByRole('status')).toBeNull();
    expect(input).toHaveValue('');
  });
});
