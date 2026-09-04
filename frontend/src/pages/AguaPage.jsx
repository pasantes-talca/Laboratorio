import React, { useState, useEffect } from 'react';
import { Droplet, Save, RotateCcw, Clock, Calendar, Beaker, User, Activity, Droplets, Filter } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { getResponsables, submitControlFisicoQuimico, submitAnalisisCloro, submitOsmosisInversa, submitFiltroArena } from '../services/api';

export default function AguaPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('fisicoQuimico');
  const [responsables, setResponsables] = useState([]);

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
    }
  };

  // ----------------------------------------------------
  // TAB 3: ANÁLISIS DE CLORO
  // ----------------------------------------------------
  const initialAnalisisCloroState = {
    hora: '',
    tanque_agua_osmosis: '',
    filtro_carbon_a: 'Cumple',
    filtro_carbon_b: 'Cumple',
    filtro_carbon_c: 'Cumple',
    contralavado_tanque_a: '',
    contralavado_tanque_b: '',
    cloro_riser_linea: 'Linea 1',
    cloro_riser_resultado: '',
    responsable: '',
  };
  const [analisisCloroForm, setAnalisisCloroForm] = useState(initialAnalisisCloroState);

  const handleAnalisisCloroSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...analisisCloroForm,
        tanque_agua_osmosis: parseFloat(analisisCloroForm.tanque_agua_osmosis) || 0,
        cloro_riser_resultado: parseFloat(analisisCloroForm.cloro_riser_resultado) || 0,
      };
      await submitAnalisisCloro(payload);
      showToast('Análisis de Cloro guardado con éxito', 'success');
      setAnalisisCloroForm(initialAnalisisCloroState);
    } catch (err) {
      showToast(err.message, 'error');
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
    }
  };

  return (
    <div className="content-grid" style={{ gridTemplateColumns: '1fr' }}>
      <main className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <div className="tabs-container" style={{ marginBottom: 0, borderBottom: 'none' }}>
            <button
              type="button"
              className={`tab-button ${activeTab === 'fisicoQuimico' ? 'active' : ''}`}
              onClick={() => setActiveTab('fisicoQuimico')}
            >
              <Droplet size={18} />
              Control Físico Químico
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === 'analisisCloro' ? 'active' : ''}`}
              onClick={() => setActiveTab('analisisCloro')}
            >
              <Activity size={18} />
              Análisis de Cloro
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === 'osmosisInversa' ? 'active' : ''}`}
              onClick={() => setActiveTab('osmosisInversa')}
            >
              <Droplets size={18} />
              Osmosis Inversa
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === 'filtroArena' ? 'active' : ''}`}
              onClick={() => setActiveTab('filtroArena')}
            >
              <Filter size={18} />
              Filtro de Arena
            </button>
          </div>
        </div>
        <hr style={{ borderColor: 'var(--border-glass)', marginBottom: '1.5rem' }} />

        {/* TAB 1: CONTROL FÍSICO QUÍMICO */}
        {activeTab === 'fisicoQuimico' && (
          <form onSubmit={handleFisicoQuimicoSubmit}>
            <div className="form-grid">
              <div className="field-container col-span-2">
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
              </div>

              <div className="field-container">
                <label>Fecha (Opcional)</label>
                <div className="input-wrapper">
                  <Calendar className="input-icon" size={18} />
                  <input
                    type="date"
                    value={fisicoQuimicoForm.fecha}
                    onChange={(e) => setFisicoQuimicoForm({ ...fisicoQuimicoForm, fecha: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="field-container">
                <label>Hora (Opcional)</label>
                <div className="input-wrapper">
                  <Clock className="input-icon" size={18} />
                  <input
                    type="time"
                    value={fisicoQuimicoForm.hora}
                    onChange={(e) => setFisicoQuimicoForm({ ...fisicoQuimicoForm, hora: e.target.value })}
                  />
                </div>
              </div>

              {['k', 'dureza', 'cloruros', 'sulfatos', 'alcalinidad', 'cloro_libre', 'ph'].map((field) => (
                <div key={field} className="field-container">
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
                </div>
              ))}

              <div className="field-container col-span-2">
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
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setFisicoQuimicoForm(initialFisicoQuimicoState)}>
                <RotateCcw size={16} /> Limpiar
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Registrar Control
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: ANÁLISIS DE CLORO */}
        {activeTab === 'analisisCloro' && (
          <form onSubmit={handleAnalisisCloroSubmit}>
            <div className="form-grid">
              <div className="field-container">
                <label>Hora <span className="required-star">*</span></label>
                <div className="input-wrapper">
                  <Clock className="input-icon" size={18} />
                  <input
                    type="time"
                    required
                    value={analisisCloroForm.hora}
                    onChange={(e) => setAnalisisCloroForm({ ...analisisCloroForm, hora: e.target.value })}
                  />
                </div>
              </div>

              <div className="field-container">
                <label>Tanque Agua Osmosis <span className="required-star">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej: 10.5"
                  value={analisisCloroForm.tanque_agua_osmosis}
                  onChange={(e) => setAnalisisCloroForm({ ...analisisCloroForm, tanque_agua_osmosis: e.target.value })}
                />
              </div>

              <div className="field-container">
                <label>Filtro Carbón A <span className="required-star">*</span></label>
                <select
                  required
                  value={analisisCloroForm.filtro_carbon_a}
                  onChange={(e) => setAnalisisCloroForm({ ...analisisCloroForm, filtro_carbon_a: e.target.value })}
                >
                  <option value="Cumple">Cumple</option>
                  <option value="No Cumple">No Cumple</option>
                </select>
              </div>

              <div className="field-container">
                <label>Filtro Carbón B <span className="required-star">*</span></label>
                <select
                  required
                  value={analisisCloroForm.filtro_carbon_b}
                  onChange={(e) => setAnalisisCloroForm({ ...analisisCloroForm, filtro_carbon_b: e.target.value })}
                >
                  <option value="Cumple">Cumple</option>
                  <option value="No Cumple">No Cumple</option>
                </select>
              </div>

              <div className="field-container">
                <label>Filtro Carbón C <span className="required-star">*</span></label>
                <select
                  required
                  value={analisisCloroForm.filtro_carbon_c}
                  onChange={(e) => setAnalisisCloroForm({ ...analisisCloroForm, filtro_carbon_c: e.target.value })}
                >
                  <option value="Cumple">Cumple</option>
                  <option value="No Cumple">No Cumple</option>
                </select>
              </div>

              <div className="field-container">
                <label>Contralavado Tanque A <span className="required-star">*</span></label>
                <div className="input-wrapper">
                  <Calendar className="input-icon" size={18} />
                  <input
                    type="date"
                    required
                    value={analisisCloroForm.contralavado_tanque_a}
                    onChange={(e) => setAnalisisCloroForm({ ...analisisCloroForm, contralavado_tanque_a: e.target.value })}
                  />
                </div>
              </div>

              <div className="field-container">
                <label>Contralavado Tanque B <span className="required-star">*</span></label>
                <div className="input-wrapper">
                  <Calendar className="input-icon" size={18} />
                  <input
                    type="date"
                    required
                    value={analisisCloroForm.contralavado_tanque_b}
                    onChange={(e) => setAnalisisCloroForm({ ...analisisCloroForm, contralavado_tanque_b: e.target.value })}
                  />
                </div>
              </div>

              <div className="field-container">
                <label>Cloro Riser Línea <span className="required-star">*</span></label>
                <select
                  required
                  value={analisisCloroForm.cloro_riser_linea}
                  onChange={(e) => setAnalisisCloroForm({ ...analisisCloroForm, cloro_riser_linea: e.target.value })}
                >
                  <option value="Linea 1">Línea 1</option>
                  <option value="Linea 2">Línea 2</option>
                </select>
              </div>

              <div className="field-container">
                <label>Cloro Riser Resultado <span className="required-star">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej: 1.2"
                  value={analisisCloroForm.cloro_riser_resultado}
                  onChange={(e) => setAnalisisCloroForm({ ...analisisCloroForm, cloro_riser_resultado: e.target.value })}
                />
              </div>

              <div className="field-container col-span-2">
                <label>Responsable <span className="required-star">*</span></label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <select
                    required
                    value={analisisCloroForm.responsable}
                    onChange={(e) => setAnalisisCloroForm({ ...analisisCloroForm, responsable: e.target.value })}
                  >
                    <option value="" disabled>Seleccione responsable...</option>
                    {responsables.map((r) => (
                      <option key={r.id} value={r.nombre_completo}>{r.nombre_completo}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setAnalisisCloroForm(initialAnalisisCloroState)}>
                <RotateCcw size={16} /> Limpiar
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Registrar Análisis
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: OSMOSIS INVERSA */}
        {activeTab === 'osmosisInversa' && (
          <form onSubmit={handleOsmosisInversaSubmit}>
            <div className="form-grid">
              <div className="field-container">
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
              </div>

              <div className="field-container">
                <label>K <span className="required-star">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej: 10.5"
                  value={osmosisInversaForm.k}
                  onChange={(e) => setOsmosisInversaForm({ ...osmosisInversaForm, k: e.target.value })}
                />
              </div>

              <div className="field-container">
                <label>H <span className="required-star">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej: 5.5"
                  value={osmosisInversaForm.h}
                  onChange={(e) => setOsmosisInversaForm({ ...osmosisInversaForm, h: e.target.value })}
                />
              </div>

              <div className="field-container">
                <label>Q Perm <span className="required-star">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej: 12.3"
                  value={osmosisInversaForm.q_perm}
                  onChange={(e) => setOsmosisInversaForm({ ...osmosisInversaForm, q_perm: e.target.value })}
                />
              </div>

              <div className="field-container">
                <label>Q Mezcla <span className="required-star">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej: 8.2"
                  value={osmosisInversaForm.q_mezcla}
                  onChange={(e) => setOsmosisInversaForm({ ...osmosisInversaForm, q_mezcla: e.target.value })}
                />
              </div>

              <div className="field-container">
                <label>Q Rechazo <span className="required-star">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej: 2.1"
                  value={osmosisInversaForm.q_rechazo}
                  onChange={(e) => setOsmosisInversaForm({ ...osmosisInversaForm, q_rechazo: e.target.value })}
                />
              </div>

              <div className="field-container">
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
              </div>

              <div className="field-container">
                <label>P ({osmosisInversaForm.p_select}) Valor <span className="required-star">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Valor de P"
                  value={osmosisInversaForm.p_valor}
                  onChange={(e) => setOsmosisInversaForm({ ...osmosisInversaForm, p_valor: e.target.value })}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setOsmosisInversaForm(initialOsmosisInversaState)}>
                <RotateCcw size={16} /> Limpiar
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Registrar Osmosis
              </button>
            </div>
          </form>
        )}

        {/* TAB 5: FILTRO DE ARENA */}
        {activeTab === 'filtroArena' && (
          <form onSubmit={handleFiltroArenaSubmit}>
            <div className="form-grid">
              <div className="field-container">
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
              </div>

              <div className="field-container">
                <label>Presión Interno <span className="required-star">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej: 3.2"
                  value={filtroArenaForm.presion_interno}
                  onChange={(e) => setFiltroArenaForm({ ...filtroArenaForm, presion_interno: e.target.value })}
                />
              </div>

              <div className="field-container">
                <label>Presión Externo <span className="required-star">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej: 4.5"
                  value={filtroArenaForm.presion_externo}
                  onChange={(e) => setFiltroArenaForm({ ...filtroArenaForm, presion_externo: e.target.value })}
                />
              </div>

              <div className="field-container">
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
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setFiltroArenaForm(initialFiltroArenaState)}>
                <RotateCcw size={16} /> Limpiar
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Registrar Filtro
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
