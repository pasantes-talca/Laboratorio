import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import SidebarNav from './SidebarNav';

function renderSidebar(props = {}) {
  const onNavigate = vi.fn();
  const onClose = vi.fn();
  render(
    <SidebarNav
        activePage="calidad"
        activeForm="bebida"
        onNavigate={onNavigate}
        isOpen={false}
        onClose={onClose}
        {...props}
    />,
  );
  return { onNavigate, onClose };
}

describe('SidebarNav', () => {
  it('agrupa los tres dashboards en Dashboard y los quita de los formularios', () => {
    const { onNavigate } = renderSidebar({ activePage: 'dashboard', activeForm: 'jarabe' });
    const dashboards = within(screen.getByRole('group', { name: 'Dashboards' }));
    expect(dashboards.getAllByRole('button')).toHaveLength(3);
    expect(dashboards.getByRole('button', { name: 'Dashboard de Jarabe' })).toHaveAttribute('aria-current', 'page');
    expect(within(screen.getByRole('group', { name: 'Formularios de Sala de Jarabe' })).queryByRole('button', { name: /Dashboard/ })).not.toBeInTheDocument();
    expect(within(screen.getByRole('group', { name: 'Formularios de Agua' })).queryByRole('button', { name: /Dashboard/ })).not.toBeInTheDocument();
    fireEvent.click(dashboards.getByRole('button', { name: 'Dashboard de Agua' }));
    expect(onNavigate).toHaveBeenCalledWith('dashboard', 'agua');
  });
  it('muestra los formularios bajo sus módulos y marca el formulario actual', () => {
    renderSidebar();
    const nav = screen.getByRole('navigation', { name: 'Secciones del laboratorio' });
    expect(screen.getByRole('complementary', { name: 'Menú lateral' })).toBeInTheDocument();
    expect(nav.querySelectorAll('.sidebar-link')).toHaveLength(7);
    expect(screen.getByRole('group', { name: 'Formularios de Control de Calidad' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Formularios de Sala de Jarabe' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Formularios de Agua' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bebida Terminada' })).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByText('PRODUCCIÓN ACTIVA')).not.toBeInTheDocument();
  });

  it('navega al módulo seleccionado y cierra el menú móvil', () => {
    const { onNavigate, onClose } = renderSidebar({ isOpen: true });
    fireEvent.click(screen.getByRole('button', { name: 'Agua' }));
    expect(onNavigate).toHaveBeenCalledWith('agua', undefined);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('abre directamente un formulario del módulo y cierra el menú', () => {
    const { onNavigate, onClose } = renderSidebar({ isOpen: true });
    fireEvent.click(screen.getByRole('button', { name: 'Análisis de Cloro' }));
    expect(onNavigate).toHaveBeenCalledWith('agua', 'analisisCloro');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cierra el menú móvil con Escape', () => {
    const { onClose } = renderSidebar({ isOpen: true });
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
