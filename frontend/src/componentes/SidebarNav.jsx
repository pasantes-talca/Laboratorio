import React, { useEffect, useState } from 'react';
import { CheckSquare, ChevronDown, Home, Layers, LineChart, Droplet, Moon, ShieldCheck, Sun, Waves, X } from 'lucide-react';
import logoImg from '../assets/logo-color-fondo.png';
import { FORM_NAV } from '../navigation';
import { useTheme } from '../context/ThemeContext';

const NAV_ITEMS = [
  { page: 'portal', label: 'Inicio', icon: Home },
  { page: 'calidad', label: 'Control de Calidad', icon: CheckSquare },
  { page: 'jarabe', label: 'Sala de Jarabe', icon: Layers },
  { page: 'agua', label: 'Agua', icon: Droplet },
  { page: 'saneado', label: 'Área de Saneado', icon: Waves },
  { page: 'dashboard', label: 'Dashboard', icon: LineChart },
  { page: 'administracion', label: 'Administración', icon: ShieldCheck },
];

export default function SidebarNav({ activePage, activeForm, onNavigate, isOpen, onClose }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [expandedPage, setExpandedPage] = useState(FORM_NAV[activePage] ? activePage : null);

  // Keep the module that contains the current page open when the page changes.
  useEffect(() => {
    if (FORM_NAV[activePage]) setExpandedPage(activePage);
  }, [activePage]);

  const toggleModule = (page) => setExpandedPage((current) => (current === page ? null : page));
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
          <span className="sidebar-logo-box">
            <img src={logoImg} alt="Talca" className="sidebar-logo" />
          </span>
          <div className="sidebar-brand-text">
            <strong>Laboratorio de Calidad</strong>
            <span>Control de Procesos</span>
          </div>
          <button type="button" className="sidebar-close" aria-label="Cerrar menú" onClick={onClose}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav className="sidebar-navigation" aria-label="Secciones del laboratorio">
          <span className="sidebar-section-label">MÓDULOS</span>
          {NAV_ITEMS.map(({ page, label, icon: Icon }) => {
            const forms = FORM_NAV[page];
            const isExpanded = expandedPage === page;
            const subnavId = `sidebar-subnav-${page}`;
            return (
              <div key={page} className="sidebar-nav-group">
                <button
                  type="button"
                  className={`sidebar-link${activePage === page ? ' active' : ''}${forms ? ' has-subnav' : ''}`}
                  aria-current={activePage === page && !forms ? 'page' : undefined}
                  aria-expanded={forms ? isExpanded : undefined}
                  aria-controls={forms ? subnavId : undefined}
                  onClick={() => (forms ? toggleModule(page) : navigate(page))}
                >
                  <Icon size={19} aria-hidden="true" />
                  <span>{label}</span>
                  {forms && <ChevronDown className="sidebar-chevron" size={16} aria-hidden="true" />}
                </button>
                {forms && (
                  <div
                    id={subnavId}
                    className={`sidebar-subnav-wrap${isExpanded ? ' is-expanded' : ''}`}
                    aria-hidden={!isExpanded}
                    inert={!isExpanded}
                  >
                    <div className="sidebar-subnav" role="group" aria-label={page === 'dashboard' ? 'Dashboards' : `Formularios de ${label}`}>
                      {forms.map((form) => (
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
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-theme-toggle"
            aria-pressed={isDark}
            aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
            onClick={toggleTheme}
          >
            {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
            <span>{isDark ? 'Modo claro' : 'Modo oscuro'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
