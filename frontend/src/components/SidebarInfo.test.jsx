import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SidebarInfo from './SidebarInfo';
import { ProductionProvider } from '../context/ProductionContext';

function seedProduction(data) {
  localStorage.setItem('calidad_active_production', JSON.stringify(data));
}

function renderSidebar(props = {}) {
  return render(
    <ProductionProvider>
      <SidebarInfo {...props} />
    </ProductionProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('SidebarInfo', () => {
  it('renders interactive selects initialized with active production state', () => {
    seedProduction({
      linea: 'linea2',
      turno: 'Tarde',
      sabor: 'Cola',
      tipoConcentrado: 'XQ',
      tamano: '3L',
    });
    renderSidebar();

    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(5);

    // Linea select
    expect(selects[0]).toHaveValue('linea2');
    // Turno select
    expect(selects[1]).toHaveValue('Tarde');
  });

  it('updates linea and turno directly through selects', () => {
    seedProduction({ linea: 'linea1', turno: 'Mañana' });
    renderSidebar();

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'linea2' } });
    expect(selects[0]).toHaveValue('linea2');

    fireEvent.change(selects[1], { target: { value: 'Noche' } });
    expect(selects[1]).toHaveValue('Noche');
  });

  it('filters concentrados and tamanos dynamically when flavor changes', () => {
    seedProduction({ sabor: 'Cola' });
    renderSidebar();

    const selects = screen.getAllByRole('combobox');
    const saborSelect = selects[2];
    const concentradoSelect = selects[3];
    const tamanoSelect = selects[4];

    // Select Cola -> should have XQ, KG, IFF
    fireEvent.change(saborSelect, { target: { value: 'Cola' } });
    expect(concentradoSelect).not.toBeDisabled();
    expect(tamanoSelect).not.toBeDisabled();

    // Select Soda -> should have TALCA concentrado
    fireEvent.change(saborSelect, { target: { value: 'Soda' } });
    expect(concentradoSelect).toHaveValue('TALCA');
  });

  it('shows default association hint when no customHint given', () => {
    seedProduction({});
    renderSidebar();
    expect(
      screen.getByText(/se asociarán automáticamente/)
    ).toBeInTheDocument();
  });

  it('renders customHint instead of the default hint when provided', () => {
    seedProduction({});
    renderSidebar({ customHint: 'Registre el torque antes del envasado.' });

    expect(
      screen.getByText('Registre el torque antes del envasado.')
    ).toBeInTheDocument();
    expect(screen.queryByText(/se asociarán automáticamente/)).not.toBeInTheDocument();
  });

  describe('showLoteTapa input', () => {
    it('does not render the lote tapa field by default', () => {
      seedProduction({});
      renderSidebar();
      expect(
        screen.queryByPlaceholderText('Ej: LOTE-T-2026')
      ).not.toBeInTheDocument();
    });

    it('renders a controlled input seeded from context and persists edits', async () => {
      seedProduction({ loteTapa: 'L-100' });
      renderSidebar({ showLoteTapa: true });

      const input = screen.getByPlaceholderText('Ej: LOTE-T-2026');
      expect(input).toHaveValue('L-100');

      fireEvent.change(input, { target: { value: 'LOTE-T-2026' } });
      expect(input).toHaveValue('LOTE-T-2026');

      // edit round-trips through ProductionContext -> localStorage
      const stored = JSON.parse(localStorage.getItem('calidad_active_production'));
      expect(stored.loteTapa).toBe('LOTE-T-2026');
    });
  });
});
