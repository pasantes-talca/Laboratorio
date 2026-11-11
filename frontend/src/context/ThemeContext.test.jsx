import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { THEME_STORAGE_KEY, ThemeProvider, useTheme } from './ThemeContext';

function Harness() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme}>
      tema:{theme}
    </button>
  );
}

function mockMatchMedia(prefersDark) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: prefersDark && query.includes('dark'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

function renderHarness() {
  return render(
    <ThemeProvider>
      <Harness />
    </ThemeProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  delete document.documentElement.dataset.theme;
  mockMatchMedia(false);
});

afterEach(() => {
  delete window.matchMedia;
});

describe('ThemeContext', () => {
  it('usa el valor guardado en localStorage', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    renderHarness();
    expect(screen.getByRole('button')).toHaveTextContent('tema:dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('usa el tema claro por defecto aunque el sistema prefiera oscuro', () => {
    mockMatchMedia(true);
    renderHarness();
    expect(screen.getByRole('button')).toHaveTextContent('tema:light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('usa el tema claro cuando no hay valor guardado', () => {
    delete window.matchMedia;
    renderHarness();
    expect(screen.getByRole('button')).toHaveTextContent('tema:light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('ignora valores inválidos en localStorage', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'sepia');
    renderHarness();
    expect(screen.getByRole('button')).toHaveTextContent('tema:light');
  });

  it('alterna el tema, lo persiste y actualiza data-theme', () => {
    renderHarness();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('tema:dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    fireEvent.click(screen.getByRole('button'));
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('useTheme es seguro fuera del proveedor', () => {
    render(<Harness />);
    expect(screen.getByRole('button')).toHaveTextContent('tema:light');
    fireEvent.click(screen.getByRole('button'));
  });
});
