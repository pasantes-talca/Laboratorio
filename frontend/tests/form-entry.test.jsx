import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ProductionProvider } from '../src/context/ProductionContext';
import { ToastProvider } from '../src/context/ToastContext';
import CalidadPage from '../src/modulos/calidad/pages/CalidadPage';
import SalaJarabePage from '../src/modulos/jarabe/pages/SalaJarabePage';
import AguaPage from '../src/modulos/agua/pages/AguaPage';
import AreaSaneadoPage from '../src/modulos/saneado/pages/AreaSaneadoPage';
import {
  getActiveProduction,
  getJarabeSimples,
  submitControlBebida,
  submitControlJarabe,
  submitJarabeSimple,
  submitControlFisicoQuimico,
  submitAnalisisCloro,
  submitSalaSaneado,
} from '../src/services/api';

vi.mock('../src/services/api', () => ({
  getResponsables: vi.fn().mockResolvedValue([{ id: 1, nombre_completo: 'Operador Uno' }]),
  getResponsablesJarabe: vi.fn().mockResolvedValue([{ id: 1, nombre_completo: 'Operador Uno' }]),
  getTanques: vi.fn().mockResolvedValue([{ id: 1, numero: '1' }]),
  getSabores: vi.fn().mockResolvedValue([]),
  getMarcas: vi.fn().mockResolvedValue([]),
  getActiveProduction: vi.fn().mockResolvedValue({
    linea: 1, turno: 'Mañana', sabor: 'Cola', concentrado: 'XQ', tamano: '3L', version: 1,
  }),
  saveActiveProduction: vi.fn().mockResolvedValue({}),
  getJarabeSimples: vi.fn().mockResolvedValue([]),
  submitControlBebida: vi.fn().mockResolvedValue({}),
  submitControlJarabe: vi.fn().mockResolvedValue({}),
  submitJarabeSimple: vi.fn().mockResolvedValue({}),
  submitControlFisicoQuimico: vi.fn().mockResolvedValue({}),
  submitAnalisisCloro: vi.fn().mockResolvedValue({}),
  submitSalaSaneado: vi.fn().mockResolvedValue({}),
}));

function renderPage(page) {
  return render(
    <ToastProvider>
      <ProductionProvider>{page}</ProductionProvider>
    </ToastProvider>,
  );
}

function checkFormValidity(form) {
  let valid;
  act(() => { valid = form.checkValidity(); });
  return valid;
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  getJarabeSimples.mockResolvedValue([]);
});

describe('ingreso de datos en formularios', () => {
  it('registra la presión del rinser y muestra los títulos corregidos en análisis de cloro', async () => {
    renderPage(<AguaPage initialTab="analisisCloro" />);
    const description = screen.getByRole('spinbutton', { name: /^Presión del rinser/ });
    expect(description.parentElement.querySelector('.chlorine-unit')).not.toBeInTheDocument();
    expect(screen.queryByText('Acondicionamiento rinser')).not.toBeInTheDocument();
    expect(description).toHaveAttribute('min', '0');
    expect(description).toHaveAttribute('step', 'any');
    expect(screen.getByLabelText(/Cloro Rinser Línea/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cloro Rinser Resultado/)).toBeInTheDocument();
    expect(screen.queryByText(/riser/i)).not.toBeInTheDocument();
    const fillRequired = async () => {
      await waitFor(() => expect(screen.getByRole('option', { name: 'Operador Uno' })).toBeInTheDocument());
      fireEvent.change(screen.getByLabelText(/Hora del control/), { target: { value: '09:00' } });
      fireEvent.change(screen.getByRole('spinbutton', { name: /Tanque de agua de ósmosis/ }), { target: { value: '0.5' } });
      fireEvent.change(screen.getByLabelText(/Cloro Rinser Resultado/), { target: { value: '1.2' } });
      fireEvent.change(screen.getByLabelText(/^Responsable/), { target: { value: 'Operador Uno' } });
    };
    await fillRequired();
    fireEvent.change(description, { target: { value: '1.25' } });
    const form = description.closest('form');
    fireEvent.submit(form);
    await waitFor(() => expect(submitAnalisisCloro).toHaveBeenCalledWith(expect.objectContaining({
      acondicionamiento_rinser: 1.25,
    })));
    await waitFor(() => expect(description).toHaveValue(null));
    await fillRequired();
    fireEvent.change(description, { target: { value: '0' } });
    fireEvent.submit(form);
    await waitFor(() => expect(submitAnalisisCloro).toHaveBeenLastCalledWith(expect.objectContaining({ acondicionamiento_rinser: 0 })));
    await waitFor(() => expect(description).toHaveValue(null));
    fireEvent.change(description, { target: { value: '2.5' } });
    fireEvent.click(within(form).getByRole('button', { name: 'Limpiar' }));
    expect(description).toHaveValue(null);
  });

  it('señala los errores del análisis de cloro y no envía valores inválidos', async () => {
    renderPage(<AguaPage initialTab="analisisCloro" />);
    await screen.findByRole('option', { name: 'Operador Uno' });
    const measurement = screen.getByLabelText(/Cloro Rinser Resultado/);
    fireEvent.change(measurement, { target: { value: '-1' } });
    fireEvent.blur(measurement);
    expect(measurement).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Ingrese un valor igual o mayor a cero.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Registrar Análisis' }));
    expect(submitAnalisisCloro).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Revise los campos');
    expect(screen.getByLabelText(/Hora del control/)).toHaveFocus();
    fireEvent.change(measurement, { target: { value: '0' } });
    expect(measurement).toHaveAttribute('aria-invalid', 'false');
  });

  it('conserva las mediciones si falla el registro del análisis de cloro', async () => {
    submitAnalisisCloro.mockRejectedValueOnce(new Error('Sin conexión con el servidor'));
    renderPage(<AguaPage initialTab="analisisCloro" />);
    await screen.findByRole('option', { name: 'Operador Uno' });
    fireEvent.change(screen.getByLabelText(/Hora del control/), { target: { value: '09:00' } });
    fireEvent.change(screen.getByLabelText(/Tanque de agua de ósmosis/), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText(/Cloro Rinser Resultado/), { target: { value: '1.25' } });
    fireEvent.change(screen.getByLabelText(/^Responsable/), { target: { value: 'Operador Uno' } });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar Análisis' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Sin conexión con el servidor');
    expect(screen.getByLabelText(/Cloro Rinser Resultado/)).toHaveValue(1.25);
    expect(screen.getByRole('button', { name: 'Registrar Análisis' })).toBeEnabled();
  });

  it('bloquea los controles hasta configurar la producción de la línea', async () => {
    getActiveProduction.mockResolvedValueOnce({
      linea: 1, turno: 'Mañana', sabor: '', concentrado: '', tamano: '', version: 0,
    });
    renderPage(<CalidadPage />);
    await waitFor(() => expect(screen.getByText(/Configure la producción de esta línea/)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Registrar Control de Bebida' })).toBeDisabled();
  });

  it('exige y registra el lote de tapa solo en Bebida Terminada', async () => {
    renderPage(<CalidadPage />);
    const form = screen.getByRole('button', { name: 'Registrar Control de Bebida' }).closest('form');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Registrar Control de Bebida' })).toBeEnabled());
    await waitFor(() => expect(within(form).getByRole('option', { name: 'Operador Uno' })).toBeInTheDocument());
    for (const placeholder of ['Ej: 2250', 'Ej: 3.2', 'Ej: 4.5', 'Ej: 3.8', 'Ej: 10.45']) {
      fireEvent.change(within(form).getByPlaceholderText(placeholder), { target: { value: '3' } });
    }
    fireEvent.change(form.querySelectorAll('select')[3], { target: { value: 'Operador Uno' } });
    expect(checkFormValidity(form)).toBe(false);
    fireEvent.change(within(form).getByRole('textbox', { name: /Lote de tapa/ }), { target: { value: 'LT-123' } });
    expect(checkFormValidity(form)).toBe(true);
    fireEvent.submit(form);
    await waitFor(() => expect(submitControlBebida).toHaveBeenCalledWith(expect.objectContaining({
      lote_tapa: 'LT-123', linea: 'linea1', production_version: 1,
    })));
    await waitFor(() => expect(within(form).getByPlaceholderText('Ej: 2250')).toHaveValue(null));
    expect(within(form).getByRole('textbox', { name: /Lote de tapa/ })).toHaveValue('LT-123');
    fireEvent.click(within(form).getByRole('button', { name: 'Limpiar' }));
    expect(within(form).getByRole('textbox', { name: /Lote de tapa/ })).toHaveValue('LT-123');
  });

  it('recuerda el lote por línea al volver a abrir la página', async () => {
    const first = renderPage(<CalidadPage />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Registrar Control de Bebida' })).toBeEnabled());
    fireEvent.change(screen.getByRole('textbox', { name: /Lote de tapa/ }), { target: { value: 'TAPA-L1' } });
    expect(localStorage.getItem('calidad_lote_tapa_linea1')).toBe('TAPA-L1');
    first.unmount();

    sessionStorage.setItem('calidad_selected_line', 'linea2');
    const second = renderPage(<CalidadPage />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Registrar Control de Bebida' })).toBeEnabled());
    expect(screen.getByRole('textbox', { name: /Lote de tapa/ })).toHaveValue('');
    fireEvent.change(screen.getByRole('textbox', { name: /Lote de tapa/ }), { target: { value: 'TAPA-L2' } });
    expect(localStorage.getItem('calidad_lote_tapa_linea2')).toBe('TAPA-L2');
    second.unmount();

    sessionStorage.setItem('calidad_selected_line', 'linea1');
    renderPage(<CalidadPage />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Registrar Control de Bebida' })).toBeEnabled());
    expect(screen.getByRole('textbox', { name: /Lote de tapa/ })).toHaveValue('TAPA-L1');
  });

  it('guarda el control de jarabe con números y datos de producción', async () => {
    renderPage(<CalidadPage initialTab="jarabe" />);
    const form = screen.getByRole('button', { name: 'Registrar Control de Jarabe' }).closest('form');
    expect(checkFormValidity(form)).toBe(false);
    await waitFor(() => expect(within(form).getByRole('option', { name: 'Tanque 1' })).toBeInTheDocument());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Registrar Control de Jarabe' })).toBeEnabled());
    fireEvent.change(form.querySelector('input[type="time"]'), { target: { value: '08:30' } });
    fireEvent.change(form.querySelectorAll('select')[0], { target: { value: '1' } });
    fireEvent.change(within(form).getByPlaceholderText('Ej: 54.20'), { target: { value: '54.20' } });
    fireEvent.change(within(form).getByPlaceholderText('Ej: 1.25'), { target: { value: '1.25' } });
    fireEvent.change(form.querySelectorAll('select')[1], { target: { value: 'Operador Uno' } });
    expect(checkFormValidity(form)).toBe(true);
    fireEvent.submit(form);
    await waitFor(() => expect(submitControlJarabe).toHaveBeenCalledWith(expect.objectContaining({
      hora: '08:30', tanque: '1', bx_patron: 54.2, ta: 1.25,
      responsable: 'Operador Uno', sabor: 'Cola', concentrado: 'XQ',
      linea: 'linea1', turno: 'Mañana', production_version: 1,
    })));
    expect(submitControlJarabe.mock.calls[0][0]).not.toHaveProperty('lote_tapa');
  });

  it('guarda Jarabe Simple con el volcado sugerido y las marcas ingresadas', async () => {
    getJarabeSimples.mockResolvedValue([{ volcado_numero: 2 }]);
    renderPage(<SalaJarabePage />);
    const form = document.getElementById('simple-form');
    await waitFor(() => expect(screen.getByText('Tanque 1')).toBeInTheDocument());
    expect(screen.queryByText('Jarabe Simple Activo')).not.toBeInTheDocument();
    expect(form.querySelector('input[type="date"]')).not.toBeInTheDocument();
    fireEvent.change(within(form).getByLabelText(/Tanque asignado/), { target: { value: '1' } });
    await waitFor(() => expect(within(form).getByText(/sugerido: 3/)).toBeInTheDocument());
    expect(form.querySelector('input[type="number"]').value).toBe('3');
    fireEvent.change(within(form).getByPlaceholderText('Ej: 80'), { target: { value: '80' } });
    fireEvent.change(within(form).getByPlaceholderText('Ej: Ledesma, Tabacal...'), { target: { value: 'Ledesma' } });
    fireEvent.change(within(form).getByRole('combobox', { name: /Responsables/ }), { target: { value: 'Operador Uno' } });
    expect(checkFormValidity(form)).toBe(true);
    fireEvent.submit(form);
    await waitFor(() => expect(submitJarabeSimple).toHaveBeenCalledWith(expect.objectContaining({
      tanque: '1', volcado_numero: 3, cantidad_bolsas: 80,
      azucar_marca: 'Ledesma', responsables: ['Operador Uno'],
    })));
    expect(submitJarabeSimple.mock.calls[0][0]).not.toHaveProperty('fecha');
    expect(submitJarabeSimple.mock.calls[0][0]).not.toHaveProperty('hora');
  });

  it('exige los valores del control físico químico y envía los números ingresados', async () => {
    renderPage(<AguaPage />);
    const form = screen.getByRole('button', { name: 'Registrar Control' }).closest('form');
    expect(checkFormValidity(form)).toBe(false);
    await waitFor(() => expect(within(form).getByRole('option', { name: 'Operador Uno' })).toBeInTheDocument());
    fireEvent.change(form.querySelector('select'), { target: { value: 'Agua Tratada' } });
    const values = ['1.2', '120', '18', '25', '30', '0.4', '7.1'];
    form.querySelectorAll('input[type="number"]').forEach((input, index) => {
      fireEvent.change(input, { target: { value: values[index] } });
    });
    fireEvent.change(form.querySelectorAll('select')[1], { target: { value: 'Operador Uno' } });
    expect(checkFormValidity(form)).toBe(true);
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
    expect(checkFormValidity(form)).toBe(false);
    await waitFor(() => expect(within(form).getByRole('option', { name: 'Operador Uno' })).toBeInTheDocument());
    fireEvent.change(form.querySelectorAll('select')[0], { target: { value: '2' } });
    fireEvent.change(form.querySelectorAll('select')[1], { target: { value: 'Si' } });
    fireEvent.change(within(form).getByPlaceholderText('Nombre o descripción del químico'), { target: { value: 'Detergente A' } });
    fireEvent.change(form.querySelectorAll('input[type="time"]')[0], { target: { value: '09:00' } });
    fireEvent.change(form.querySelectorAll('input[type="time"]')[1], { target: { value: '09:45' } });
    fireEvent.change(form.querySelectorAll('select')[3], { target: { value: 'Operador Uno' } });
    expect(checkFormValidity(form)).toBe(true);
    fireEvent.submit(form);
    await waitFor(() => expect(submitSalaSaneado).toHaveBeenCalledWith(expect.objectContaining({
      linea: '2', post_mantenimiento: true, tipo_limpieza: 'COP',
      cop_quimico: 'Detergente A', cop_hora_inicio: '09:00',
      cop_hora_fin: '09:45', responsable: 'Operador Uno',
    })));
  });
});
