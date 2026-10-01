import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ProductionProvider } from '../src/context/ProductionContext';
import { ToastProvider } from '../src/context/ToastContext';
import CalidadPage from '../src/modulos/calidad/pages/CalidadPage';
import SalaJarabePage from '../src/modulos/jarabe/pages/SalaJarabePage';
import AguaPage from '../src/modulos/agua/pages/AguaPage';
import AreaSaneadoPage from '../src/modulos/saneado/pages/AreaSaneadoPage';
import {
  getJarabeSimples,
  submitControlJarabe,
  submitJarabeSimple,
  submitControlFisicoQuimico,
  submitSalaSaneado,
} from '../src/services/api';

vi.mock('../src/services/api', () => ({
  getResponsables: vi.fn().mockResolvedValue([{ id: 1, nombre_completo: 'Operador Uno' }]),
  getResponsablesJarabe: vi.fn().mockResolvedValue([{ id: 1, nombre_completo: 'Operador Uno' }]),
  getTanques: vi.fn().mockResolvedValue([{ id: 1, numero: '1' }]),
  getSabores: vi.fn().mockResolvedValue([]),
  getMarcas: vi.fn().mockResolvedValue([]),
  getJarabeSimples: vi.fn().mockResolvedValue([]),
  submitControlJarabe: vi.fn().mockResolvedValue({}),
  submitJarabeSimple: vi.fn().mockResolvedValue({}),
  submitControlFisicoQuimico: vi.fn().mockResolvedValue({}),
  submitSalaSaneado: vi.fn().mockResolvedValue({}),
}));

function renderPage(page) {
  return render(
    <ToastProvider>
      <ProductionProvider>{page}</ProductionProvider>
    </ToastProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  getJarabeSimples.mockResolvedValue([]);
});

describe('ingreso de datos en formularios', () => {
  it('guarda el control de jarabe con números y datos de producción', async () => {
    localStorage.setItem('calidad_active_production_v2', JSON.stringify({
      activeLine: 'linea1',
      linea1: { turno: 'Mañana', sabor: 'Cola', tipoConcentrado: 'Concentrado A' },
    }));
    renderPage(<CalidadPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Control de Jarabe' }));
    const form = screen.getByRole('button', { name: 'Registrar Control de Jarabe' }).closest('form');
    expect(form.checkValidity()).toBe(false);
    await waitFor(() => expect(within(form).getByRole('option', { name: 'Tanque 1' })).toBeInTheDocument());
    fireEvent.change(form.querySelector('input[type="time"]'), { target: { value: '08:30' } });
    fireEvent.change(form.querySelectorAll('select')[0], { target: { value: '1' } });
    fireEvent.change(within(form).getByPlaceholderText('Ej: 54.20'), { target: { value: '54.20' } });
    fireEvent.change(within(form).getByPlaceholderText('Ej: 1.25'), { target: { value: '1.25' } });
    fireEvent.change(form.querySelectorAll('select')[1], { target: { value: 'Operador Uno' } });
    expect(form.checkValidity()).toBe(true);
    fireEvent.submit(form);
    await waitFor(() => expect(submitControlJarabe).toHaveBeenCalledWith(expect.objectContaining({
      hora: '08:30', tanque: '1', bx_patron: 54.2, ta: 1.25,
      responsable: 'Operador Uno', sabor: 'Cola', concentrado: 'Concentrado A',
      linea: 'linea1', turno: 'Mañana',
    })));
  });

  it('guarda Jarabe Simple con el volcado sugerido y las marcas ingresadas', async () => {
    getJarabeSimples.mockResolvedValue([{ volcado_numero: 2 }]);
    renderPage(<SalaJarabePage />);
    const form = document.getElementById('simple-form');
    await waitFor(() => expect(screen.getByText('Tanque 1')).toBeInTheDocument());
    fireEvent.change(document.querySelector('select[form="simple-form"]'), { target: { value: '1' } });
    await waitFor(() => expect(within(form).getByText(/sugerido: 3/)).toBeInTheDocument());
    expect(form.querySelector('input[type="number"]').value).toBe('3');
    fireEvent.change(within(form).getByPlaceholderText('Ej: 80'), { target: { value: '80' } });
    fireEvent.change(within(form).getByPlaceholderText('Ej: Ledesma, Tabacal...'), { target: { value: 'Ledesma' } });
    fireEvent.change(within(form).getByRole('combobox'), { target: { value: 'Operador Uno' } });
    expect(form.checkValidity()).toBe(true);
    fireEvent.submit(form);
    await waitFor(() => expect(submitJarabeSimple).toHaveBeenCalledWith(expect.objectContaining({
      tanque: '1', volcado_numero: 3, cantidad_bolsas: 80,
      azucar_marca: 'Ledesma', responsables: ['Operador Uno'],
    })));
  });

  it('exige los valores del control físico químico y envía los números ingresados', async () => {
    renderPage(<AguaPage />);
    const form = screen.getByRole('button', { name: 'Registrar Control' }).closest('form');
    expect(form.checkValidity()).toBe(false);
    await waitFor(() => expect(within(form).getByRole('option', { name: 'Operador Uno' })).toBeInTheDocument());
    fireEvent.change(form.querySelector('select'), { target: { value: 'Agua Tratada' } });
    const values = ['1.2', '120', '18', '25', '30', '0.4', '7.1'];
    form.querySelectorAll('input[type="number"]').forEach((input, index) => {
      fireEvent.change(input, { target: { value: values[index] } });
    });
    fireEvent.change(form.querySelectorAll('select')[1], { target: { value: 'Operador Uno' } });
    expect(form.checkValidity()).toBe(true);
    fireEvent.submit(form);
    await waitFor(() => expect(submitControlFisicoQuimico).toHaveBeenCalledWith(expect.objectContaining({
      tipo_agua: 'Agua Tratada', k: 1.2, dureza: 120, cloruros: 18,
      sulfatos: 25, alcalinidad: 30, cloro_libre: 0.4, ph: 7.1,
      responsable: 'Operador Uno',
    })));
  });

  it('guarda saneado COP con línea, químico, horarios y responsable', async () => {
    renderPage(<AreaSaneadoPage />);
    const form = screen.getByRole('button', { name: 'Registrar Saneado' }).closest('form');
    expect(form.checkValidity()).toBe(false);
    await waitFor(() => expect(within(form).getByRole('option', { name: 'Operador Uno' })).toBeInTheDocument());
    fireEvent.change(form.querySelectorAll('select')[0], { target: { value: '2' } });
    fireEvent.change(form.querySelectorAll('select')[1], { target: { value: 'Si' } });
    fireEvent.change(within(form).getByPlaceholderText('Nombre o descripción del químico'), { target: { value: 'Detergente A' } });
    fireEvent.change(form.querySelectorAll('input[type="time"]')[0], { target: { value: '09:00' } });
    fireEvent.change(form.querySelectorAll('input[type="time"]')[1], { target: { value: '09:45' } });
    fireEvent.change(form.querySelectorAll('select')[3], { target: { value: 'Operador Uno' } });
    expect(form.checkValidity()).toBe(true);
    fireEvent.submit(form);
    await waitFor(() => expect(submitSalaSaneado).toHaveBeenCalledWith(expect.objectContaining({
      linea: '2', post_mantenimiento: true, tipo_limpieza: 'COP',
      cop_quimico: 'Detergente A', cop_hora_inicio: '09:00',
      cop_hora_fin: '09:45', responsable: 'Operador Uno',
    })));
  });
});
