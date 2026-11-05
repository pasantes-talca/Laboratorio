import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ProductionProvider } from '../src/context/ProductionContext';
import { ToastProvider } from '../src/context/ToastContext';
import CalidadPage from '../src/modulos/calidad/pages/CalidadPage';
import { getActiveProduction, submitControlBebida, submitControlTorque } from '../src/services/api';

vi.mock('../src/services/api', () => ({
  getResponsables: vi.fn().mockResolvedValue([{ id: 1, nombre_completo: 'Operador Uno' }]),
  getTanques: vi.fn().mockResolvedValue([{ id: 1, numero: '1' }]),
  getActiveProduction: vi.fn(),
  saveActiveProduction: vi.fn().mockResolvedValue({}),
  submitControlBebida: vi.fn().mockResolvedValue({}),
  submitControlJarabe: vi.fn().mockResolvedValue({}),
  submitControlTorque: vi.fn().mockResolvedValue({}),
  submitControlPausa: vi.fn().mockResolvedValue({}),
}));

const production = (overrides = {}) => ({
  linea: 1, turno: 'Mañana', sabor: 'Cola', concentrado: 'XQ', tamano: '3L', version: 1, ...overrides,
});

function renderTorque() {
  return render(
    <ToastProvider>
      <ProductionProvider><CalidadPage initialTab="torque" /></ProductionProvider>
    </ToastProvider>,
  );
}

async function torqueForm() {
  const button = screen.getByRole('button', { name: 'Registrar Torque' });
  await waitFor(() => expect(button).toBeEnabled());
  const form = button.closest('form');
  await waitFor(() => expect(within(form).getByRole('option', { name: 'Operador Uno' })).toBeInTheDocument());
  return form;
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  getActiveProduction.mockResolvedValue(production());
});

describe('Control de torque - color de tapa', () => {
  it.each([
    ['Cola', ['Azul', 'Blanco']],
    ['Pomelo', ['Amarillo', 'Blanco']],
    ['Lima Limón', ['Verde', 'Blanco']],
    ['Naranja', ['Naranja', 'Blanco']],
    ['Manzana', ['Azul', 'Blanco']],
    ['Soda', ['Gris', 'Blanco']],
    ['Sifón', ['Rojo', 'Blanco']],
  ])('offers the flavor color or Blanco for %s', async (sabor, expected) => {
    getActiveProduction.mockResolvedValue(production({ sabor }));
    renderTorque();
    const form = await torqueForm();
    const select = within(form).getByLabelText(/^Color de Tapa/);
    expect(within(select).getAllByRole('option').map((o) => o.textContent)).toEqual(expected);
    expect(select).toHaveValue(expected[0]);
  });

  it('submits Blanco when the operator picks it', async () => {
    renderTorque();
    const form = await torqueForm();
    fireEvent.change(within(form).getByLabelText(/^Color de Tapa/), { target: { value: 'Blanco' } });
    fireEvent.change(within(form).getByLabelText(/^Lote de tapa/), { target: { value: 'LT-1' } });
    fireEvent.change(within(form).getByLabelText(/Respons\./), { target: { value: 'Operador Uno' } });
    fireEvent.change(within(form).getByPlaceholderText('Valor (Ej: 14.5)'), { target: { value: '14.5' } });
    fireEvent.submit(form);
    await waitFor(() => expect(submitControlTorque).toHaveBeenCalledWith(expect.objectContaining({ color: 'Blanco' })));
  });
});

describe('Control de torque - lote de tapa', () => {
  const fillAndSubmit = async (form, lote) => {
    fireEvent.change(within(form).getByLabelText(/Respons\./), { target: { value: 'Operador Uno' } });
    fireEvent.change(within(form).getByPlaceholderText('Valor (Ej: 14.5)'), { target: { value: '14.5' } });
    if (lote !== undefined) fireEvent.change(within(form).getByLabelText(/^Lote de tapa/), { target: { value: lote } });
    fireEvent.submit(form);
  };

  it('requires the lot and sends it trimmed with the torque payload', async () => {
    renderTorque();
    const form = await torqueForm();
    const input = within(form).getByLabelText(/^Lote de tapa/);
    expect(input).toBeRequired();
    expect(form.checkValidity()).toBe(false);
    await fillAndSubmit(form, 'LT-77');
    await waitFor(() => expect(submitControlTorque).toHaveBeenCalledWith(expect.objectContaining({
      lote_tapa: 'LT-77', linea: 'linea1', production_version: 1,
    })));
  });

  it('keeps the lot after submitting and remembers it per line', async () => {
    const first = renderTorque();
    let form = await torqueForm();
    fireEvent.change(within(form).getByLabelText(/^Lote de tapa/), { target: { value: 'TAPA-L1' } });
    expect(localStorage.getItem('calidad_lote_tapa_linea1')).toBe('TAPA-L1');
    await fillAndSubmit(form);
    await waitFor(() => expect(submitControlTorque).toHaveBeenCalled());
    expect(within(form).getByLabelText(/^Lote de tapa/)).toHaveValue('TAPA-L1');
    first.unmount();

    sessionStorage.setItem('calidad_selected_line', 'linea2');
    getActiveProduction.mockResolvedValue(production({ linea: 2 }));
    const second = renderTorque();
    form = await torqueForm();
    expect(within(form).getByLabelText(/^Lote de tapa/)).toHaveValue('');
    fireEvent.change(within(form).getByLabelText(/^Lote de tapa/), { target: { value: 'TAPA-L2' } });
    expect(localStorage.getItem('calidad_lote_tapa_linea2')).toBe('TAPA-L2');
    second.unmount();

    sessionStorage.setItem('calidad_selected_line', 'linea1');
    getActiveProduction.mockResolvedValue(production());
    renderTorque();
    form = await torqueForm();
    expect(within(form).getByLabelText(/^Lote de tapa/)).toHaveValue('TAPA-L1');
  });
});

describe('Bebida terminada - características organolépticas', () => {
  it('offers OK, NOK and N/A with OK as the default', async () => {
    render(
      <ToastProvider>
        <ProductionProvider><CalidadPage initialTab="bebida" /></ProductionProvider>
      </ToastProvider>,
    );
    const button = await screen.findByRole('button', { name: 'Registrar Control de Bebida' });
    await waitFor(() => expect(button).toBeEnabled());
    const select = within(button.closest('form')).getByLabelText(/^Características Organolépticas/);
    expect(within(select).getAllByRole('option').map((o) => o.textContent)).toEqual(['OK', 'NOK', 'N/A']);
    expect(select).toHaveValue('OK');
  });
});
