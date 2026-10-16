import React from 'react';
import { Save, RotateCcw, User } from 'lucide-react';
import MultiInputList from '../../../componentes/MultiInputList';

export default function JarabeTerminadoForm({
  responsables,
  availableVolcados,
  today,
  terminadoForm,
  setTerminadoForm,
  handleTerminadoSubmit,
}) {
  return (
    <form id="terminado-form" onSubmit={handleTerminadoSubmit} style={{ marginTop: '1.25rem' }}>
      <div className="form-grid">
    
        <div className="field-container">
          <label>Unidades / Cargas <span className="required-star">*</span></label>
          <input
            type="number"
            required
            placeholder="Ej: 2"
            value={terminadoForm.unidades}
            onChange={(e) => setTerminadoForm({ ...terminadoForm, unidades: e.target.value })}
          />
        </div>
    
        <div className="field-container">
          <label>Tiempo Filtrado (min / hs)</label>
          <input
            type="text"
            placeholder="Ej: 45 min"
            value={terminadoForm.tiempo_filtrado}
            onChange={(e) => setTerminadoForm({ ...terminadoForm, tiempo_filtrado: e.target.value })}
          />
        </div>
    
        <div className="field-container col-span-2">
          <label>Número(s) de Volcado <span className="required-star">*</span></label>
          {availableVolcados.length > 0 ? (
            <MultiInputList
              type="select"
              items={terminadoForm.volcados}
              options={availableVolcados.map(v => ({ value: String(v), label: `Volcado ${v}` }))}
              onChange={(volcados) => setTerminadoForm({ ...terminadoForm, volcados })}
              placeholder="Seleccione volcado..."
              addButtonText="Agregar Número de Volcado"
              required
            />
          ) : (
            <div>
              <MultiInputList
                items={terminadoForm.volcados}
                onChange={(volcados) => setTerminadoForm({ ...terminadoForm, volcados })}
                placeholder="Ej: 1"
                addButtonText="Agregar Número de Volcado"
                required
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                No hay volcados registrados para este tanque/fecha en Jarabe Simple. Ingrese el número manualmente.
              </span>
            </div>
          )}
        </div>
    
        <div className="field-container">
          <label>°Brix Jarabe Simple</label>
          <input
            type="number"
            step="0.01"
            placeholder="Ej: 65.5"
            value={terminadoForm.be_jarabe_simple}
            onChange={(e) => setTerminadoForm({ ...terminadoForm, be_jarabe_simple: e.target.value })}
          />
        </div>
    
        <div className="field-container">
          <label>Volumen Jarabe Simple (Lts)</label>
          <input
            type="number"
            step="0.1"
            placeholder="Ej: 4500"
            value={terminadoForm.vol_jarabe_simple}
            onChange={(e) => setTerminadoForm({ ...terminadoForm, vol_jarabe_simple: e.target.value })}
          />
        </div>
    
        <div className="field-container col-span-2">
          <label>Litros Jarabe Terminado (Lts)</label>
          <input
            type="number"
            step="0.1"
            placeholder="Ej: 6000"
            value={terminadoForm.lts_jarabe_terminado}
            onChange={(e) => setTerminadoForm({ ...terminadoForm, lts_jarabe_terminado: e.target.value })}
          />
        </div>
    
        <div className="field-container col-span-2">
          <label>Responsables (Sala de Jarabe) <span className="required-star">*</span></label>
          <MultiInputList
            type="select"
            items={terminadoForm.responsables}
            options={responsables.map((r) => ({ value: r.nombre_completo, label: r.nombre_completo }))}
            onChange={(responsables) => setTerminadoForm({ ...terminadoForm, responsables })}
            placeholder="Seleccione responsable..."
            addButtonText="Agregar responsable"
            icon={User}
            required
          />
        </div>
      </div>
    
      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setTerminadoForm({
            fecha: today,
            sabor: '',
            concentrado: '',
            tanque: '',
            unidades: '',
            volcados: [''],
            tiempo_filtrado: '',
            be_jarabe_simple: '',
            vol_jarabe_simple: '',
            lts_jarabe_terminado: '',
            responsables: [''],
          })}
        >
          <RotateCcw size={16} /> Limpiar
        </button>
        <button type="submit" className="btn btn-primary">
          <Save size={16} /> Registrar Jarabe Terminado
        </button>
      </div>
    </form>
  );
}
