import React from 'react';
import { Save, RotateCcw, User } from 'lucide-react';
import MultiInputList from '../../../componentes/MultiInputList';

export default function SaneoTanquesForm({
  responsables,
  tanquesCatalog,
  today,
  saneoForm,
  setSaneoForm,
  handleSaneoSubmit,
}) {
  return (
    <form onSubmit={handleSaneoSubmit} style={{ marginTop: '1.25rem' }}>
      <div className="form-grid">
        <div className="field-container">
          <label>Fecha <span className="required-star">*</span></label>
          <input
            type="date"
            required
            value={saneoForm.fecha}
            onChange={(e) => setSaneoForm({ ...saneoForm, fecha: e.target.value })}
          />
        </div>
    
        <div className="field-container">
          <label>Tanque a Sanear <span className="required-star">*</span></label>
          <select
            required
            value={saneoForm.tanque}
            onChange={(e) => setSaneoForm({ ...saneoForm, tanque: e.target.value })}
          >
            <option value="" disabled>Seleccione tanque...</option>
            {tanquesCatalog.map((t) => (
              <option key={t.id} value={t.numero}>{t.numero === 'N/A' ? 'N/A' : `Tanque ${t.numero}`}</option>
            ))}
          </select>
        </div>
    
        <div className="field-container">
          <label>N° Saneo <span className="required-star">*</span></label>
          <input
            type="number"
            required
            placeholder="Ej: 1"
            value={saneoForm.numero_saneo}
            onChange={(e) => setSaneoForm({ ...saneoForm, numero_saneo: e.target.value })}
          />
        </div>
    
        <div className="field-container">
          <label>Hora de Inicio</label>
          <input
            type="time"
            value={saneoForm.hora_inicio}
            onChange={(e) => setSaneoForm({ ...saneoForm, hora_inicio: e.target.value })}
          />
        </div>
    
        <div className="field-container">
          <label>Hora de Finalización</label>
          <input
            type="time"
            value={saneoForm.hora_fin}
            onChange={(e) => setSaneoForm({ ...saneoForm, hora_fin: e.target.value })}
          />
        </div>
    
        <div className="field-container col-span-2">
          <label>Producto de Saneo / CIP <span className="required-star">*</span></label>
          <input
            type="text"
            required
            placeholder="Ej: Soda Cáustica 2%, Ácido Peracético"
            value={saneoForm.producto}
            onChange={(e) => setSaneoForm({ ...saneoForm, producto: e.target.value })}
          />
        </div>
    
        <div className="field-container col-span-2">
          <label>Responsables del Saneo <span className="required-star">*</span></label>
          <MultiInputList
            type="select"
            items={saneoForm.responsables}
            options={responsables.map((r) => ({ value: r.nombre_completo, label: r.nombre_completo }))}
            onChange={(responsables) => setSaneoForm({ ...saneoForm, responsables })}
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
          onClick={() => setSaneoForm({
            fecha: today,
            hora_inicio: '',
            hora_fin: '',
            tanque: '',
            producto: '',
            responsables: [''],
            numero_saneo: '',
          })}
        >
          <RotateCcw size={16} /> Limpiar
        </button>
        <button type="submit" className="btn btn-primary">
          <Save size={16} /> Registrar Saneo de Tanque
        </button>
      </div>
    </form>
  );
}
