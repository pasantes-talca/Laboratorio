import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { fetchJson } from '../../../services/api';
import AguaDashboardPage from './AguaDashboardPage';

vi.mock('../../../services/api', () => ({ fetchJson: vi.fn() }));
const result = {
  opciones: { meses: ['2026-10'], fechas: ['2026-10-22'], grupos: ['Pozo', 'Tratada'] },
  conteos: { 'fisico-quimico': 3, 'analisis-cloro': 2, 'osmosis-inversa': 1, 'filtro-arena': 0 },
  metricas: [{ campo: 'ph', titulo: 'pH', unidad: '' }],
  series: [{ fecha: '2026-10-22', grupo: 'Pozo', ph: 7 }, { fecha: '2026-10-22', grupo: 'Tratada', ph: 8 }],
  historial: { registros: [{ id: 1, fecha_control: '2026-10-22', tipo_agua: 'Pozo', ph: 0, responsable: 'Ana' }], total: 30 },
};
beforeEach(() => { fetchJson.mockReset(); fetchJson.mockResolvedValue(result); });

it('separates water groups and resets pagination and group when switching forms', async () => {
  render(<AguaDashboardPage />);
  await screen.findByRole('img', { name: /Evolución de pH/ });
  expect(screen.getByText('Ana')).toBeInTheDocument();
  expect(screen.getByRole('cell', { name: '0' })).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Tipo de agua'), { target: { value: 'Pozo' } });
  await waitFor(() => expect(fetchJson.mock.lastCall[0]).toContain('grupo=Pozo'));
  await screen.findByRole('img', { name: /Evolución/ });
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
  await waitFor(() => expect(fetchJson.mock.lastCall[0]).toContain('offset=25'));
  await screen.findByRole('img', { name: /Evolución/ });
  fireEvent.click(screen.getByRole('button', { name: /Análisis de cloro/ }));
  await waitFor(() => {
    expect(fetchJson.mock.lastCall[0]).toContain('tipo=analisis-cloro');
    expect(fetchJson.mock.lastCall[0]).toContain('offset=0');
    expect(fetchJson.mock.lastCall[0]).not.toContain('grupo=');
  });
});

it('recovers from errors and opens the selected input form', async () => {
  fetchJson.mockRejectedValueOnce(new Error('Sin conexión'));
  const navigate = vi.fn();
  render(<AguaDashboardPage onNavigate={navigate} />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Sin conexión');
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  await screen.findByRole('img', { name: /Evolución/ });
  fireEvent.click(screen.getByRole('button', { name: /Registrar control/ }));
  expect(navigate).toHaveBeenCalledWith('agua', 'fisicoQuimico');
});
