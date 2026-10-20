import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import AdminPage from './AdminPage';
import { AuthContext } from '../../context/AuthContext';
import { fetchJson } from '../../services/httpClient';
import { previewCatalogue, createExamples } from './preview';

vi.mock('../../services/httpClient', () => ({ fetchJson: vi.fn() }));
beforeEach(() => vi.resetAllMocks());

it('requires administrator identity before requesting real data', () => {
  render(<AdminPage />);
  expect(screen.getByText(/Ingresá con una cuenta/)).toBeInTheDocument();
  expect(fetchJson).not.toHaveBeenCalled();
});

it('offers all forms, edits sample data and keeps sample history without network writes', async () => {
  render(<AdminPage preview />);
  expect(await screen.findAllByRole('button', { name: /Ver \/ editar/ })).toHaveLength(3);
  expect(screen.getByText('Vista de ejemplo')).toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('button', { name: /Ver \/ editar/ })[0]);
  let dialog = screen.getByRole('dialog');
  fireEvent.change(within(dialog).getByLabelText('Presión del rinser'), { target: { value: '3.5' } });
  fireEvent.change(within(dialog).getByLabelText('Motivo de la modificación *'), { target: { value: 'Revisión del instrumento' } });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar cambio de prueba' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  fireEvent.click(screen.getAllByRole('button', { name: /Ver \/ editar/ })[0]);
  dialog = screen.getByRole('dialog');
  expect(within(dialog).getByLabelText('Presión del rinser')).toHaveValue(3.5);
  fireEvent.click(within(dialog).getByRole('tab', { name: /Historial/ }));
  expect(within(dialog).getByText('Revisión del instrumento')).toBeInTheDocument();
  fireEvent.keyDown(document, { key: 'Escape' });
  for (const module of ['calidad', 'jarabe', 'agua', 'saneado']) {
    fireEvent.change(screen.getByLabelText('Módulo'), { target: { value: module } });
    expect(within(screen.getByLabelText('Formulario')).getAllByRole('option')).toHaveLength(previewCatalogue.filter(f => f.module === module).length);
  }
  expect(fetchJson).not.toHaveBeenCalled();
});

it('sends only changed values, version and reason; preserves edits on conflict', async () => {
  const row = createExamples()['agua-cloro'][0];
  fetchJson.mockImplementation(endpoint => Promise.resolve(endpoint === '/admin/catalogo' ? previewCatalogue : endpoint.includes('?') ? { items: [row], total: 1 } : row));
  render(<AuthContext.Provider value={{ user: { username: 'admin', role: 'administrador' } }}><AdminPage /></AuthContext.Provider>);
  fireEvent.click(await screen.findByRole('button', { name: /Ver \/ editar/ }));
  const dialog = await screen.findByRole('dialog');
  fireEvent.change(within(dialog).getByLabelText('Presión del rinser'), { target: { value: '4.2' } });
  fireEvent.change(within(dialog).getByLabelText('Motivo de la modificación *'), { target: { value: 'Revisión del dato' } });
  fetchJson.mockRejectedValueOnce(Object.assign(new Error('Otra persona modificó este registro'), { status: 409 }));
  fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar cambios' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Otra persona');
  expect(within(dialog).getByLabelText('Presión del rinser')).toHaveValue(4.2);
  expect(fetchJson).toHaveBeenLastCalledWith(`/admin/agua-cloro/registros/${row.id}`, { method: 'PATCH', body: JSON.stringify({ valores: { acondicionamiento_rinser: 4.2 }, motivo: 'Revisión del dato', expected_version: 1 }) });
  expect(within(dialog).getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();
});

it('applies filters on the server and clears them', async () => {
  fetchJson.mockImplementation(endpoint => Promise.resolve(endpoint === '/admin/catalogo' ? previewCatalogue : { items: [], total: 0 }));
  render(<AuthContext.Provider value={{ user: { username: 'admin', role: 'administrador' } }}><AdminPage /></AuthContext.Provider>);
  await screen.findByText('No hay registros que coincidan con la búsqueda.');
  await waitFor(() => expect(screen.getByRole('button', { name: 'Buscar' })).toBeEnabled());
  expect(fetchJson).toHaveBeenLastCalledWith('/admin/agua-cloro/registros?offset=0&limit=25', expect.anything());
  fireEvent.change(screen.getByLabelText('Ingresado por'), { target: { value: 'ana' } });
  fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
  await waitFor(() => expect(fetchJson).toHaveBeenLastCalledWith(expect.stringContaining('usuario=ana'), expect.anything()));
  fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }));
  await waitFor(() => expect(screen.getByLabelText('Ingresado por')).toHaveValue(''));
});
