import React, { useEffect } from 'react';
import { CheckSquare, Home, Layers, LineChart, Droplet, Waves, X } from 'lucide-react';
import logoImg from '../assets/logo-color-fondo.png';
import { FORM_NAV } from '../navigation';

const NAV_ITEMS = [
  { page: 'portal', label: 'Inicio', icon: Home },
  { page: 'calidad', label: 'Control de Calidad', icon: CheckSquare },
  { page: 'jarabe', label: 'Sala de Jarabe', icon: Layers },
  { page: 'agua', label: 'Agua', icon: Droplet },
  { page: 'saneado', label: 'Área de Saneado', icon: Waves },
  { page: 'dashboard', label: 'Dashboard', icon: LineChart },
];

export default function SidebarNav({ activePage, activeForm, onNavigate, isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen, onClose]);

  const navigate = (page, form) => {
    onNavigate(page, form);
    onClose();
  };

  return (
    <>
      {isOpen && <button type="button" className="sidebar-scrim" aria-label="Cerrar menú" onClick={onClose} />}
      <aside className={`app-sidebar${isOpen ? ' is-open' : ''}`} aria-label="Menú lateral">
        <div className="sidebar-brand">
          <img src={logoImg} alt="Talca" className="sidebar-logo" />
          <div>
            <strong>Laboratorio de Calidad</strong>
            <span>Control de Procesos</span>
          </div>
          <button type="button" className="sidebar-close" aria-label="Cerrar menú" onClick={onClose}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav className="sidebar-navigation" aria-label="Secciones del laboratorio">
          <span className="sidebar-section-label">MÓDULOS</span>
          {NAV_ITEMS.map(({ page, label, icon: Icon }) => (
            <div key={page} className="sidebar-nav-group">
              <button
                type="button"
                className={`sidebar-link${activePage === page ? ' active' : ''}`}
                aria-current={activePage === page && !FORM_NAV[page] ? 'page' : undefined}
                onClick={() => navigate(page)}
              >
                <Icon size={19} aria-hidden="true" />
                <span>{label}</span>
              </button>
              {FORM_NAV[page] && (
                <div className="sidebar-subnav" role="group" aria-label={`Formularios de ${label}`}>
                  {FORM_NAV[page].map((form) => (
                    <button
                      key={form.id}
                      type="button"
                      className={`sidebar-sublink${activePage === page && activeForm === form.id ? ' active' : ''}`}
                      aria-current={activePage === page && activeForm === form.id ? 'page' : undefined}
                      onClick={() => navigate(page, form.id)}
                    >
                      {form.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

      </aside>
    </>
  );
}
