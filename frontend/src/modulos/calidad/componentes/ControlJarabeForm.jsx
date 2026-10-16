import React from 'react';
import { Save, RotateCcw, Clock } from 'lucide-react';

export default function ControlJarabeForm({
  productionReady,
  responsables,
  tanquesCatalog,
  jarabeForm,
  setJarabeForm,
  handleJarabeSubmit,
}) {
  return (
    <form onSubmit={handleJarabeSubmit} style={{ marginTop: '1.25rem' }}>
      <div className="form-grid">
        <div className="field-container">
          <label>Hora</label>
          <div className="input-wrapper">
            <Clock className="input-icon" size={18} />
            <input
              type="time"
              value={jarabeForm.hora}
              onChange={(e) => setJarabeForm({ ...jarabeForm, hora: e.target.value })}
            />
          </div>
        </div>
    
        <div className="field-container">
          <label>Número de Tanque <span className="required-star">*</span></label>
          <select
            required
            value={jarabeForm.tanque}
            onChange={(e) => setJarabeForm({ ...jarabeForm, tanque: e.target.value })}
          >
            <option value="" disabled>Seleccione tanque...</option>
            {tanquesCatalog.map((t) => (
              <option key={t.id} value={t.numero}>{t.numero === 'N/A' ? 'N/A' : `Tanque ${t.numero}`}</option>
            ))}
          </select>
        </div>
    
        <div className="field-container">
          <label>°Bx Patr. <span className="required-star">*</span></label>
          <input
            type="number"
            step="0.01"
            required
            placeholder="Ej: 54.20"
            value={jarabeForm.bx_patron}
            onChange={(e) => setJarabeForm({ ...jarabeForm, bx_patron: e.target.value })}
          />
        </div>
    
        <div className="field-container">
          <label>T.A. <span className="required-star">*</span></label>
          <input
            type="number"
            step="0.01"
            required
            placeholder="Ej: 1.25"
            value={jarabeForm.ta}
            onChange={(e) => setJarabeForm({ ...jarabeForm, ta: e.target.value })}
          />
        </div>
    
        <div className="field-container col-span-2">
          <label>Respons. <span className="required-star">*</span></label>
          <select
            required
            value={jarabeForm.responsable}
            onChange={(e) => setJarabeForm({ ...jarabeForm, responsable: e.target.value })}
          >
            <option value="" disabled>Seleccione responsable...</option>
            {responsables.map((r) => (
              <option key={r.id} value={r.nombre_completo}>{r.nombre_completo}</option>
            ))}
          </select>
        </div>
      </div>
    
      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setJarabeForm({
            hora: '',
            tanque: '',
            bx_patron: '',
            ta: '',
            responsable: '',
          })}
        >
          <RotateCcw size={16} /> Limpiar
        </button>
        <button type="submit" className="btn btn-primary" disabled={!productionReady}>
          <Save size={16} /> Registrar Control de Jarabe
        </button>
      </div>
    </form>
  );
}
