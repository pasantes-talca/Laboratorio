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
  it('renders provided production props as visible text', () => {
    seedProduction({
      linea: 'linea2',
      turno: 'Tarde',
      sabor: 'COLA Red. XQ',
      tipoConcentrado: 'GIVAUDAN',
      tamano: '500 ml',
    });
    renderSidebar();

    expect(screen.getByText('Línea 2')).toBeInTheDocument();
    expect(screen.getByText('Tarde')).toBeInTheDocument();
    expect(screen.getByText('COLA Red. XQ')).toBeInTheDocument();
    expect(screen.getByText('GIVAUDAN')).toBeInTheDocument();
    expect(screen.getByText('500 ml')).toBeInTheDocument();
  });

  it('shows Sin asignar placeholders for empty fields', () => {
    seedProduction({});
    renderSidebar({ showLoteTapa: true });

    // sabor + concentrado + tamano
    expect(screen.getAllByText('Sin asignar')).toHaveLength(3);
  });

  it('defaults to Línea 1 label for the default linea value', () => {
    seedProduction({});
    renderSidebar();
    expect(screen.getByText('Línea 1')).toBeInTheDocument();
  });

  it('appends night subturno in parentheses when turno is Noche with subturno', () => {
    seedProduction({ turno: 'Noche', nocheSubturno: 'Noche 2' });
    renderSidebar();

    expect(screen.getByText('Noche (Noche 2)')).toBeInTheDocument();
  });

  it('shows plain Noche when no subturno is set', () => {
    seedProduction({ turno: 'Noche' });
    renderSidebar();
    expect(screen.getByText('Noche')).toBeInTheDocument();
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
