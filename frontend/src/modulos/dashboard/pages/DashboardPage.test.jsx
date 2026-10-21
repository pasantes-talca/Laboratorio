import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import DashboardPage from './DashboardPage';
import { getControlesBebida, getControlesJarabe, getControlesTorque } from '../api/dashboardApi';

vi.mock('../../../context/ProductionContext', () => ({ useProduction: () => ({ production: { linea: 'linea1' } }) }));
vi.mock('../api/dashboardApi', () => ({
  loadAllPages: async getter => getter(), getControlesBebida: vi.fn(), getControlesJarabe: vi.fn(), getControlesTorque: vi.fn(),
}));
beforeEach(() => {
  getControlesBebida.mockResolvedValue([
    { linea: 1, fecha: '2026-10-20', hora: '08:00', marca: 'Cola', concentrado: 'XQ', grados_brix: 7.6, vol_gas: 4.2 },
    { linea: 1, fecha: '2026-10-21', hora: '08:00', marca: 'Naranja', concentrado: 'IFF', grados_brix: 7.3, vol_gas: 3.4 },
  ]);
  getControlesJarabe.mockResolvedValue([]);
  getControlesTorque.mockResolvedValue([]);
});

it('offers all flavors, preserves the selection across filters and returns to a single flavor', async () => {
  render(<DashboardPage />);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Actualizar' })).toBeEnabled());
  const flavor = screen.getByLabelText(/4\. Producto \/ Sabor/);
  expect(screen.getByRole('option', { name: 'Todos los sabores' })).toBeInTheDocument();
  expect(flavor).toHaveValue('todos');
  await waitFor(() => expect(document.querySelector('[data-product-series="naranja-iff"]')).not.toBeNull());
  expect(document.querySelector('[data-product-series="cola-xq"]')).not.toBeNull();
  fireEvent.change(screen.getByLabelText(/3\. Fecha/), { target: { value: '2026-10-20' } });
  expect(flavor).toHaveValue('todos');
  expect(document.querySelector('[data-product-series="naranja-iff"]')).toBeNull();
  expect(document.querySelector('[data-product-series="cola-xq"]')).not.toBeNull();
  fireEvent.change(screen.getByLabelText(/1\. Línea/), { target: { value: 'linea2' } });
  expect(flavor).toHaveValue('todos');
  expect(document.querySelector('[data-product-series]')).toBeNull();
  fireEvent.change(screen.getByLabelText(/1\. Línea/), { target: { value: 'linea1' } });
  fireEvent.change(flavor, { target: { value: 'COLA Red. XQ' } });
  expect(flavor).toHaveValue('COLA Red. XQ');
  expect(screen.queryByText('Todos los sabores:')).not.toBeInTheDocument();
  expect(document.querySelector('svg.control-chart-svg')).not.toBeNull();
});
