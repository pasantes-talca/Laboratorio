import FormLayout, { FormSection, FormField } from '../../../componentes/FormLayout';
import React from 'react';
import { Droplet, Gauge, Save, RotateCcw, Clock, User, FlaskRound as Flask } from 'lucide-react';

export default function BebidaForm({
  production,
  productionReady,
  responsables,
  bebidaForm,
  setBebidaForm,
  handleBebidaSubmit,
  rememberLoteTapa,
}) {
  return (
    <FormLayout title="Bebida terminada" domain="CONTROL DE CALIDAD" description="Registre la inspección y las mediciones del producto terminado." onSubmit={handleBebidaSubmit} style={{ marginTop: '1.25rem' }}>
      <FormSection number="01" title="Datos del control" description="Indique el momento en que se realizó el control.">

        <FormField className="field-container">
          <label>Hora</label>
          <div className="input-wrapper">
            <Clock className="input-icon" size={18} />
            <input
              type="time"
              value={bebidaForm.hora}
              onChange={(e) => setBebidaForm({ ...bebidaForm, hora: e.target.value })}
            />
          </div>
        </FormField>


</FormSection>
<FormSection number="02" title="Inspección del producto" description="Verifique el aspecto, el llenado y el contenido.">
<FormField className="field-container">
          <label>Características Organolépticas <span className="required-star">*</span></label>
          <select
            required
            value={bebidaForm.carac_organolep}
            onChange={(e) => setBebidaForm({ ...bebidaForm, carac_organolep: e.target.value })}
          >
            <option value="OK">OK</option>
            <option value="NOK">NOK</option>
          </select>
        </FormField>

        <FormField className="field-container">
          <label>Nivel de Llenado <span className="required-star">*</span></label>
          <select
            required
            value={bebidaForm.nivel_llenado}
            onChange={(e) => setBebidaForm({ ...bebidaForm, nivel_llenado: e.target.value })}
          >
            <option value="OK">OK</option>
            <option value="NOK">NOK</option>
          </select>
        </FormField>

        <FormField className="field-container">
          <label>Contenido (ml / L) <span className="required-star">*</span></label>
          <div className="input-wrapper">
            <Flask className="input-icon" size={18} />
            <input
              type="number"
              step="0.01"
              required
              placeholder="Ej: 2250"
              value={bebidaForm.contenido}
              onChange={(e) => setBebidaForm({ ...bebidaForm, contenido: e.target.value })}
            />
          </div>
        </FormField>


</FormSection>
<FormSection number="03" title="Mediciones" description="Cargue los resultados obtenidos en el análisis.">
<FormField className="field-container">
          <label>Presión (PSI / bar) <span className="required-star">*</span></label>
          <div className="input-wrapper">
            <Gauge className="input-icon" size={18} />
            <input
              type="number"
              step="0.01"
              required
              placeholder="Ej: 3.2"
              value={bebidaForm.presion}
              onChange={(e) => setBebidaForm({ ...bebidaForm, presion: e.target.value })}
            />
          </div>
        </FormField>

        <FormField className="field-container">
          <label>Temperat. (°C) <span className="required-star">*</span></label>
          <input
            type="number"
            step="0.1"
            required
            placeholder="Ej: 4.5"
            value={bebidaForm.temperatura}
            onChange={(e) => setBebidaForm({ ...bebidaForm, temperatura: e.target.value })}
          />
        </FormField>

        <FormField className="field-container">
          <label>Vol. Gas (GV) <span className="required-star">*</span></label>
          <input
            type="number"
            step="0.01"
            required
            placeholder="Ej: 3.8"
            value={bebidaForm.vol_gas}
            onChange={(e) => setBebidaForm({ ...bebidaForm, vol_gas: e.target.value })}
          />
        </FormField>

        <FormField className="field-container">
          <label>°Brix <span className="required-star">*</span></label>
          <div className="input-wrapper">
            <Droplet className="input-icon" size={18} />
            <input
              type="number"
              step="0.01"
              required
              placeholder="Ej: 10.45"
              value={bebidaForm.brix}
              onChange={(e) => setBebidaForm({ ...bebidaForm, brix: e.target.value })}
            />
          </div>
        </FormField>


</FormSection>
<FormSection number="04" title="Identificación y trazabilidad" description="Controle la impresión y registre el lote de tapa.">
<FormField className="field-container">
          <label>Control Video Jet <span className="required-star">*</span></label>
          <select
            required
            value={bebidaForm.control_videojet}
            onChange={(e) => setBebidaForm({ ...bebidaForm, control_videojet: e.target.value })}
          >
            <option value="OK">OK</option>
            <option value="NOK">NOK</option>
          </select>
        </FormField>

        <FormField className="field-container">
          <label htmlFor="bebida-lote-tapa">Lote de tapa <span className="required-star">*</span></label>
          <input
            id="bebida-lote-tapa"
            type="text"
            required
            maxLength={50}
            placeholder="Ej: LOTE-T-2026"
            value={bebidaForm.lote_tapa}
            onChange={(e) => {
              rememberLoteTapa(production.linea, e.target.value);
              setBebidaForm({ ...bebidaForm, lote_tapa: e.target.value });
            }}
          />
        </FormField>


</FormSection>
<FormSection number="05" title="Responsable" description="Seleccione quién realizó el control.">
<FormField className="field-container col-span-2">
          <label>Respons. <span className="required-star">*</span></label>
          <div className="input-wrapper">
            <User className="input-icon" size={18} />
            <select
              required
              value={bebidaForm.responsable}
              onChange={(e) => setBebidaForm({ ...bebidaForm, responsable: e.target.value })}
            >
              <option value="" disabled>Seleccione responsable...</option>
              {responsables.map((r) => (
                <option key={r.id} value={r.nombre_completo}>{r.nombre_completo}</option>
              ))}
            </select>
          </div>
        </FormField>

</FormSection>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setBebidaForm({
            hora: '',
            carac_organolep: 'OK',
            nivel_llenado: 'OK',
            contenido: '',
            presion: '',
            temperatura: '',
            vol_gas: '',
            brix: '',
            lote_tapa: bebidaForm.lote_tapa,
            control_videojet: 'OK',
            responsable: '',
          })}
        >
          <RotateCcw size={16} /> Limpiar
        </button>
        <button type="submit" className="btn btn-primary" disabled={!productionReady}>
          <Save size={16} /> Registrar Control de Bebida
        </button>
      </div>
    </FormLayout>
  );
}
