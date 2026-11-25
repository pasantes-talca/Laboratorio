import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import ResponsablesPanel from './ResponsablesPanel';
import AdminPage from './AdminPage';
import { AuthContext } from '../../context/AuthContext';
import { fetchJson } from '../../services/httpClient';
import { previewCatalogue } from './preview';

vi.mock('../../services/httpClient', () => ({ fetchJson: vi.fn() }));

const lists = () => ({
  calidad: [{ id: 1, nombre: 'Moya Luis' }, { id: 2, nombre: 'Diaz Mauro' }],
  agua: [{ id: 3, nombre: 'Moya Luis' }],
  jarabe: [{ id: 4, nombre: 'Gustavo Funes' }],
});

beforeEach(() => { vi.resetAllMocks(); fetchJson.mockResolvedValue(lists()); });
afterEach(() => vi.restoreAllMocks());

it('shows one list per module', async () => {
  render(<ResponsablesPanel />);
  const calidad = await screen.findByRole('region', { name: 'Control de calidad' });
  expect(within(calidad).getByText('Diaz Mauro')).toBeInTheDocument();
  expect(within(screen.getByRole('region', { name: 'Control de Agua' })).getByText('Moya Luis')).toBeInTheDocument();
  expect(within(screen.getByRole('region', { name: 'Preparación de Jarabe' })).getByText('Gustavo Funes')).toBeInTheDocument();
  expect(fetchJson).toHaveBeenCalledWith('/admin/responsables', expect.anything());
});

it('adds a person to the chosen module and reloads the lists', async () => {
  render(<ResponsablesPanel />);
  const agua = await screen.findByRole('region', { name: 'Control de Agua' });
  fetchJson.mockResolvedValueOnce({ id: 9, modulo: 'agua', nombre: 'Perez Juan' });
  fireEvent.change(within(agua).getByLabelText('Nuevo responsable de Control de Agua'), { target: { value: '  Perez Juan ' } });
  fireEvent.click(within(agua).getByRole('button', { name: 'Agregar' }));
  await waitFor(() => expect(fetchJson).toHaveBeenCalledWith('/admin/responsables', { method: 'POST', body: JSON.stringify({ modulo: 'agua', nombre: 'Perez Juan' }) }));
  expect(await screen.findByRole('status')).toHaveTextContent('Perez Juan');
  await waitFor(() => expect(within(agua).getByLabelText('Nuevo responsable de Control de Agua')).toHaveValue(''));
});

it('does not submit an empty name', async () => {
  render(<ResponsablesPanel />);
  const agua = await screen.findByRole('region', { name: 'Control de Agua' });
  expect(within(agua).getByRole('button', { name: 'Agregar' })).toBeDisabled();
});

it('shows the server message when the name is a duplicate', async () => {
  render(<ResponsablesPanel />);
  const calidad = await screen.findByRole('region', { name: 'Control de calidad' });
  fetchJson.mockRejectedValueOnce(Object.assign(new Error('Esa persona ya figura en la lista de este módulo'), { status: 409 }));
  fireEvent.change(within(calidad).getByLabelText('Nuevo responsable de Control de calidad'), { target: { value: 'Moya Luis' } });
  fireEvent.click(within(calidad).getByRole('button', { name: 'Agregar' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('ya figura');
});

it('asks for confirmation before deleting and only then calls the API', async () => {
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
  render(<ResponsablesPanel />);
  const button = await screen.findByRole('button', { name: 'Eliminar a Diaz Mauro de Control de calidad' });
  fireEvent.click(button);
  expect(fetchJson).toHaveBeenCalledTimes(1);
  confirm.mockReturnValue(true);
  fetchJson.mockResolvedValueOnce({ id: 2 });
  fireEvent.click(button);
  await waitFor(() => expect(fetchJson).toHaveBeenCalledWith('/admin/responsables/2', { method: 'DELETE' }));
  await waitFor(() => expect(fetchJson).toHaveBeenCalledTimes(3));
});

it('is reachable from the administration page through the Responsables tab', async () => {
  fetchJson.mockImplementation(endpoint => Promise.resolve(endpoint === '/admin/catalogo' ? previewCatalogue : endpoint === '/admin/responsables' ? lists() : { items: [], total: 0 }));
  render(<AuthContext.Provider value={{ user: { username: 'admin', role: 'administrador' } }}><AdminPage /></AuthContext.Provider>);
  fireEvent.click(await screen.findByRole('tab', { name: 'Responsables' }));
  expect(await screen.findByRole('region', { name: 'Control de calidad' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: 'Registros' }));
  expect(await screen.findByText('Registros del laboratorio')).toBeInTheDocument();
});
