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
  Plus,
  Trash2,
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
    carac_organolep: 'OK',
    nivel_llenado: 'OK',
    contenido: '',
    presion: '',
    temperatura: '',
    vol_gas: '',
    brix: '',
    control_videojet: 'OK',
    responsable: '',
  });

  const handleBebidaSubmit = async (e) => {
    e.preventDefault();
    try {
      const nowTime = new Date().toTimeString().slice(0, 5);
      const payload = {
        ...bebidaForm,
        hora: bebidaForm.hora && bebidaForm.hora.trim() ? bebidaForm.hora.trim() : nowTime,
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
    tanque: '',
    bx_patron: '',
    ta: '',
    responsable: '',
  });

  const handleJarabeSubmit = async (e) => {
    e.preventDefault();
    try {
      const nowTime = new Date().toTimeString().slice(0, 5);
      const payload = {
        ...jarabeForm,
        hora: jarabeForm.hora && jarabeForm.hora.trim() ? jarabeForm.hora.trim() : nowTime,
        bx_patron: parseFloat(jarabeForm.bx_patron) || 0,
        ta: parseFloat(jarabeForm.ta) || 0,
        sabor: production.sabor || 'N/A',
        concentrado: production.tipoConcentrado || 'N/A',
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
      }));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

const SABOR_COLOR_MAP = {
  cola: 'Azul',
  pomelo: 'Amarillo',
  lima: 'Verde',
  naranja: 'Naranja',
  manzana: 'Azul',
  soda: 'Gris',
  sifon: 'Rojo',
};

function getColorBySabor(sabor) {
  if (!sabor) return '';
  const norm = sabor
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  for (const [key, color] of Object.entries(SABOR_COLOR_MAP)) {
    if (norm.includes(key)) {
      return color;
    }
  }
  return '';
}

  // ----------------------------------------------------
  // FORM 3: CONTROL DE TORQUE (LISTA DINÁMICA DE CABEZALES)
  // ----------------------------------------------------
  const maxCabezales = production.linea === 'linea1' ? 12 : 14;
  const [torqueForm, setTorqueForm] = useState({
    hora: '',
    marca_tapa: '',
    responsable: '',
    color: getColorBySabor(production.sabor),
    cabezales: [{ numero: 1, valor: '' }],
  });

  useEffect(() => {
    const autoColor = getColorBySabor(production.sabor);
    setTorqueForm((prev) => ({ ...prev, color: autoColor }));
  }, [production.sabor]);

  useEffect(() => {
    setTorqueForm((prev) => ({
      ...prev,
      cabezales: [{ numero: 1, valor: '' }],
    }));
  }, [production.turno]);

  const addCabezal = () => {
    setTorqueForm((prev) => {
      const lastNum = prev.cabezales[prev.cabezales.length - 1]?.numero || 0;
      const nextNum = lastNum >= maxCabezales ? 1 : lastNum + 1;
      return { ...prev, cabezales: [...prev.cabezales, { numero: nextNum, valor: '' }] };
    });
  };

  const removeCabezal = (idx) => {
    setTorqueForm((prev) => ({
      ...prev,
      cabezales: prev.cabezales.filter((_, i) => i !== idx),
    }));
  };

  const updateCabezal = (idx, field, val) => {
    setTorqueForm((prev) => {
      const updated = [...prev.cabezales];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, cabezales: updated };
    });
  };

  const handleTorqueSubmit = async (e) => {
    e.preventDefault();
    try {
      const nowTime = new Date().toTimeString().slice(0, 5);
      const hora = torqueForm.hora && torqueForm.hora.trim() ? torqueForm.hora.trim() : nowTime;
      // Submit one record per cabezal
      for (const cab of torqueForm.cabezales) {
        const payload = {
          hora,
          numero_cabezal: parseInt(cab.numero, 10),
          valor: parseFloat(cab.valor) || 0,
          color: torqueForm.color,
          marca_tapa: torqueForm.marca_tapa || null,
          responsable: torqueForm.responsable,
          sabor: production.sabor || 'N/A',
          linea: production.linea,
          turno: production.turno,
        };
        await submitControlTorque(payload);
      }
      showToast(
        torqueForm.cabezales.length === 1
          ? `Torque Cabezal ${torqueForm.cabezales[0].numero} registrado`
          : `${torqueForm.cabezales.length} cabezales registrados`,
        'success',
      );
      setTorqueForm((prev) => {
        const lastNum = prev.cabezales[prev.cabezales.length - 1]?.numero || 0;
        const nextNum = lastNum >= maxCabezales ? 1 : lastNum + 1;
        return {
          ...prev,
          hora: '',
          cabezales: [{ numero: nextNum, valor: '' }],
        };
      });
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
                <label>Hora</label>
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
                <label>Características Organolépticas <span className="required-star">*</span></label>
                <select
                  required
                  value={bebidaForm.carac_organolep}
                  onChange={(e) => setBebidaForm({ ...bebidaForm, carac_organolep: e.target.value })}
                >
                  <option value="OK">OK</option>
                  <option value="NOK">NOK</option>
                </select>
              </div>

              <div className="field-container">
                <label>Nivel de Llenado <span className="required-star">*</span></label>
                <select
                  required
                  value={bebidaForm.nivel_llenado}
                  onChange={(e) => setBebidaForm({ ...bebidaForm, nivel_llenado: e.target.value })}
                >
                  <option value="OK">OK</option>
                  <option value="NOK">NOK</option>
                </select>
              </div>

              <div className="field-container">
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
                <label>Temperat. (°C) <span className="required-star">*</span></label>
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
                <label>Vol. Gas (GV) <span className="required-star">*</span></label>
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
                <label>Control Video Jet <span className="required-star">*</span></label>
                <select
                  required
                  value={bebidaForm.control_videojet}
                  onChange={(e) => setBebidaForm({ ...bebidaForm, control_videojet: e.target.value })}
                >
                  <option value="OK">OK</option>
                  <option value="NOK">NOK</option>
                </select>
              </div>

              <div className="field-container col-span-2">
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
              </div>
            </div>

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
                  control_videojet: 'OK',
                  responsable: '',
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
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Registrar Control de Jarabe
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: CONTROL DE TORQUE — LISTA DINÁMICA DE CABEZALES */}
        {activeTab === 'torque' && (
          <form onSubmit={handleTorqueSubmit} style={{ marginTop: '1.25rem' }}>
            <div className="form-grid">
              <div className="field-container">
                <label>Hora</label>
                <div className="input-wrapper">
                  <Clock className="input-icon" size={18} />
                  <input
                    type="time"
                    value={torqueForm.hora}
                    onChange={(e) => setTorqueForm({ ...torqueForm, hora: e.target.value })}
                  />
                </div>
              </div>

              <div className="field-container">
                <label>Marca de Tapa</label>
                <select
                  value={torqueForm.marca_tapa}
                  onChange={(e) => setTorqueForm({ ...torqueForm, marca_tapa: e.target.value })}
                >
                  <option value="">Sin especificar</option>
                  <option value="PRIVA">PRIVA</option>
                  <option value="SIDES">SIDES</option>
                </select>
              </div>

              <div className="field-container">
                <label>Color de Tapa</label>
                <input
                  type="text"
                  placeholder="Automático según sabor"
                  value={torqueForm.color || '—'}
                  readOnly
                  style={{ opacity: 0.85, cursor: 'default' }}
                />
              </div>

              <div className="field-container col-span-2">
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
              </div>
            </div>

            {/* Dynamic cabezal list */}
            <div style={{ marginTop: '1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                Cabezales ({production.linea === 'linea2' ? '1 a 14' : '1 a 12'}) <span className="required-star">*</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {torqueForm.cabezales.map((cab, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <select
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
                        type="number"
                        step="0.1"
                        required
                        placeholder="Valor (Ej: 14.5)"
                        value={cab.valor}
                        onChange={(e) => updateCabezal(idx, 'valor', e.target.value)}
                      />
                    </div>
                    {torqueForm.cabezales.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCabezal(idx)}
                        style={{
                          background: 'rgba(244,63,94,0.12)',
                          border: '1px solid rgba(244,63,94,0.4)',
                          color: '#fb7185',
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
                  background: 'rgba(138,43,226,0.1)',
                  border: '1px dashed rgba(168,85,247,0.4)',
                  color: '#c084fc',
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
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setTorqueForm((prev) => ({ ...prev, hora: '', cabezales: [{ numero: 1, valor: '' }] }))}
              >
                <RotateCcw size={16} /> Reiniciar al Cabezal 1
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Registrar Torque
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
