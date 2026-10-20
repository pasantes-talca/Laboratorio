import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import AuthGate, { AdminAccess } from './AuthGate';
import { fetchJson } from '../services/httpClient';

vi.mock('../services/httpClient', () => ({ fetchJson: vi.fn() }));
beforeEach(() => vi.resetAllMocks());

it('requires login before mounting the application and supports logout', async () => {
  fetchJson.mockResolvedValueOnce({ required: true, user: null });
  render(<AuthGate><p>Formulario público</p><AdminAccess><p>Datos privados</p></AdminAccess></AuthGate>);
  expect(screen.getByText('Formulario público')).toBeInTheDocument();
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
  render(<AuthGate><p>Formulario público</p><AdminAccess><p>Datos privados</p></AdminAccess></AuthGate>);
  expect(await screen.findByRole('alert')).toHaveTextContent('Sin conexión');
  expect(screen.queryByText('Datos privados')).not.toBeInTheDocument();
  expect(screen.getByText('Formulario público')).toBeInTheDocument();
  fetchJson.mockResolvedValueOnce({ required: true, user: { username: 'admin', role: 'administrador' } });
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar conexión' }));
  await waitFor(() => expect(screen.getByText('Datos privados')).toBeInTheDocument());
});

it('keeps forms available without login and after session expiry', async () => {
  fetchJson.mockResolvedValueOnce({ required: true, user: null });
  render(<AuthGate><p>Formulario público</p></AuthGate>);
  expect(screen.getByText('Formulario público')).toBeInTheDocument();
  await waitFor(() => expect(fetchJson).toHaveBeenCalledWith('/auth/session'));
  fireEvent(window, new Event('laboratorio:session-expired'));
  expect(screen.getByText('Formulario público')).toBeInTheDocument();
  expect(screen.queryByLabelText('Contraseña')).not.toBeInTheDocument();
});
