import React, { useState, useEffect } from 'react';
import {
  Beer,
  Droplet,
  Gauge,
  PauseCircle,
  Save,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  X,
  User,
  FlaskRound as Flask,
} from 'lucide-react';
import { useProduction } from '../context/ProductionContext';
import { useToast } from '../context/ToastContext';
import SidebarInfo from '../components/SidebarInfo';
import {
  getResponsables,
  getSabores,
  getTiposConcentrado,
  getMarcas,
  getTanques,
  submitControlBebida,
  submitControlJarabe,
  submitControlTorque,
  submitControlPausa,
} from '../services/api';

export default function CalidadPage() {
  const { production, updateProduction } = useProduction();
  const { showToast } = useToast();

  const [showPausaModal, setShowPausaModal] = useState(false);

  const [activeTab, setActiveTab] = useState('bebida');
  const [responsables, setResponsables] = useState([]);
  const [sabores, setSabores] = useState([]);
  const [concentrados, setConcentrados] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [tanquesCatalog, setTanquesCatalog] = useState([]);

  // Load catalogs on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [r, s, c, m, t] = await Promise.all([
          getResponsables(),
          getSabores(),
          getTiposConcentrado(),
          getMarcas(),
          getTanques(),
        ]);
        setResponsables(r);
        setSabores(s);
        setConcentrados(c);
        setMarcas(m);
        setTanquesCatalog(t);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  // ----------------------------------------------------
  // FORM 1: BEBIDA TERMINADA
  // ----------------------------------------------------
  const [bebidaForm, setBebidaForm] = useState({
    hora: '',
    carac_organolep: 'okey',
    nivel_llenado: 'Normal',
    contenido: '',
    presion: '',
    temperatura: '',
    vol_gas: '',
    brix: '',
    control_videojet: 'okey',
    responsable: '',
    tanque: '',
  });

  const handleBebidaSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...bebidaForm,
        contenido: parseFloat(bebidaForm.contenido) || 0,
        presion: parseFloat(bebidaForm.presion) || 0,
        temperatura: parseFloat(bebidaForm.temperatura) || 0,
        vol_gas: parseFloat(bebidaForm.vol_gas) || 0,
        brix: parseFloat(bebidaForm.brix) || 0,
        marca: production.sabor || 'N/A',
        tipo_concentrado: production.tipoConcentrado || 'N/A',
        tamano: production.tamano || 'N/A',
        lote_tapa: production.loteTapa || 'N/A',
        linea: production.linea,
        turno: production.turno,
      };
      await submitControlBebida(payload);
      showToast('Control de Bebida registrado con éxito', 'success');
      setBebidaForm((prev) => ({
        ...prev,
        hora: '',
        contenido: '',
        presion: '',
        temperatura: '',
        vol_gas: '',
        brix: '',
      }));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ----------------------------------------------------
  // FORM 2: CONTROL DE JARABE
  // ----------------------------------------------------
  const [jarabeForm, setJarabeForm] = useState({
    hora: '',
    sabor: '',
    concentrado: '',
    tanque: '',
    bx_patron: '',
    ta: '',
    responsable: '',
    observacion: '',
    numero_carga_trilay: '',
  });

  const handleJarabeSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...jarabeForm,
        bx_patron: parseFloat(jarabeForm.bx_patron) || 0,
        ta: parseFloat(jarabeForm.ta) || 0,
        linea: production.linea,
        turno: production.turno,
      };
      await submitControlJarabe(payload);
      showToast('Control de Jarabe registrado con éxito', 'success');
      setJarabeForm((prev) => ({
        ...prev,
        hora: '',
        bx_patron: '',
        ta: '',
        observacion: '',
      }));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ----------------------------------------------------
  // FORM 3: CONTROL DE TORQUE (CON AVANCE AUTOMÁTICO!)
  // ----------------------------------------------------
  const maxCabezales = production.linea === 'linea1' ? 12 : 14;
  const [torqueForm, setTorqueForm] = useState({
    numero_cabezal: 1,
    sabor: '',
    color: '',
    valor: '',
    responsable: '',
  });

  // Sync flavor from production when assigned
  useEffect(() => {
    if (production.sabor) {
      setTorqueForm((prev) => ({ ...prev, sabor: production.sabor }));
    }
  }, [production.sabor]);

  const handleTorqueSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...torqueForm,
        numero_cabezal: parseInt(torqueForm.numero_cabezal, 10),
        valor: parseFloat(torqueForm.valor) || 0,
        linea: production.linea,
        turno: production.turno,
        noche: production.nocheSubturno,
      };
      await submitControlTorque(payload);
      showToast(`Torque Cabezal ${torqueForm.numero_cabezal} registrado`, 'success');

      // Auto-advance to next head (1 -> 2 -> ... -> max -> 1)
      setTorqueForm((prev) => ({
        ...prev,
        valor: '',
        numero_cabezal: prev.numero_cabezal >= maxCabezales ? 1 : prev.numero_cabezal + 1,
      }));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ----------------------------------------------------
  // FORM 4: CONTROL DE PAUSAS
  // ----------------------------------------------------
  const [pausaForm, setPausaForm] = useState({
    motivo: '',
    responsable: '',
    observacion: '',
  });

  const handlePausaSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...pausaForm,
        linea: production.linea,
        turno: production.turno,
      };
      await submitControlPausa(payload);
      showToast('Pausa registrada con éxito', 'success');
      setPausaForm({ motivo: '', responsable: '', observacion: '' });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="content-grid">
      <main className="card">
        {/* Header: Tabs + Línea buttons + Pausa */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <div className="tabs-container" style={{ marginBottom: 0 }}>
            <button
              type="button"
              className={`tab-button ${activeTab === 'bebida' ? 'active' : ''}`}
              onClick={() => setActiveTab('bebida')}
            >
              <Beer size={18} />
              Bebida Terminada
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === 'jarabe' ? 'active' : ''}`}
              onClick={() => setActiveTab('jarabe')}
            >
              <Droplet size={18} />
              Control de Jarabe
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === 'torque' ? 'active' : ''}`}
              onClick={() => setActiveTab('torque')}
            >
              <Gauge size={18} />
              Control de Torque
            </button>
          </div>

          {/* Quick-line + Pausa */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              className={`btn ${production.linea === 'linea1' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}
              onClick={() => updateProduction({ linea: 'linea1' })}
            >
              Línea 1
            </button>
            <button
              type="button"
              className={`btn ${production.linea === 'linea2' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}
              onClick={() => updateProduction({ linea: 'linea2' })}
            >
              Línea 2
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem', color: '#f97316', borderColor: '#f97316' }}
              onClick={() => setShowPausaModal(true)}
            >
              <PauseCircle size={15} style={{ marginRight: '0.3rem' }} />
              Registrar Pausa
            </button>
          </div>
        </div>

        {/* TAB 1: BEBIDA TERMINADA */}
        {activeTab === 'bebida' && (
          <form onSubmit={handleBebidaSubmit} style={{ marginTop: '1.25rem' }}>
            <div className="form-grid">
              <div className="field-container">
                <label>Hora de Control</label>
                <div className="input-wrapper">
                  <Clock className="input-icon" size={18} />
                  <input
                    type="time"
                    value={bebidaForm.hora}
                    onChange={(e) => setBebidaForm({ ...bebidaForm, hora: e.target.value })}
                  />
                </div>
              </div>

              <div className="field-container">
                <label>Contenido Neto (ml / L) <span className="required-star">*</span></label>
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
              </div>

              <div className="field-container">
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
              </div>

              <div className="field-container">
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
              </div>

              <div className="field-container">
                <label>Temperatura (°C) <span className="required-star">*</span></label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="Ej: 4.5"
                  value={bebidaForm.temperatura}
                  onChange={(e) => setBebidaForm({ ...bebidaForm, temperatura: e.target.value })}
                />
              </div>

              <div className="field-container">
                <label>Volumen de Gas (GV) <span className="required-star">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej: 3.8"
                  value={bebidaForm.vol_gas}
                  onChange={(e) => setBebidaForm({ ...bebidaForm, vol_gas: e.target.value })}
                />
              </div>

              <div className="field-container">
                <label>Nivel de Llenado</label>
                <select
                  value={bebidaForm.nivel_llenado}
                  onChange={(e) => setBebidaForm({ ...bebidaForm, nivel_llenado: e.target.value })}
                >
                  <option value="Normal">Normal</option>
                  <option value="Alto">Alto</option>
                  <option value="Bajo">Bajo</option>
                </select>
              </div>

              <div className="field-container">
                <label>Tanque de Jarabe (Opcional)</label>
                <select
                  value={bebidaForm.tanque}
                  onChange={(e) => setBebidaForm({ ...bebidaForm, tanque: e.target.value })}
                >
                  <option value="">Seleccione tanque (Opcional)...</option>
                  {tanquesCatalog.map((t) => (
                    <option key={t.id} value={t.numero}>{t.numero === 'N/A' ? 'N/A' : `Tanque ${t.numero}`}</option>
                  ))}
                </select>
              </div>

              <div className="field-container">
                <label>Características Organolépticas</label>
                <div className="radio-group-cards">
                  <div
                    className={`radio-card ${bebidaForm.carac_organolep === 'okey' ? 'selected-ok' : ''}`}
                    onClick={() => setBebidaForm({ ...bebidaForm, carac_organolep: 'okey' })}
                  >
                    <CheckCircle2 size={18} /> Okey
                  </div>
                  <div
                    className={`radio-card ${bebidaForm.carac_organolep === 'no okey' ? 'selected-nok' : ''}`}
                    onClick={() => setBebidaForm({ ...bebidaForm, carac_organolep: 'no okey' })}
                  >
                    <XCircle size={18} /> No Okey
                  </div>
                </div>
              </div>

              <div className="field-container">
                <label>Control VideoJet</label>
                <div className="radio-group-cards">
                  <div
                    className={`radio-card ${bebidaForm.control_videojet === 'okey' ? 'selected-ok' : ''}`}
                    onClick={() => setBebidaForm({ ...bebidaForm, control_videojet: 'okey' })}
                  >
                    <CheckCircle2 size={18} /> Okey
                  </div>
                  <div
                    className={`radio-card ${bebidaForm.control_videojet === 'no okey' ? 'selected-nok' : ''}`}
                    onClick={() => setBebidaForm({ ...bebidaForm, control_videojet: 'no okey' })}
                  >
                    <XCircle size={18} /> No Okey
                  </div>
                </div>
              </div>

              <div className="field-container col-span-2">
                <label>Responsable de Calidad <span className="required-star">*</span></label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <select
                    required
                    value={bebidaForm.responsable}
                    onChange={(e) => setBebidaForm({ ...bebidaForm, responsable: e.target.value })}
                  >
                    <option value="" disabled>Seleccione analista...</option>
                    {responsables.map((r) => (
                      <option key={r.id} value={r.nombre_completo}>{r.nombre_completo}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setBebidaForm({
                  hora: '',
                  carac_organolep: 'okey',
                  nivel_llenado: 'Normal',
                  contenido: '',
                  presion: '',
                  temperatura: '',
                  vol_gas: '',
                  brix: '',
                  control_videojet: 'okey',
                  responsable: '',
                  tanque: '',
                })}
              >
                <RotateCcw size={16} /> Limpiar
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Registrar Control de Bebida
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: CONTROL DE JARABE */}
        {activeTab === 'jarabe' && (
          <form onSubmit={handleJarabeSubmit} style={{ marginTop: '1.25rem' }}>
            <div className="form-grid">
              <div className="field-container">
                <label>Hora de Control</label>
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
                <label>Sabor / Marca <span className="required-star">*</span></label>
                <select
                  required
                  value={jarabeForm.sabor}
                  onChange={(e) => setJarabeForm({ ...jarabeForm, sabor: e.target.value })}
                >
                  <option value="" disabled>Seleccione sabor...</option>
                  {sabores.map((s) => (
                    <option key={s.id} value={s.nombre}>{s.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="field-container">
                <label>Tipo de Concentrado <span className="required-star">*</span></label>
                <select
                  required
                  value={jarabeForm.concentrado}
                  onChange={(e) => setJarabeForm({ ...jarabeForm, concentrado: e.target.value })}
                >
                  <option value="" disabled>Seleccione...</option>
                  {concentrados.map((c) => (
                    <option key={c.id} value={c.codigo}>{c.codigo}</option>
                  ))}
                </select>
              </div>

              <div className="field-container">
                <label>Tanque de Jarabe <span className="required-star">*</span></label>
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
                <label>°Brix Patrón <span className="required-star">*</span></label>
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

              <div className="field-container">
                <label>N° Carga Trilay (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: TR-8942"
                  value={jarabeForm.numero_carga_trilay}
                  onChange={(e) => setJarabeForm({ ...jarabeForm, numero_carga_trilay: e.target.value })}
                />
              </div>

              <div className="field-container">
                <label>Responsable <span className="required-star">*</span></label>
                <select
                  required
                  value={jarabeForm.responsable}
                  onChange={(e) => setJarabeForm({ ...jarabeForm, responsable: e.target.value })}
                >
                  <option value="" disabled>Seleccione analista...</option>
                  {responsables.map((r) => (
                    <option key={r.id} value={r.nombre_completo}>{r.nombre_completo}</option>
                  ))}
                </select>
              </div>

              <div className="field-container col-span-2">
                <label>Observaciones</label>
                <textarea
                  rows="2"
                  placeholder="Comentarios adicionales sobre el jarabe..."
                  value={jarabeForm.observacion}
                  onChange={(e) => setJarabeForm({ ...jarabeForm, observacion: e.target.value })}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setJarabeForm({
                  hora: '',
                  sabor: '',
                  concentrado: '',
                  tanque: '',
                  bx_patron: '',
                  ta: '',
                  responsable: '',
                  observacion: '',
                  numero_carga_trilay: '',
                })}
              >
                <RotateCcw size={16} /> Limpiar
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Registrar Control de Jarabe
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: CONTROL DE TORQUE CON AUTO-AVANCE DE CABEZAL */}
        {activeTab === 'torque' && (
          <form onSubmit={handleTorqueSubmit} style={{ marginTop: '1.25rem' }}>
            <div className="form-grid">
              <div className="field-container">
                <label>N° Cabezal ({production.linea === 'linea2' ? '1 a 14' : '1 a 12'}) <span className="required-star">*</span></label>
                <select
                  value={torqueForm.numero_cabezal}
                  onChange={(e) => setTorqueForm({ ...torqueForm, numero_cabezal: parseInt(e.target.value, 10) })}
                >
                  {Array.from({ length: maxCabezales }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>Cabezal {num}</option>
                  ))}
                </select>
              </div>

              <div className="field-container">
                <label>Valor de Torque (lbf·in) <span className="required-star">*</span></label>
                <div className="input-wrapper">
                  <Gauge className="input-icon" size={18} />
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="Ej: 14.5"
                    value={torqueForm.valor}
                    onChange={(e) => setTorqueForm({ ...torqueForm, valor: e.target.value })}
                  />
                </div>
              </div>

              <div className="field-container">
                <label>Sabor / Marca <span className="required-star">*</span></label>
                <select
                  required
                  value={torqueForm.sabor}
                  onChange={(e) => setTorqueForm({ ...torqueForm, sabor: e.target.value })}
                >
                  <option value="" disabled>Seleccione sabor...</option>
                  {marcas.map((m) => (
                    <option key={m.id} value={m.nombre}>{m.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="field-container">
                <label>Color de Tapa</label>
                <input
                  type="text"
                  placeholder="Ej: Azul, Rojo, Blanco"
                  value={torqueForm.color}
                  onChange={(e) => setTorqueForm({ ...torqueForm, color: e.target.value })}
                />
              </div>

              <div className="field-container col-span-2">
                <label>Responsable <span className="required-star">*</span></label>
                <select
                  required
                  value={torqueForm.responsable}
                  onChange={(e) => setTorqueForm({ ...torqueForm, responsable: e.target.value })}
                >
                  <option value="" disabled>Seleccione analista...</option>
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
                onClick={() => setTorqueForm((prev) => ({ ...prev, valor: '', numero_cabezal: 1 }))}
              >
                <RotateCcw size={16} /> Reiniciar al Cabezal 1
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Registrar Torque (Avanza Cabezal)
              </button>
            </div>
          </form>
        )}

      </main>

      <SidebarInfo showLoteTapa={activeTab === 'bebida'} />

      {/* Modal de Pausa */}
      {showPausaModal && (
        <div className="modal-backdrop" onClick={() => setShowPausaModal(false)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '480px', width: '95%' }}
          >
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PauseCircle size={20} color="#f97316" /> Registrar Pausa de Línea
              </h3>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setShowPausaModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={async (e) => { await handlePausaSubmit(e); setShowPausaModal(false); }} style={{ marginTop: '1rem' }}>
              <div className="form-grid">
                <div className="field-container col-span-2">
                  <label>Motivo de la Pausa <span className="required-star">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Cambio de formato, Mantenimiento preventivo"
                    value={pausaForm.motivo}
                    onChange={(e) => setPausaForm({ ...pausaForm, motivo: e.target.value })}
                  />
                </div>
                <div className="field-container col-span-2">
                  <label>Responsable <span className="required-star">*</span></label>
                  <select
                    required
                    value={pausaForm.responsable}
                    onChange={(e) => setPausaForm({ ...pausaForm, responsable: e.target.value })}
                  >
                    <option value="" disabled>Seleccione responsable...</option>
                    {responsables.map((r) => (
                      <option key={r.id} value={r.nombre_completo}>{r.nombre_completo}</option>
                    ))}
                  </select>
                </div>
                <div className="field-container col-span-2">
                  <label>Observaciones</label>
                  <textarea
                    rows="3"
                    placeholder="Detalles sobre la parada de línea..."
                    value={pausaForm.observacion}
                    onChange={(e) => setPausaForm({ ...pausaForm, observacion: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-actions" style={{ marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPausaForm({ motivo: '', responsable: '', observacion: '' })}
                >
                  <RotateCcw size={16} /> Limpiar
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> Registrar Pausa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
