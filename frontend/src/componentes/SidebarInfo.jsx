import React from 'react';
import { AlertCircle, PackageCheck, RefreshCw, Settings2 } from 'lucide-react';
import { useProduction } from '../context/ProductionContext';

export default function SidebarInfo({ customHint }) {
  const {
    production, selectedLine, selectLine, refreshProduction, openModal,
    productionLoaded, productionLoading, productionError,
  } = useProduction();

  const details = [
    ['Turno', production.turno],
    ['Sabor', production.sabor],
    ['Concentrado', production.tipoConcentrado],
    ['Tamaño', production.tamano],
  ];

  return (
    <aside className="sidebar-card">
      <div className="sidebar-header">
        <PackageCheck size={20} color="var(--color-azul-clinico)" />
        <span>Producción Activa</span>
      </div>

      <div className="sidebar-data-list">
        <div className="sidebar-data-item">
          <label className="sidebar-data-label" htmlFor="quality-work-line">Línea de trabajo:</label>
          <select
            id="quality-work-line"
            value={selectedLine}
            onChange={(event) => selectLine(event.target.value)}
            aria-label="Línea de trabajo"
          >
            <option value="linea1">Línea 1</option>
            <option value="linea2">Línea 2</option>
          </select>
        </div>
        {productionLoading && <p role="status">Cargando producción…</p>}
        {productionError && <p className="alert alert-error" role="alert">{productionError}</p>}
        {productionLoaded && production.version === 0 && (
          <p className="sidebar-hint">Esta línea todavía no tiene producción configurada.</p>
        )}
        {production.version > 0 && details.map(([label, value]) => (
          <div className="sidebar-data-item" key={label}>
            <span className="sidebar-data-label">{label}:</span>
            <strong className="sidebar-data-val">{value || '—'}</strong>
          </div>
        ))}
        {production.version > 0 && (
          <div className="sidebar-data-item">
            <span className="sidebar-data-label">Actualizada por:</span>
            <strong className="sidebar-data-val">{production.actualizadaPor || '—'}</strong>
          </div>
        )}
      </div>

      <div className="sidebar-production-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => refreshProduction().catch(() => {})}
          aria-label="Actualizar producción"
          disabled={productionLoading}
        >
          <RefreshCw size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={openModal}
          disabled={!productionLoaded || productionLoading || Boolean(productionError)}
        >
          <Settings2 size={16} aria-hidden="true" /> Cambiar producción
        </button>
      </div>

      <div className="sidebar-hint">
        <AlertCircle size={16} color="#94a3b8" style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>{customHint || 'Los controles se registran con la producción guardada para esta línea.'}</span>
      </div>
    </aside>
  );
}
