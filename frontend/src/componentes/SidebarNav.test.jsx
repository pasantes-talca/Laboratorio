import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import SidebarNav from './SidebarNav';
import { ThemeProvider } from '../context/ThemeContext';

function renderSidebar(props = {}) {
  const onNavigate = vi.fn();
  const onClose = vi.fn();
  render(
    <ThemeProvider>
    <SidebarNav
        activePage="calidad"
        activeForm="bebida"
        onNavigate={onNavigate}
        isOpen={false}
        onClose={onClose}
        {...props}
    />
    </ThemeProvider>,
  );
  return { onNavigate, onClose };
}

describe('SidebarNav', () => {
  it('agrupa los tres dashboards en Dashboard y los quita de los formularios', () => {
    const { onNavigate } = renderSidebar({ activePage: 'dashboard', activeForm: 'jarabe' });
    const dashboards = within(screen.getByRole('group', { name: 'Dashboards' }));
    expect(dashboards.getAllByRole('button')).toHaveLength(3);
    expect(dashboards.getByRole('button', { name: 'Dashboard de Jarabe' })).toHaveAttribute('aria-current', 'page');
    expect(within(screen.getByRole('group', { name: 'Formularios de Sala de Jarabe', hidden: true })).queryByRole('button', { name: /Dashboard/ })).not.toBeInTheDocument();
    expect(within(screen.getByRole('group', { name: 'Formularios de Agua', hidden: true })).queryByRole('button', { name: /Dashboard/ })).not.toBeInTheDocument();
    fireEvent.click(dashboards.getByRole('button', { name: 'Dashboard de Agua' }));
    expect(onNavigate).toHaveBeenCalledWith('dashboard', 'agua');
  });
  it('muestra los formularios bajo sus módulos y marca el formulario actual', () => {
    renderSidebar();
    const nav = screen.getByRole('navigation', { name: 'Secciones del laboratorio' });
    expect(screen.getByRole('complementary', { name: 'Menú lateral' })).toBeInTheDocument();
    expect(nav.querySelectorAll('.sidebar-link')).toHaveLength(7);
    expect(screen.getByRole('group', { name: 'Formularios de Control de Calidad' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Formularios de Sala de Jarabe', hidden: true })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Formularios de Agua', hidden: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bebida Terminada' })).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByText('PRODUCCIÓN ACTIVA')).not.toBeInTheDocument();
  });

  it('navega directamente a un módulo sin formularios y cierra el menú móvil', () => {
    const { onNavigate, onClose } = renderSidebar({ isOpen: true });
    fireEvent.click(screen.getByRole('button', { name: 'Administración' }));
    expect(onNavigate).toHaveBeenCalledWith('administracion', undefined);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('despliega un módulo con formularios sin navegar ni cerrar el menú', () => {
    const { onNavigate, onClose } = renderSidebar({ isOpen: true });
    const agua = screen.getByRole('button', { name: 'Agua' });
    expect(agua).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(agua);
    expect(agua).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById(agua.getAttribute('aria-controls'))).toBeInTheDocument();
    expect(onNavigate).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(agua);
    expect(agua).toHaveAttribute('aria-expanded', 'false');
  });

  it('mantiene colapsados los módulos sin página activa y oculta sus formularios', () => {
    renderSidebar({ activePage: 'portal', activeForm: null });
    expect(screen.getByRole('button', { name: 'Agua' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: 'Análisis de Cloro' })).not.toBeInTheDocument();
  });

  it('solo mantiene un módulo desplegado a la vez', () => {
    renderSidebar();
    expect(screen.getByRole('button', { name: 'Control de Calidad' })).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Agua' }));
    expect(screen.getByRole('button', { name: 'Agua' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Control de Calidad' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('despliega el módulo de la página activa cuando cambia', () => {
    const { rerender } = render(
      <ThemeProvider><SidebarNav activePage="portal" onNavigate={vi.fn()} isOpen={false} onClose={vi.fn()} /></ThemeProvider>,
    );
    expect(screen.getByRole('button', { name: 'Agua' })).toHaveAttribute('aria-expanded', 'false');
    rerender(
      <ThemeProvider><SidebarNav activePage="agua" activeForm="fisicoQuimico" onNavigate={vi.fn()} isOpen={false} onClose={vi.fn()} /></ThemeProvider>,
    );
    expect(screen.getByRole('button', { name: 'Agua' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('abre un formulario del módulo desplegado y cierra el menú', () => {
    const { onNavigate, onClose } = renderSidebar({ isOpen: true });
    fireEvent.click(screen.getByRole('button', { name: 'Agua' }));
    fireEvent.click(screen.getByRole('button', { name: 'Análisis de Cloro' }));
    expect(onNavigate).toHaveBeenCalledWith('agua', 'analisisCloro');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cierra el menú móvil con Escape', () => {
    const { onClose } = renderSidebar({ isOpen: true });
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('alterna el tema desde el pie del menú', () => {
    window.localStorage.clear();
    renderSidebar();
    const toggle = screen.getByRole('button', { name: 'Activar modo oscuro' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(toggle);
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(screen.getByRole('button', { name: 'Activar modo claro' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Activar modo claro' }));
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('cambiar el tema no navega ni cierra el menú', () => {
    const { onNavigate, onClose } = renderSidebar({ isOpen: true });
    fireEvent.click(screen.getByRole('button', { name: /modo (oscuro|claro)/ }));
    expect(onNavigate).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
