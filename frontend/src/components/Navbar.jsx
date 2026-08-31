import React from 'react';
import { FlaskConical, CheckSquare, Layers, LineChart } from 'lucide-react';
import { useProduction } from '../context/ProductionContext';

export default function Navbar({ activePage, setActivePage }) {
  const { production } = useProduction();

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


        {activePage !== 'jarabe' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className={`badge-pill ${lineaBadgeClass}`}>{lineaText}</span>
          </div>
        )}
      </nav>
    </header>
  );
}
