import FormLayout, { FormSection, FormField } from '../../../componentes/FormLayout';
import AnalisisCloroForm from '../componentes/AnalisisCloroForm';
import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Clock, Calendar, Beaker, User } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { getResponsables } from '../../../services/api';
import { submitControlFisicoQuimico, submitOsmosisInversa, submitFiltroArena } from '../api/aguaApi';

export default function AguaPage({ initialTab = 'fisicoQuimico' }) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);
  useEffect(() => setActiveTab(initialTab), [initialTab]);
  const [responsables, setResponsables] = useState([]);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const r = await getResponsables();
        setResponsables(r);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  // ----------------------------------------------------
  // TAB 1: CONTROL FÍSICO QUÍMICO DE AGUA
  // ----------------------------------------------------
  const initialFisicoQuimicoState = {
    tipo_agua: 'Agua de Pozo',
    fecha: '',
    hora: '',
    k: '',
    dureza: '',
    cloruros: '',
    sulfatos: '',
    alcalinidad: '',
    cloro_libre: '',
    ph: '',
    responsable: '',
  };
  const [fisicoQuimicoForm, setFisicoQuimicoForm] = useState(initialFisicoQuimicoState);

  const handleFisicoQuimicoSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving('fisicoQuimico');
    try {
      const payload = {
        ...fisicoQuimicoForm,
        fecha: fisicoQuimicoForm.fecha || null,
        hora: fisicoQuimicoForm.hora || null,
        k: parseFloat(fisicoQuimicoForm.k) || 0,
        dureza: parseFloat(fisicoQuimicoForm.dureza) || 0,
        cloruros: parseFloat(fisicoQuimicoForm.cloruros) || 0,
        sulfatos: parseFloat(fisicoQuimicoForm.sulfatos) || 0,
        alcalinidad: parseFloat(fisicoQuimicoForm.alcalinidad) || 0,
        cloro_libre: parseFloat(fisicoQuimicoForm.cloro_libre) || 0,
        ph: parseFloat(fisicoQuimicoForm.ph) || 0,
      };
      await submitControlFisicoQuimico(payload);
      showToast('Control Físico Químico guardado con éxito', 'success');
      setFisicoQuimicoForm(initialFisicoQuimicoState);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(null);
    }
  };

  // ----------------------------------------------------
  // TAB 4: OSMOSIS INVERSA
  // ----------------------------------------------------
  const initialOsmosisInversaState = {
    hora: '6:00',
    k: '',
    h: '',
    q_perm: '',
    q_mezcla: '',
    q_rechazo: '',
    p_select: 'P1',
    p_valor: '',
  };
  const [osmosisInversaForm, setOsmosisInversaForm] = useState(initialOsmosisInversaState);

  const handleOsmosisInversaSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving('osmosisInversa');
    try {
      const payload = {
        ...osmosisInversaForm,
        k: parseFloat(osmosisInversaForm.k) || 0,
        h: parseFloat(osmosisInversaForm.h) || 0,
        q_perm: parseFloat(osmosisInversaForm.q_perm) || 0,
        q_mezcla: parseFloat(osmosisInversaForm.q_mezcla) || 0,
        q_rechazo: parseFloat(osmosisInversaForm.q_rechazo) || 0,
        p_valor: parseFloat(osmosisInversaForm.p_valor) || 0,
      };
      await submitOsmosisInversa(payload);
      showToast('Osmosis Inversa guardado con éxito', 'success');
      setOsmosisInversaForm(initialOsmosisInversaState);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(null);
    }
  };

  // ----------------------------------------------------
  // TAB 5: FILTRO DE ARENA
  // ----------------------------------------------------
  const initialFiltroArenaState = {
    hora: '',
    presion_interno: '',
    presion_externo: '',
    fecha_contralavado: '',
  };
  const [filtroArenaForm, setFiltroArenaForm] = useState(initialFiltroArenaState);

  const handleFiltroArenaSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving('filtroArena');
    try {
      const payload = {
        ...filtroArenaForm,
        presion_interno: parseFloat(filtroArenaForm.presion_interno) || 0,
        presion_externo: parseFloat(filtroArenaForm.presion_externo) || 0,
      };
      await submitFiltroArena(payload);
      showToast('Filtro de Arena guardado con éxito', 'success');
      setFiltroArenaForm(initialFiltroArenaState);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="content-grid" style={{ gridTemplateColumns: '1fr' }}>
      <main className="card">
        {/* TAB 1: CONTROL FÍSICO QUÍMICO */}
        {activeTab === 'fisicoQuimico' && (
          <FormLayout title="Control físico químico" domain="CONTROL DE AGUA" description="Registre los resultados del análisis de agua." onSubmit={handleFisicoQuimicoSubmit}>
            <FormSection number="01" title="Datos del control" description="Identifique el tipo de agua y el momento del control.">
              <FormField className="field-container col-span-2">
                <label>Tipo de Agua <span className="required-star">*</span></label>
                <select
                  required
                  value={fisicoQuimicoForm.tipo_agua}
                  onChange={(e) => setFisicoQuimicoForm({ ...fisicoQuimicoForm, tipo_agua: e.target.value })}
                >
                  <option value="Agua de Pozo">Agua de Pozo</option>
                  <option value="Agua Permeada">Agua Permeada</option>
                  <option value="Agua Tratada">Agua Tratada</option>
                </select>
              </FormField>

              <FormField className="field-container">
                <label>Fecha</label>
                <div className="input-wrapper">
                  <Calendar className="input-icon" size={18} />
                  <input
                    type="date"
                    value={fisicoQuimicoForm.fecha}
                    onChange={(e) => setFisicoQuimicoForm({ ...fisicoQuimicoForm, fecha: e.target.value })}
                  />
                </div>
              </FormField>

              <FormField className="field-container">
                <label>Hora</label>
                <div className="input-wrapper">
                  <Clock className="input-icon" size={18} />
                  <input
                    type="time"
                    value={fisicoQuimicoForm.hora}
                    onChange={(e) => setFisicoQuimicoForm({ ...fisicoQuimicoForm, hora: e.target.value })}
                  />
                </div>
              </FormField>

</FormSection>
<FormSection number="02" title="Mediciones" description="Complete los resultados obtenidos en el análisis.">              {['k', 'dureza', 'cloruros', 'sulfatos', 'alcalinidad', 'cloro_libre', 'ph'].map((field) => (
                <FormField key={field} className="field-container">
                  <label>{field.replace('_', ' ').toUpperCase()} <span className="required-star">*</span></label>
                  <div className="input-wrapper">
                    <Beaker className="input-icon" size={18} />
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder={`Ej: ${field === 'ph' ? '7.0' : '1.5'}`}
                      value={fisicoQuimicoForm[field]}
                      onChange={(e) => setFisicoQuimicoForm({ ...fisicoQuimicoForm, [field]: e.target.value })}
                    />
                  </div>
                </FormField>
              ))}

              </FormSection>
<FormSection number="03" title="Responsable" description="Seleccione quién realizó el control."><FormField className="field-container col-span-2">
                <label>Responsable <span className="required-star">*</span></label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <select
                    required
                    value={fisicoQuimicoForm.responsable}
                    onChange={(e) => setFisicoQuimicoForm({ ...fisicoQuimicoForm, responsable: e.target.value })}
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
              <button type="button" className="btn btn-secondary" onClick={() => setFisicoQuimicoForm(initialFisicoQuimicoState)}>
                <RotateCcw size={16} /> Limpiar
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving === 'fisicoQuimico'}>
                <Save size={16} /> {saving === 'fisicoQuimico' ? 'Guardando…' : 'Registrar Control'}
              </button>
            </div>
          </FormLayout>
        )}

        {/* TAB 3: ANÁLISIS DE CLORO */}
        {activeTab === 'analisisCloro' && <AnalisisCloroForm responsables={responsables} />}

        {/* TAB 4: OSMOSIS INVERSA */}
        {activeTab === 'osmosisInversa' && (
          <FormLayout title="Ósmosis inversa" domain="CONTROL DE AGUA" description="Registre las mediciones del sistema de ósmosis." onSubmit={handleOsmosisInversaSubmit}>
            <FormSection number="01" title="Horario del control" description="Seleccione el horario de la medición.">
              <FormField className="field-container">
                <label>Hora <span className="required-star">*</span></label>
                <select
                  required
                  value={osmosisInversaForm.hora}
                  onChange={(e) => setOsmosisInversaForm({ ...osmosisInversaForm, hora: e.target.value })}
                >
                  <option value="6:00">6:00</option>
                  <option value="11:00">11:00</option>
                  <option value="15:00">15:00</option>
                  <option value="19:00">19:00</option>
                  <option value="00:00">00:00</option>
                </select>
              </FormField>

              </FormSection>
<FormSection number="02" title="Mediciones de agua" description="Registre los valores K y H."><FormField className="field-container">
                <label>K <span className="required-star">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej: 10.5"
                  value={osmosisInversaForm.k}
                  onChange={(e) => setOsmosisInversaForm({ ...osmosisInversaForm, k: e.target.value })}
                />
              </FormField>

              <FormField className="field-container">
                <label>H <span className="required-star">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej: 5.5"
                  value={osmosisInversaForm.h}
                  onChange={(e) => setOsmosisInversaForm({ ...osmosisInversaForm, h: e.target.value })}
                />
              </FormField>

              </FormSection>
<FormSection number="03" title="Caudales" description="Complete los caudales del proceso."><FormField className="field-container">
                <label>Q Perm <span className="required-star">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej: 12.3"
                  value={osmosisInversaForm.q_perm}
                  onChange={(e) => setOsmosisInversaForm({ ...osmosisInversaForm, q_perm: e.target.value })}
                />
              </FormField>

              <FormField className="field-container">
                <label>Q Mezcla <span className="required-star">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej: 8.2"
                  value={osmosisInversaForm.q_mezcla}
                  onChange={(e) => setOsmosisInversaForm({ ...osmosisInversaForm, q_mezcla: e.target.value })}
                />
              </FormField>

              <FormField className="field-container">
                <label>Q Rechazo <span className="required-star">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej: 2.1"
                  value={osmosisInversaForm.q_rechazo}
                  onChange={(e) => setOsmosisInversaForm({ ...osmosisInversaForm, q_rechazo: e.target.value })}
                />
              </FormField>

              </FormSection>
<FormSection number="04" title="Presión" description="Seleccione el punto de control y registre el resultado."><FormField className="field-container">
                <label>P <span className="required-star">*</span></label>
                <select
                  required
                  value={osmosisInversaForm.p_select}
                  onChange={(e) => setOsmosisInversaForm({ ...osmosisInversaForm, p_select: e.target.value })}
                >
                  <option value="P1">P1</option>
                  <option value="P2">P2</option>
                  <option value="P3">P3</option>
                  <option value="P4">P4</option>
                  <option value="P5">P5</option>
                </select>
              </FormField>

              <FormField className="field-container">
                <label>P ({osmosisInversaForm.p_select}) Valor <span className="required-star">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Valor de P"
                  value={osmosisInversaForm.p_valor}
                  onChange={(e) => setOsmosisInversaForm({ ...osmosisInversaForm, p_valor: e.target.value })}
                />
              </FormField>
            </FormSection>


            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setOsmosisInversaForm(initialOsmosisInversaState)}>
                <RotateCcw size={16} /> Limpiar
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving === 'osmosisInversa'}>
                <Save size={16} /> {saving === 'osmosisInversa' ? 'Guardando…' : 'Registrar Osmosis'}
              </button>
            </div>
          </FormLayout>
        )}

        {/* TAB 5: FILTRO DE ARENA */}
        {activeTab === 'filtroArena' && (
          <FormLayout title="Filtro de arena" domain="CONTROL DE AGUA" description="Registre las presiones y el contralavado del filtro." onSubmit={handleFiltroArenaSubmit}>
            <FormSection number="01" title="Horario del control" description="Indique cuándo se realizó el control.">
              <FormField className="field-container">
                <label>Hora <span className="required-star">*</span></label>
                <div className="input-wrapper">
                  <Clock className="input-icon" size={18} />
                  <input
                    type="time"
                    required
                    value={filtroArenaForm.hora}
                    onChange={(e) => setFiltroArenaForm({ ...filtroArenaForm, hora: e.target.value })}
                  />
                </div>
              </FormField>

              </FormSection>
<FormSection number="02" title="Presiones" description="Registre las mediciones de entrada y salida."><FormField className="field-container">
                <label>Presión Interno <span className="required-star">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej: 3.2"
                  value={filtroArenaForm.presion_interno}
                  onChange={(e) => setFiltroArenaForm({ ...filtroArenaForm, presion_interno: e.target.value })}
                />
              </FormField>

              <FormField className="field-container">
                <label>Presión Externo <span className="required-star">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej: 4.5"
                  value={filtroArenaForm.presion_externo}
                  onChange={(e) => setFiltroArenaForm({ ...filtroArenaForm, presion_externo: e.target.value })}
                />
              </FormField>

              </FormSection>
<FormSection number="03" title="Contralavado" description="Indique la fecha del contralavado."><FormField className="field-container">
                <label>Fecha Contralavado <span className="required-star">*</span></label>
                <div className="input-wrapper">
                  <Calendar className="input-icon" size={18} />
                  <input
                    type="date"
                    required
                    value={filtroArenaForm.fecha_contralavado}
                    onChange={(e) => setFiltroArenaForm({ ...filtroArenaForm, fecha_contralavado: e.target.value })}
                  />
                </div>
              </FormField>
            </FormSection>


            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setFiltroArenaForm(initialFiltroArenaState)}>
                <RotateCcw size={16} /> Limpiar
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving === 'filtroArena'}>
                <Save size={16} /> {saving === 'filtroArena' ? 'Guardando…' : 'Registrar Filtro'}
              </button>
            </div>
          </FormLayout>
        )}
      </main>
    </div>
  );
}
