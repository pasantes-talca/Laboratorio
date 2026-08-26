import React from 'react';
import { PackageCheck, Edit3, AlertCircle } from 'lucide-react';
import { useProduction } from '../context/ProductionContext';

export default function SidebarInfo({ customHint, showLoteTapa = false }) {
  const { production, updateProduction, openModal } = useProduction();

  const lineaText = production.linea === 'linea2' ? 'Línea 2' : 'Línea 1';
  const subturno = production.turno === 'Noche' && production.nocheSubturno ? ` (${production.nocheSubturno})` : '';

  return (
    <aside className="sidebar-card">
      <div className="sidebar-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <PackageCheck size={20} color="#00f2fe" />
          <span>Producción Activa</span>
        </div>
        <button
          type="button"
          onClick={openModal}
          style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer', display: 'flex' }}
          title="Editar producción"
        >
          <Edit3 size={16} />
        </button>
      </div>

      <div className="sidebar-data-list">
        <div className="sidebar-data-item">
          <span className="sidebar-data-label">Línea:</span>
          <span className="sidebar-data-val">{lineaText}</span>
        </div>
        <div className="sidebar-data-item">
          <span className="sidebar-data-label">Turno:</span>
          <span className="sidebar-data-val">{production.turno}{subturno}</span>
        </div>
        <div className="sidebar-data-item">
          <span className="sidebar-data-label">Sabor:</span>
          <span className="sidebar-data-val">{production.sabor || <span style={{ color: 'var(--text-muted)' }}>Sin asignar</span>}</span>
        </div>
        <div className="sidebar-data-item">
          <span className="sidebar-data-label">Concentrado:</span>
          <span className="sidebar-data-val">{production.tipoConcentrado || <span style={{ color: 'var(--text-muted)' }}>Sin asignar</span>}</span>
        </div>
        <div className="sidebar-data-item">
          <span className="sidebar-data-label">Tamaño:</span>
          <span className="sidebar-data-val">{production.tamano || <span style={{ color: 'var(--text-muted)' }}>Sin asignar</span>}</span>
        </div>

        {showLoteTapa && (
          <div className="sidebar-data-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.25rem' }}>
            <span className="sidebar-data-label">Lote de Tapa <span className="required-star">*</span></span>
            <input
              type="text"
              placeholder="Ej: LOTE-T-2026"
              value={production.loteTapa}
              onChange={(e) => updateProduction({ loteTapa: e.target.value })}
              style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
            />
          </div>
        )}
      </div>

      {customHint ? (
        <div className="sidebar-hint">
          <AlertCircle size={16} color="#94a3b8" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{customHint}</span>
        </div>
      ) : (
        <div className="sidebar-hint">
          <AlertCircle size={16} color="#94a3b8" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>Los controles registrados se asociarán automáticamente a estos datos de producción.</span>
        </div>
      )}
    </aside>
  );
}
