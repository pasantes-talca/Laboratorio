import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ProductionProvider, useProduction } from './ProductionContext';
import { getActiveProduction, saveActiveProduction } from '../services/api';

vi.mock('../services/api', () => ({ getActiveProduction: vi.fn(), saveActiveProduction: vi.fn() }));

const first = { linea: 1, turno: 'Mañana', sabor: 'Cola', concentrado: 'XQ', tamano: '3L', version: 1 };
const second = { linea: 2, turno: 'Tarde', sabor: 'Soda', concentrado: 'TALCA', tamano: '500ml', version: 4 };
const wrapper = ({ children }) => <ProductionProvider>{children}</ProductionProvider>;

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  localStorage.clear();
  getActiveProduction.mockImplementation(async (line) => line === 1 ? first : second);
});

describe('producción por línea', () => {
  it('carga del servidor y conserva la línea elegida en este puesto', async () => {
    const { result } = renderHook(() => useProduction(), { wrapper });
    await waitFor(() => expect(result.current.productionReady).toBe(true));
    expect(result.current.production.sabor).toBe('Cola');
    act(() => result.current.selectLine('linea2'));
    await waitFor(() => expect(result.current.production.sabor).toBe('Soda'));
    expect(result.current.production.version).toBe(4);
    expect(sessionStorage.getItem('calidad_selected_line')).toBe('linea2');
    expect(getActiveProduction).toHaveBeenCalledWith(2);
    expect(localStorage.getItem('calidad_active_production')).toBeNull();
  });

  it('guarda solo la línea seleccionada con su versión', async () => {
    saveActiveProduction.mockResolvedValue({ ...second, version: 5, turno: 'Noche' });
    const { result } = renderHook(() => useProduction(), { wrapper });
    await waitFor(() => expect(result.current.productionReady).toBe(true));
    act(() => result.current.selectLine('linea2'));
    await waitFor(() => expect(result.current.production.version).toBe(4));
    await act(async () => result.current.saveProduction('linea2', {
      turno: 'Noche', sabor: 'Soda', tipoConcentrado: 'TALCA', tamano: '500ml',
    }, 4));
    expect(saveActiveProduction).toHaveBeenCalledWith(2, expect.objectContaining({ expected_version: 4, turno: 'Noche' }));
    expect(saveActiveProduction.mock.calls[0][1]).not.toHaveProperty('lote_tapa');
    expect(result.current.production.version).toBe(5);
    act(() => result.current.selectLine('linea1'));
    expect(result.current.production.sabor).toBe('Cola');
  });

  it('recarga la versión nueva cuando otro puesto cambió la producción', async () => {
    const conflict = Object.assign(new Error('La producción cambió'), { status: 409 });
    saveActiveProduction.mockRejectedValue(conflict);
    const { result } = renderHook(() => useProduction(), { wrapper });
    await waitFor(() => expect(result.current.productionReady).toBe(true));
    getActiveProduction.mockResolvedValue({ ...first, version: 2, sabor: 'Pomelo' });
    await act(async () => {
      await expect(result.current.saveProduction('linea1', {
        turno: 'Mañana', sabor: 'Cola', tipoConcentrado: 'XQ', tamano: '3L',
      }, 1)).rejects.toBe(conflict);
    });
    await waitFor(() => expect(result.current.production.version).toBe(2));
    expect(result.current.production.sabor).toBe('Pomelo');
  });
});
