import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { fetchJson } from '../../../services/api';
import JarabeDashboardPage from './JarabeDashboardPage';

vi.mock('../../../services/api', () => ({ fetchJson: vi.fn() }));
const board = {
  tanques: [
    { tanque: '1', estado: 'preparando', motivo: 'Preparación en curso.', movimientos: { simple: { fecha: '2026-10-22', hora: '08:00' } } },
    { tanque: '2', estado: 'apto', motivo: 'Saneo finalizado.', movimientos: { saneo: { fecha: '2026-10-23', hora_fin: '09:00', completo: true } } },
    { tanque: '3', estado: 'sin_datos', motivo: 'Sin movimientos.', movimientos: {} },
  ], resumen: { preparando: 1, apto: 1, sin_datos: 1 }, sin_tanque_asignado: true,
};
function response(endpoint) {
  const type = new URLSearchParams(endpoint.split('?')[1]).get('tipo') || 'simple';
  return {
    opciones: { meses: ['2026-10'], fechas: ['2026-10-22'], tanques: ['1', '2'], sabores: ['Naranja'] },
    estado_tanques: board,
    historial: { registros: [{ tipo: type, id: 1, tanque: '1', fecha: '2026-10-22', hora: '08:00', sabor: 'Naranja', responsables: ['Ana'], cargado_en: '2026-10-22T08:10:00-03:00', bolsas: 40 }], total: 30 },
  };
}
beforeEach(() => { fetchJson.mockReset(); fetchJson.mockImplementation(async endpoint => response(endpoint)); });

it('shows tank states and allows searching readiness without mixing history filters', async () => {
  render(<JarabeDashboardPage />);
  await screen.findByRole('article', { name: 'Tanque 1' });
  expect(screen.getByRole('article', { name: 'Tanque 2' })).toHaveTextContent('Apto según saneo');
  expect(screen.getByRole('article', { name: 'Tanque 3' })).toHaveTextContent('Sin registros');
  expect(screen.queryByRole('heading', { name: 'Ingredientes registrados' })).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'apto' } });
  expect(screen.getAllByRole('article')).toHaveLength(1);
  expect(screen.getByRole('article', { name: 'Tanque 2' })).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Estado'), { target: { value: '' } });
  fireEvent.change(screen.getByLabelText('Formulario'), { target: { value: 'parte' } });
  await waitFor(() => expect(fetchJson.mock.lastCall[0]).toContain('tipo=parte'));
  await screen.findByRole('article', { name: 'Tanque 1' });
  expect(screen.getAllByRole('article')).toHaveLength(3);
  expect(screen.getByRole('cell', { name: 'Parte de jarabe' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
  await waitFor(() => expect(fetchJson.mock.lastCall[0]).toContain('offset=25'));
  await screen.findByRole('article', { name: 'Tanque 1' });
  fireEvent.change(screen.getByLabelText('Formulario'), { target: { value: 'saneo' } });
  await waitFor(() => {
    expect(fetchJson.mock.lastCall[0]).toContain('tipo=saneo');
    expect(fetchJson.mock.lastCall[0]).toContain('offset=0');
  });
});

it('recovers from errors and opens the next form for a preparing tank', async () => {
  fetchJson.mockRejectedValueOnce(new Error('Sin conexión'));
  const navigate = vi.fn();
  render(<JarabeDashboardPage onNavigate={navigate} />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Sin conexión');
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  const tank = await screen.findByRole('article', { name: 'Tanque 1' });
  fireEvent.click(within(tank).getByRole('button', { name: 'Abrir jarabe terminado' }));
  expect(navigate).toHaveBeenCalledWith('jarabe', 'terminado');
});
