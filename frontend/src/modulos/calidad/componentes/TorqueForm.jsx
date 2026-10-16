import FormLayout, { FormSection, FormField } from '../../../componentes/FormLayout';
import React from 'react';
import { Gauge, Save, RotateCcw, Clock, Plus, Trash2 } from 'lucide-react';

export default function TorqueForm({
  production,
  productionReady,
  responsables,
  maxCabezales,
  torqueForm,
  setTorqueForm,
  addCabezal,
  removeCabezal,
  updateCabezal,
  handleTorqueSubmit,
}) {
  return (
    <FormLayout title="Control de torque" domain="CONTROL DE CALIDAD" description="Registre la medición de torque de cada cabezal." onSubmit={handleTorqueSubmit} style={{ marginTop: '1.25rem' }}>
      <FormSection number="01" title="Datos del control" description="Identifique la tapa y el responsable del control.">

        <FormField className="field-container">
          <label>Hora</label>
          <div className="input-wrapper">
            <Clock className="input-icon" size={18} />
            <input
              type="time"
              value={torqueForm.hora}
              onChange={(e) => setTorqueForm({ ...torqueForm, hora: e.target.value })}
            />
          </div>
        </FormField>

        <FormField className="field-container">
          <label>Marca de Tapa</label>
          <select
            value={torqueForm.marca_tapa}
            onChange={(e) => setTorqueForm({ ...torqueForm, marca_tapa: e.target.value })}
          >
            <option value="">Sin especificar</option>
            <option value="PRIVA">PRIVA</option>
            <option value="SIDES">SIDES</option>
          </select>
        </FormField>

        <FormField className="field-container">
          <label>Color de Tapa</label>
          <input
            type="text"
            placeholder="Automático según sabor"
            value={torqueForm.color || '—'}
            readOnly
            style={{ opacity: 0.85, cursor: 'default' }}
          />
        </FormField>

        <FormField className="field-container col-span-2">
          <label>Respons. <span className="required-star">*</span></label>
          <select
            required
            value={torqueForm.responsable}
            onChange={(e) => setTorqueForm({ ...torqueForm, responsable: e.target.value })}
          >
            <option value="" disabled>Seleccione responsable...</option>
            {responsables.map((r) => (
              <option key={r.id} value={r.nombre_completo}>{r.nombre_completo}</option>
            ))}
          </select>
        </FormField>

</FormSection>

      {/* Dynamic cabezal list */}
      <FormSection number="02" title="Mediciones por cabezal" description="Agregue los cabezales medidos y registre el torque de cada uno." grid={false}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
          Cabezales ({production.linea === 'linea2' ? '1 a 14' : '1 a 12'}) <span className="required-star">*</span>
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {torqueForm.cabezales.map((cab, idx) => (
            <div key={idx} className="lab-torque-row" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select
                aria-label={`Cabezal de la medición ${idx + 1}`}
                value={cab.numero}
                onChange={(e) => updateCabezal(idx, 'numero', parseInt(e.target.value, 10))}
                style={{ minWidth: '160px', width: 'auto', flexShrink: 0, paddingLeft: '1rem' }}
              >
                {Array.from({ length: maxCabezales }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>Cabezal {num}</option>
                ))}
              </select>
              <div className="input-wrapper" style={{ flex: 1 }}>
                <Gauge className="input-icon" size={18} />
                <input
                  aria-label={`Torque del cabezal ${cab.numero} (Lbs.In)`}
                  type="number"
                  step="0.1"
                  required
                  placeholder="Valor (Ej: 14.5)"
                  value={cab.valor}
                  onChange={(e) => updateCabezal(idx, 'valor', e.target.value)}
                />
              </div>
              <span className="lab-row-unit">Lbs.In</span>
              {torqueForm.cabezales.length > 1 && (
                <button
                  type="button"
                  aria-label={`Quitar medición ${idx + 1}`}
                  onClick={() => removeCabezal(idx)}
                  style={{
                    background: 'var(--color-error-bg, #FFF5F5)',
                    border: '1px solid rgba(229, 62, 62, 0.3)',
                    color: 'var(--color-error, #E53E3E)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.4rem 0.6rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addCabezal}
          style={{
            marginTop: '0.5rem',
            background: 'var(--color-azul-hielo, #E8F4F8)',
            border: '1px dashed var(--color-azul-clinico, #0077B6)',
            color: 'var(--color-azul-clinico, #0077B6)',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            width: '100%',
            justifyContent: 'center',
          }}
        >
          <Plus size={15} /> Agregar Cabezal
        </button>
      </FormSection>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setTorqueForm((prev) => ({ ...prev, hora: '', cabezales: [{ numero: 1, valor: '' }] }))}
        >
          <RotateCcw size={16} /> Reiniciar al Cabezal 1
        </button>
        <button type="submit" className="btn btn-primary" disabled={!productionReady}>
          <Save size={16} /> Registrar Torque
        </button>
      </div>
    </FormLayout>
  );
}
