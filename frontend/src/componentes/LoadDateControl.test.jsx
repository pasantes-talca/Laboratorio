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

function user() {
  return userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
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
  it('shows only a button until the user asks to load another day', async () => {
    const actor = user();
    setup();
    const toggle = screen.getByRole('button', { name: /cargar datos de fecha pasada/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByLabelText(/fecha de carga/i)).toBeNull();

    await actor.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const input = screen.getByLabelText(/fecha de carga/i);
    expect(input).toHaveAttribute('min', '2026-01-01');
    expect(input).toHaveAttribute('max', '2026-11-18');
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('shows a persistent banner for a past date and "Volver a hoy" clears it', async () => {
    const actor = user();
    setup();
    await actor.click(screen.getByRole('button', { name: /cargar datos de fecha pasada/i }));
    await actor.type(screen.getByLabelText(/fecha de carga/i), '2026-11-15');

    expect(screen.getByRole('status')).toHaveTextContent('Cargando datos del 15/11/2026');
    expect(screen.queryByLabelText(/fecha de carga/i)).toBeNull();
    expect(screen.getByRole('button', { name: /15\/11\/2026/ })).toBeInTheDocument();

    await actor.click(screen.getByRole('button', { name: /volver a hoy/i }));
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByRole('button', { name: /cargar datos de fecha pasada/i })).toBeInTheDocument();
  });
});
