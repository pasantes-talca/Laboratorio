import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastContext';

function ToastHarness({ onShow }) {
  const { showToast } = useToast();
  return (
    <button type="button" onClick={() => onShow(showToast)}>
      trigger
    </button>
  );
}

function renderHarness(onShow = (showToast) => showToast('Guardado con éxito', 'success')) {
  return render(
    <ToastProvider>
      <ToastHarness onShow={onShow} />
    </ToastProvider>
  );
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  act(() => {
    vi.runOnlyPendingTimers();
  });
  vi.useRealTimers();
});

describe('ToastContext', () => {
  it('renders the message when a toast is shown', () => {
    renderHarness((showToast) => showToast('Guardado con éxito', 'success'));

    fireEvent.click(screen.getByRole('button', { name: 'trigger' }));

    expect(screen.getByText('Guardado con éxito')).toBeInTheDocument();
  });

  it('applies the type class to the toast element', () => {
    const { container } = renderHarness(
      (showToast) => showToast('Algo falló', 'error')
    );

    fireEvent.click(screen.getByRole('button', { name: 'trigger' }));

    expect(container.querySelector('.toast.error')).toBeInTheDocument();
  });

  it('auto-dismisses after the given duration', () => {
    const { container } = renderHarness(
      (showToast) => showToast('Temporal', 'info', 3500)
    );

    fireEvent.click(screen.getByRole('button', { name: 'trigger' }));
    expect(screen.getByText('Temporal')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3499);
    });
    expect(screen.getByText('Temporal')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByText('Temporal')).not.toBeInTheDocument();
    expect(container.querySelector('.toast')).toBeNull();
  });

  it('can be closed manually via the close button before auto-dismiss', () => {
    const { container } = renderHarness((showToast) => showToast('Ciérrame', 'info'));

    fireEvent.click(screen.getByRole('button', { name: 'trigger' }));
    expect(screen.getByText('Ciérrame')).toBeInTheDocument();

    // each toast renders a single icon-only close button
    const closeButton = container.querySelector('.toast button');
    expect(closeButton).not.toBeNull();
    fireEvent.click(closeButton);

    expect(screen.queryByText('Ciérrame')).not.toBeInTheDocument();
  });

  it('supports multiple simultaneous toasts and dismisses them independently', () => {
    renderHarness((showToast) => {
      showToast('Primero', 'info', 5000);
      showToast('Segundo', 'success', 1000);
    });

    fireEvent.click(screen.getByRole('button', { name: 'trigger' }));
    expect(screen.getByText('Primero')).toBeInTheDocument();
    expect(screen.getByText('Segundo')).toBeInTheDocument();

    // second toast expires first
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByText('Segundo')).not.toBeInTheDocument();
    expect(screen.getByText('Primero')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.queryByText('Primero')).not.toBeInTheDocument();
  });

  it('defaults to info type when no type is provided', () => {
    const { container } = renderHarness((showToast) => showToast('Sin tipo'));

    fireEvent.click(screen.getByRole('button', { name: 'trigger' }));

    expect(container.querySelector('.toast.info')).toBeInTheDocument();
  });
});
