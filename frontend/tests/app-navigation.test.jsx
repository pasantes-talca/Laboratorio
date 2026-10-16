import React from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import App from '../src/App';

vi.mock('../src/services/api', () => ({
  getResponsables: vi.fn().mockResolvedValue([]),
  getMarcas: vi.fn().mockResolvedValue([]),
  getTanques: vi.fn().mockResolvedValue([]),
  getResponsablesJarabe: vi.fn().mockResolvedValue([]),
  getSabores: vi.fn().mockResolvedValue([]),
  getJarabeSimples: vi.fn().mockResolvedValue([]),
  getControlesBebida: vi.fn().mockResolvedValue([]),
  getControlesJarabe: vi.fn().mockResolvedValue([]),
  getControlesTorque: vi.fn().mockResolvedValue([]),
  getActiveProduction: vi.fn().mockResolvedValue({
    linea: 1, turno: 'Mañana', sabor: '', concentrado: '', tamano: '', version: 0,
  }),
  saveActiveProduction: vi.fn().mockResolvedValue({}),
}));

beforeEach(() => {
  window.history.replaceState(null, '', '/portal');
  localStorage.clear();
});

it('navega desde el menú lateral y actualiza la URL y el módulo activo', async () => {
  render(<App />);
  const nav = screen.getByRole('navigation', { name: 'Secciones del laboratorio' });
  expect(nav).toBeInTheDocument();
  expect(document.querySelector('.header-nav')).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Agua' }));
  await waitFor(() => expect(window.location.pathname).toBe('/agua'));
  expect(screen.getByRole('button', { name: 'Agua' })).toHaveClass('active');
  expect(within(nav).getByRole('button', { name: 'Control Físico Químico' })).toHaveAttribute('aria-current', 'page');
  expect(await screen.findByRole('heading', { name: 'Control de Agua' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Sala de Jarabe' }));
  await waitFor(() => expect(window.location.pathname).toBe('/jarabe'));
  expect(screen.getByRole('button', { name: 'Sala de Jarabe' })).toHaveClass('active');
  expect(within(nav).getByRole('button', { name: 'Jarabe Simple' })).toHaveAttribute('aria-current', 'page');
});

it('abre un formulario del sidebar, sincroniza las pestañas y respeta la URL directa', async () => {
  window.history.replaceState(null, '', '/agua/analisis-cloro');
  render(<App />);
  const nav = screen.getByRole('navigation', { name: 'Secciones del laboratorio' });
  expect(within(nav).getByRole('button', { name: 'Análisis de Cloro' })).toHaveAttribute('aria-current', 'page');
  expect(await screen.findByRole('button', { name: 'Registrar Análisis' })).toBeInTheDocument();
  expect(window.location.pathname).toBe('/agua/analisis-cloro');

  fireEvent.click(within(nav).getByRole('button', { name: 'Filtro de Arena' }));
  expect(window.location.pathname).toBe('/agua/filtro-arena');
  expect(within(nav).getByRole('button', { name: 'Filtro de Arena' })).toHaveAttribute('aria-current', 'page');
});

it('conserva Registrar Pausa y quita los botones de línea del control de calidad', async () => {
  window.history.replaceState(null, '', '/calidad/jarabe');
  render(<App />);
  expect(await screen.findByRole('button', { name: 'Registrar Control de Jarabe' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Registrar Pausa' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Línea 1' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Línea 2' })).not.toBeInTheDocument();
});

it('oculta el bloque de línea en Inicio y Exportar CSV en Dashboard', async () => {
  render(<App />);
  expect(await screen.findByText('Sistema Integrado de Calidad y Procesos')).toBeInTheDocument();
  expect(screen.queryByText('Línea en operación:')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Dashboard' }));
  await screen.findByRole('heading', { name: 'Dashboard' });
  expect(screen.queryByRole('button', { name: 'Exportar CSV' })).not.toBeInTheDocument();
});

it('las tarjetas de Inicio abren su formulario concreto', async () => {
  render(<App />);
  fireEvent.click(await screen.findByRole('heading', { name: 'Control de Jarabe' }));
  expect(window.location.pathname).toBe('/calidad/jarabe');
  expect(await screen.findByRole('button', { name: 'Registrar Control de Jarabe' })).toBeInTheDocument();
});

it('cambia de formulario desde el sidebar sin duplicar las pestañas', async () => {
  window.history.replaceState(null, '', '/calidad/bebida');
  render(<App />);
  const nav = screen.getByRole('navigation', { name: 'Secciones del laboratorio' });
  await screen.findByRole('main');
  expect(document.querySelector('.tabs-container')).not.toBeInTheDocument();
  fireEvent.click(within(nav).getByRole('button', { name: 'Control de Torque' }));
  expect(window.location.pathname).toBe('/calidad/torque');
  expect(within(nav).getByRole('button', { name: 'Control de Torque' })).toHaveAttribute('aria-current', 'page');
});
