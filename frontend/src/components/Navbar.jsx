import React from 'react';
import { FlaskConical, Settings, CheckSquare, Layers, BarChart3, LineChart } from 'lucide-react';
import { useProduction } from '../context/ProductionContext';

export default function Navbar({ activePage, setActivePage }) {
  const { production, openModal, updateProduction } = useProduction();

  const lineaText = production.linea === 'linea2' ? 'Línea 2' : 'Línea 1';
  const lineaBadgeClass = production.linea === 'linea2' ? 'badge-linea2' : 'badge-linea1';

  return (
    <header className="main-header">
      <div className="header-brand">
        <div className="brand-badge">
          <FlaskConical size={26} />
        </div>
        <div>
          <h1>Laboratorio de Calidad</h1>
          <div className="header-subtitle">Control de Procesos y Producto Terminado</div>
        </div>
      </div>

      <nav className="header-nav">
        <button
          type="button"
          className={`nav-link ${activePage === 'calidad' ? 'active' : ''}`}
          onClick={() => setActivePage('calidad')}
        >
          <CheckSquare size={18} />
          Control de Calidad
        </button>

        <button
          type="button"
          className={`nav-link ${activePage === 'jarabe' ? 'active' : ''}`}
          onClick={() => setActivePage('jarabe')}
        >
          <Layers size={18} />
          Sala de Jarabe
        </button>

        <button
          type="button"
          className={`nav-link ${activePage === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActivePage('dashboard')}
        >
          <LineChart size={18} />
          Dashboard
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select
            value={production.turno === 'Noche' ? (production.nocheSubturno || 'Noche 1') : production.turno}
            onChange={(e) => {
              const val = e.target.value;
              if (val.startsWith('Noche')) {
                updateProduction({ ...production, turno: 'Noche', nocheSubturno: val });
              } else {
                updateProduction({ ...production, turno: val, nocheSubturno: '' });
              }
            }}
            className="select-turno-header"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '0.35rem 0.5rem',
              fontSize: '0.85rem',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="Mañana">Turno: Mañana</option>
            <option value="Tarde">Turno: Tarde</option>
            <option value="Noche 1">Turno: Noche 1</option>
            <option value="Noche 2">Turno: Noche 2</option>
          </select>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-glass)', margin: '0 0.25rem' }} />

        {activePage !== 'jarabe' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className={`badge-pill ${lineaBadgeClass}`}>{lineaText}</span>
            <button type="button" className="btn-production-config" onClick={openModal}>
              <Settings size={18} />
              Asignar Producción
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
