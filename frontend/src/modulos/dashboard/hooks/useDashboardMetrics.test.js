import { renderHook } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { useDashboardMetrics } from './useDashboardMetrics';
import { findProductStandard } from '../../../data/productStandards';

it('keeps all flavors selected and applies each products specifications with line and date filters', () => {
  const setSelectedSabor = vi.fn();
  const common = { linea: 1, fecha: '2026-10-21', hora: '08:00' };
  const result = metrics({ selectedSabor: 'todos', selectedMes: '2026-10', selectedFecha: '2026-10-21', setSelectedSabor,
    bebidaData: [
      { ...common, marca: 'Cola', concentrado: 'XQ', grados_brix: 7.6, vol_gas: 4.2 },
      { ...common, marca: 'Naranja', concentrado: 'IFF', grados_brix: 7.3, vol_gas: 3.4, hora: '09:00' },
      { ...common, marca: 'Soda', grados_brix: 0, vol_gas: 4.3, hora: '10:00' },
      { ...common, marca: 'Cola', grados_brix: 99, vol_gas: 99, linea: 2 },
      { ...common, marca: 'Cola', grados_brix: 88, vol_gas: 88, fecha: '2026-10-20' },
    ], jarabeData: [
      { ...common, sabor: 'Cola', concentrado: 'XQ', ta: 14, bx_patron: 54 },
      { ...common, sabor: 'Naranja', concentrado: 'IFF', ta: 44, bx_patron: 55 },
      { ...common, sabor: 'Soda', ta: 0, bx_patron: 0 },
      { ...common, sabor: 'Cola', ta: 99, linea: null },
    ],
  });
  expect(setSelectedSabor).not.toHaveBeenCalled();
  expect(result.currentStandard).toBeNull();
  expect(result.brixChartData.filter(p => p.valor !== null).map(p => p.valor)).toEqual([7.6, 7.3]);
  expect(result.taChartData.map(p => p.valor)).toEqual([14, 44]);
  const orange = result.brixChartData.find(p => p.series.key === 'naranja-iff');
  expect(orange.limiteMin).toBe(findProductStandard('Naranja', 'IFF').brix.min);
  expect(orange.series.color).not.toBe(result.brixChartData[0].series.color);
  expect(result.latestCarb).toBe(4.3);
  expect(result.latestCarbPoint.series.key).toBe('soda');
  expect(result.latestBrixPoint.series.key).toBe('naranja-iff');
});

it('keeps the latest torque for each product and head rather than overwriting other flavors', () => {
  const common = { linea: 1, fecha: '2026-10-21', numero_cabezal: 1 };
  const result = metrics({ selectedSabor: 'todos', torqueData: [
    { ...common, sabor: 'Cola', concentrado: 'XQ', hora: '08:00', valor: 15 },
    { ...common, sabor: 'Cola', concentrado: 'XQ', hora: '09:00', valor: 16 },
    { ...common, sabor: 'Naranja', hora: '10:00', valor: 18 },
    { ...common, sabor: 'Sifón', hora: '11:00', valor: 115 },
    { ...common, sabor: 'Soda', linea: 2, valor: 99 },
  ] });
  const values = result.torqueChartData.filter(p => p.valor !== null);
  expect(values.map(p => p.valor)).toEqual([16, 18, 115]);
  expect(values[2].limiteMin).toBe(110);
  expect(values[0].limiteMax).toBe(20);
  expect(result.torqueChartData).toHaveLength(36);
});

it('does not invent Cola limits for unknown flavors in the combined view', () => {
  const result = metrics({ selectedSabor: 'todos', bebidaData: [
    { linea: 1, fecha: '2026-10-21', marca: 'Producto nuevo', vol_gas: 3, grados_brix: 5 },
  ] });
  expect(result.carbonatacionChartData[0].limiteMin).toBeNull();
  expect(result.carbonatacionChartData[0].series.label).toBe('Producto nuevo');
  expect(result.brixChartData[0].limiteMax).toBeNull();
});

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
