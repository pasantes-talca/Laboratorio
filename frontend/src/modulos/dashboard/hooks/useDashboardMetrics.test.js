import { renderHook } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { useDashboardMetrics } from './useDashboardMetrics';

function metrics(overrides = {}) {
  return renderHook(() => useDashboardMetrics({
    bebidaData: [], jarabeData: [], torqueData: [], selectedLinea: 'linea1',
    selectedMes: 'todos', selectedFecha: 'todas', selectedSabor: 'COLA Red. XQ - KG',
    setSelectedMes: vi.fn(), setSelectedSabor: vi.fn(), ...overrides,
  })).result.current;
}

it('does not turn specification targets into measurements when history is empty', () => {
  const result = metrics();
  expect(result.currentStandard.brix.objetivo).toBeGreaterThan(0);
  expect(result.brixChartData).toEqual([]);
  expect(result.taChartData).toEqual([]);
  expect(result.carbonatacionChartData).toEqual([]);
  expect(result.latestBrix).toBeUndefined();
  expect(result.latestTa).toBeUndefined();
  expect(result.latestCarb).toBeUndefined();
  expect(result.availableMonths).toEqual([]);
});

it('separates syrup measurements by line and excludes legacy records without a line', () => {
  const jarabeData = [
    { linea: 1, sabor: 'Cola', ta: 11, bx_patron: 50, fecha: '2026-10-16', hora: '08:00' },
    { linea: 2, sabor: 'Cola', ta: 22, bx_patron: 60, fecha: '2026-10-16', hora: '08:00' },
    { linea: null, sabor: 'Cola', ta: 33, bx_patron: 70, fecha: '2026-10-16', hora: '08:00' },
  ];
  const result = metrics({ jarabeData });
  expect(result.taChartData.map((point) => point.valor)).toEqual([11]);
  expect(result.brixChartData.map((point) => point.valorSecundario)).toEqual([50]);
  // A syrup reference alone is not a beverage Brix measurement.
  expect(result.latestBrix).toBeUndefined();
});

it('selects the most recent measurement by time even when insertion order differs', () => {
  const result = metrics({ bebidaData: [
    { linea: 1, marca: 'Cola', fecha: '2026-10-16', hora: '07:00', grados_brix: 9, vol_gas: 2 },
    { linea: 1, marca: 'Cola', fecha: '2026-10-16', hora: '10:00', grados_brix: 10, vol_gas: 3 },
    { linea: 2, marca: 'Cola', fecha: '2026-10-16', hora: '11:00', grados_brix: 15, vol_gas: 8 },
  ] });
  expect(result.latestBrix).toBe(10);
  expect(result.latestCarb).toBe(3);
});
