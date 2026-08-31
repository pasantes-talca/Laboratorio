import React, { useState, useEffect } from 'react';
import { PackageCheck, AlertCircle } from 'lucide-react';
import { useProduction } from '../context/ProductionContext';
import { getMarcas } from '../services/api';
import { getConcentradosForSabor, getTamanosForSabor } from '../utils/productRules';

const DEFAULT_MARCAS = [
  { id: 1, nombre: 'Cola' },
  { id: 2, nombre: 'Naranja' },
  { id: 3, nombre: 'Lima' },
  { id: 4, nombre: 'Pomelo' },
  { id: 5, nombre: 'Manzana' },
  { id: 6, nombre: 'Sifon' },
  { id: 7, nombre: 'Soda' },
];

export default function SidebarInfo({ customHint, showLoteTapa = false }) {
  const { production, updateProduction } = useProduction();
  const [marcasCatalog, setMarcasCatalog] = useState(DEFAULT_MARCAS);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const m = await getMarcas();
        if (m && m.length) setMarcasCatalog(m);
      } catch (_) {
        // use default marcas
      }
    }
    loadCatalog();
  }, []);

  const availableConcentrados = getConcentradosForSabor(production.sabor);
  const availableTamanos = getTamanosForSabor(production.sabor);

  const handleSaborChange = (newSabor) => {
    const validConc = getConcentradosForSabor(newSabor);
    const validTam = getTamanosForSabor(newSabor);

    const nextConc = validConc.includes(production.tipoConcentrado)
      ? production.tipoConcentrado
      : (validConc[0] || '');

    const nextTam = validTam.includes(production.tamano)
      ? production.tamano
      : (validTam[0] || '');

    updateProduction({
      sabor: newSabor,
      tipoConcentrado: nextConc,
      tamano: nextTam,
    });
  };

  const selectStyle = {
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid var(--border-glass)',
    color: '#fff',
    borderRadius: 'var(--radius-sm)',
    padding: '0.3rem 0.5rem',
    fontSize: '0.85rem',
    cursor: 'pointer',
    maxWidth: '170px',
    outline: 'none',
  };

  return (
    <aside className="sidebar-card">
      <div className="sidebar-header">
        <PackageCheck size={20} color="#00f2fe" />
        <span>Producción Activa</span>
      </div>

      <div className="sidebar-data-list">
        <div className="sidebar-data-item">
          <span className="sidebar-data-label">Línea:</span>
          <select
            value={production.linea}
            onChange={(e) => updateProduction({ linea: e.target.value })}
            style={selectStyle}
          >
            <option value="linea1">Línea 1</option>
            <option value="linea2">Línea 2</option>
          </select>
        </div>

        <div className="sidebar-data-item">
          <span className="sidebar-data-label">Turno:</span>
          <select
            value={production.turno}
            onChange={(e) => updateProduction({ turno: e.target.value })}
            style={selectStyle}
          >
            <option value="Mañana">Mañana</option>
            <option value="Tarde">Tarde</option>
            <option value="Noche">Noche</option>
          </select>
        </div>

        <div className="sidebar-data-item">
          <span className="sidebar-data-label">Sabor:</span>
          <select
            value={production.sabor}
            onChange={(e) => handleSaborChange(e.target.value)}
            style={selectStyle}
          >
            <option value="" disabled>Seleccione sabor...</option>
            {marcasCatalog.map((m) => (
              <option key={m.id} value={m.nombre}>{m.nombre}</option>
            ))}
          </select>
        </div>

        <div className="sidebar-data-item">
          <span className="sidebar-data-label">Concentrado:</span>
          <select
            value={production.tipoConcentrado}
            onChange={(e) => updateProduction({ tipoConcentrado: e.target.value })}
            style={selectStyle}
            disabled={!production.sabor}
          >
            <option value="" disabled>Seleccione...</option>
            {availableConcentrados.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="sidebar-data-item">
          <span className="sidebar-data-label">Tamaño:</span>
          <select
            value={production.tamano}
            onChange={(e) => updateProduction({ tamano: e.target.value })}
            style={selectStyle}
            disabled={!production.sabor}
          >
            <option value="" disabled>Seleccione...</option>
            {availableTamanos.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
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
