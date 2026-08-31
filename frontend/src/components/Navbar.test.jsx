import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from './Navbar';
import { ProductionProvider } from '../context/ProductionContext';

function renderNavbar(activePage = 'calidad', setActivePage = vi.fn()) {
  return render(
    <ProductionProvider>
      <Navbar activePage={activePage} setActivePage={setActivePage} />
    </ProductionProvider>
  );
}

describe('Navbar', () => {
  it('renders the brand header and all nav items', () => {
    renderNavbar();

    expect(
      screen.getByRole('heading', { name: 'Laboratorio de Calidad' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Control de Calidad/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Sala de Jarabe/ })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dashboard/ })).toBeInTheDocument();
  });

  it.each([
    ['Control de Calidad', 'calidad'],
    ['Sala de Jarabe', 'jarabe'],
    ['Dashboard', 'dashboard'],
  ])('clicking "%s" invokes page change with %s', (label, expectedPage) => {
    const setActivePage = vi.fn();
    renderNavbar('dashboard', setActivePage);

    fireEvent.click(screen.getByRole('button', { name: new RegExp(label) }));

    expect(setActivePage).toHaveBeenCalledTimes(1);
    expect(setActivePage).toHaveBeenCalledWith(expectedPage);
  });

  it('marks the active page button with the active class only for current page', () => {
    renderNavbar('jarabe');

    const jarabeBtn = screen.getByRole('button', { name: /Sala de Jarabe/ });
    const calidadBtn = screen.getByRole('button', { name: /Control de Calidad/ });

    expect(jarabeBtn.className).toContain('active');
    expect(calidadBtn.className).not.toContain('active');
  });

  it('shows the line badge on non-jarabe pages', () => {
    renderNavbar('calidad');
    expect(screen.getByText('Línea 1')).toBeInTheDocument();
  });

  it('hides the line badge on jarabe page', () => {
    renderNavbar('jarabe');
    expect(screen.queryByText('Línea 1')).not.toBeInTheDocument();
  });
});
