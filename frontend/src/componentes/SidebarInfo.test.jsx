import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SidebarInfo from './SidebarInfo';
import ProductionModal from './ProductionModal';
import { ProductionProvider } from '../context/ProductionContext';
import { ToastProvider } from '../context/ToastContext';
import { getActiveProduction, saveActiveProduction } from '../services/api';

vi.mock('../services/api', () => ({
  getActiveProduction: vi.fn(), saveActiveProduction: vi.fn(),
  getMarcas: vi.fn().mockResolvedValue([{ id: 1, nombre: 'Cola' }]),
}));

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  getActiveProduction.mockImplementation(async (line) => ({
    linea: line, turno: 'Mañana', sabor: line === 1 ? 'Cola' : 'Soda',
    concentrado: line === 1 ? 'XQ' : 'TALCA', tamano: '500ml', version: 1,
  }));
});

describe('Producción Activa', () => {
  it('actualiza los datos desde el servidor sin guardar cambios', async () => {
    render(<ProductionProvider><ToastProvider><SidebarInfo /></ToastProvider></ProductionProvider>);
    await screen.findByText('Cola');
    getActiveProduction.mockResolvedValue({
      linea: 1, turno: 'Tarde', sabor: 'Lima', concentrado: 'IFF', tamano: '500ml', version: 2,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar producción' }));
    await screen.findByText('Lima');
    expect(saveActiveProduction).not.toHaveBeenCalled();
    expect(screen.queryByText('Actualizada por:')).not.toBeInTheDocument();
  });
  it('muestra cada línea sin edición directa', async () => {
    render(<ProductionProvider><ToastProvider><SidebarInfo /></ToastProvider></ProductionProvider>);
    await waitFor(() => expect(screen.getByText('Cola')).toBeInTheDocument());
    expect(screen.getAllByRole('combobox')).toHaveLength(1);
    expect(screen.queryByText('Lote de tapa')).not.toBeInTheDocument();
    expect(screen.queryByText('Actualizada por:')).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', { name: 'Línea de trabajo' }), { target: { value: 'linea2' } });
    await waitFor(() => expect(screen.getByText('Soda')).toBeInTheDocument());
    expect(screen.queryByText('Lote de tapa')).not.toBeInTheDocument();
  });

  it('solo guarda mediante Cambiar producción', async () => {
    saveActiveProduction.mockResolvedValue({
      linea: 1, turno: 'Tarde', sabor: 'Cola', concentrado: 'XQ', tamano: '500ml', version: 2,
    });
    render(<ProductionProvider><ToastProvider><SidebarInfo /><ProductionModal /></ToastProvider></ProductionProvider>);
    await waitFor(() => expect(screen.getByText('Cola')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar producción' }));
    await waitFor(() => expect(screen.getByRole('option', { name: 'Cola' })).toBeInTheDocument());
    expect(screen.queryByRole('textbox', { name: /Lote de tapa/ })).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', { name: /Turno/ }), { target: { value: 'Tarde' } });
    expect(saveActiveProduction).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambio' }));
    await waitFor(() => expect(saveActiveProduction).toHaveBeenCalledWith(1, expect.objectContaining({ expected_version: 1, turno: 'Tarde' })));
    await waitFor(() => expect(screen.getByText('Tarde')).toBeInTheDocument());
  });
});
