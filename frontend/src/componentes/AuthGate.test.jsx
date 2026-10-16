import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import AuthGate from './AuthGate';
import { fetchJson } from '../services/httpClient';

vi.mock('../services/httpClient', () => ({ fetchJson: vi.fn() }));
beforeEach(() => vi.resetAllMocks());

it('requires login before mounting the application and supports logout', async () => {
  fetchJson.mockResolvedValueOnce({ required: true, user: null });
  render(<AuthGate><p>Datos privados</p></AuthGate>);
  expect(screen.queryByText('Datos privados')).not.toBeInTheDocument();
  await screen.findByRole('button', { name: 'Ingresar' });
  fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'ana' } });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password' } });
  fetchJson.mockResolvedValueOnce({ username: 'ana', role: 'operador' });
  fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
  expect(await screen.findByText('Datos privados')).toBeInTheDocument();
  expect(fetchJson).toHaveBeenCalledWith('/auth/login', expect.objectContaining({ method: 'POST' }));
  fetchJson.mockResolvedValueOnce({ message: 'ok' });
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
  await screen.findByRole('button', { name: 'Ingresar' });
  expect(screen.queryByText('Datos privados')).not.toBeInTheDocument();
});

it('does not grant access when session status cannot be checked', async () => {
  fetchJson.mockRejectedValueOnce(new Error('Sin conexión'));
  render(<AuthGate><p>Datos privados</p></AuthGate>);
  expect(await screen.findByRole('alert')).toHaveTextContent('Sin conexión');
  expect(screen.queryByText('Datos privados')).not.toBeInTheDocument();
  fetchJson.mockResolvedValueOnce({ required: false, user: null });
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar conexión' }));
  await waitFor(() => expect(screen.getByText('Datos privados')).toBeInTheDocument());
});
