import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ProductionProvider, useProduction } from './ProductionContext';

const STORAGE_KEY = 'calidad_active_production';

const DEFAULT_STATE = {
  linea: 'linea1',
  turno: 'Mañana',
  nocheSubturno: '',
  sabor: '',
  tipoConcentrado: '',
  tamano: '',
  loteTapa: '',
};

function wrapper({ children }) {
  return <ProductionProvider>{children}</ProductionProvider>;
}

beforeEach(() => {
  localStorage.clear();
});

describe('useProduction', () => {
  it('throws when used outside ProductionProvider', () => {
    expect(() => renderHook(() => useProduction())).toThrow(
      'useProduction must be used within ProductionProvider'
    );
  });

  it('provides defaults when localStorage is empty', () => {
    const { result } = renderHook(() => useProduction(), { wrapper });

    expect(result.current.production).toEqual(DEFAULT_STATE);
    expect(result.current.isModalOpen).toBe(false);
  });

  it('rehydrates from pre-seeded localStorage merged over defaults', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ sabor: 'COLA', turno: 'Noche' })
    );

    const { result } = renderHook(() => useProduction(), { wrapper });

    // seeded fields win, unspecified fields keep defaults
    expect(result.current.production).toEqual({
      ...DEFAULT_STATE,
      sabor: 'COLA',
      turno: 'Noche',
    });
  });

  it('falls back to defaults when stored value is corrupt JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');

    const { result } = renderHook(() => useProduction(), { wrapper });
    expect(result.current.production).toEqual(DEFAULT_STATE);
  });

  it('updateProduction merges partial data and persists to localStorage', () => {
    const { result } = renderHook(() => useProduction(), { wrapper });

    act(() => {
      result.current.updateProduction({ sabor: 'SODA', linea: 'linea2' });
    });

    expect(result.current.production).toEqual({
      ...DEFAULT_STATE,
      sabor: 'SODA',
      linea: 'linea2',
    });

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored.sabor).toBe('SODA');
    expect(stored.linea).toBe('linea2');
  });

  it('successive updates accumulate without losing previous keys', () => {
    const { result } = renderHook(() => useProduction(), { wrapper });

    act(() => {
      result.current.updateProduction({ sabor: 'MANZANA' });
    });
    act(() => {
      result.current.updateProduction({ tamano: '500 ml' });
    });

    expect(result.current.production.sabor).toBe('MANZANA');
    expect(result.current.production.tamano).toBe('500 ml');
    expect(localStorage.getItem(STORAGE_KEY)).toContain('"tamano":"500 ml"');
  });

  it('openModal / closeModal toggle isModalOpen', () => {
    const { result } = renderHook(() => useProduction(), { wrapper });

    act(() => {
      result.current.openModal();
    });
    expect(result.current.isModalOpen).toBe(true);

    act(() => {
      result.current.closeModal();
    });
    expect(result.current.isModalOpen).toBe(false);
  });
});
