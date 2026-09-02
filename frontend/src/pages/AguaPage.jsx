import React, { useState, useEffect } from 'react';
import { Droplet, Waves, Save, RotateCcw, Clock, Calendar, Beaker, User } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { getResponsables, submitControlFisicoQuimico, submitSalaSaneado } from '../services/api';

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
  // TAB 2: SALA DE SANEADO
  // ----------------------------------------------------
  const initialSalaSaneadoState = {
    linea: '',
    post_mantenimiento: false,
    tipo_limpieza: 'COP',
    responsable: '',
    cop_quimico: '',
    cop_hora_inicio: '',
    cop_hora_fin: '',
    cip_sanitizante_temp: '',
    cip_sanitizante_inicio: '',
    cip_sanitizante_fin: '',
    cip_desinfectante_temp: '',
    cip_desinfectante_inicio: '',
    cip_desinfectante_fin: '',
    cip_enjuague_sanitizante_inicio: '',
    cip_enjuague_sanitizante_fin: '',
    cip_enjuague_desinfectante_inicio: '',
    cip_enjuague_desinfectante_fin: '',
  };
  const [salaSaneadoForm, setSalaSaneadoForm] = useState(initialSalaSaneadoState);

  const handleSalaSaneadoSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...salaSaneadoForm,
        cop_hora_inicio: salaSaneadoForm.cop_hora_inicio || null,
        cop_hora_fin: salaSaneadoForm.cop_hora_fin || null,
        cip_sanitizante_temp: salaSaneadoForm.cip_sanitizante_temp ? parseFloat(salaSaneadoForm.cip_sanitizante_temp) : null,
        cip_sanitizante_inicio: salaSaneadoForm.cip_sanitizante_inicio || null,
        cip_sanitizante_fin: salaSaneadoForm.cip_sanitizante_fin || null,
        cip_desinfectante_temp: salaSaneadoForm.cip_desinfectante_temp ? parseFloat(salaSaneadoForm.cip_desinfectante_temp) : null,
        cip_desinfectante_inicio: salaSaneadoForm.cip_desinfectante_inicio || null,
        cip_desinfectante_fin: salaSaneadoForm.cip_desinfectante_fin || null,
        cip_enjuague_sanitizante_inicio: salaSaneadoForm.cip_enjuague_sanitizante_inicio || null,
        cip_enjuague_sanitizante_fin: salaSaneadoForm.cip_enjuague_sanitizante_fin || null,
        cip_enjuague_desinfectante_inicio: salaSaneadoForm.cip_enjuague_desinfectante_inicio || null,
        cip_enjuague_desinfectante_fin: salaSaneadoForm.cip_enjuague_desinfectante_fin || null,
      };
      await submitSalaSaneado(payload);
      showToast('Control Sala de Saneado guardado con éxito', 'success');
      setSalaSaneadoForm(initialSalaSaneadoState);
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
              className={`tab-button ${activeTab === 'salaSaneado' ? 'active' : ''}`}
              onClick={() => setActiveTab('salaSaneado')}
            >
              <Waves size={18} />
              Sala de Saneado
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

        {/* TAB 2: SALA DE SANEADO */}
        {activeTab === 'salaSaneado' && (
          <form onSubmit={handleSalaSaneadoSubmit}>
            <div className="form-grid">
              <div className="field-container">
                <label>Línea <span className="required-star">*</span></label>
                <select
                  required
                  value={salaSaneadoForm.linea}
                  onChange={(e) => setSalaSaneadoForm({ ...salaSaneadoForm, linea: e.target.value })}
                >
                  <option value="" disabled>Seleccione línea...</option>
                  <option value="1">Línea 1</option>
                  <option value="2">Línea 2</option>
                </select>
              </div>

              <div className="field-container">
                <label>¿Es Post Mantenimiento? <span className="required-star">*</span></label>
                <select
                  required
                  value={salaSaneadoForm.post_mantenimiento ? 'Si' : 'No'}
                  onChange={(e) => setSalaSaneadoForm({ ...salaSaneadoForm, post_mantenimiento: e.target.value === 'Si' })}
                >
                  <option value="No">No</option>
                  <option value="Si">Si</option>
                </select>
              </div>

              <div className="field-container col-span-2">
                <label>COP o CIP <span className="required-star">*</span></label>
                <select
                  required
                  value={salaSaneadoForm.tipo_limpieza}
                  onChange={(e) => setSalaSaneadoForm({ ...salaSaneadoForm, tipo_limpieza: e.target.value })}
                >
                  <option value="COP">COP</option>
                  <option value="CIP">CIP</option>
                </select>
              </div>

              {salaSaneadoForm.tipo_limpieza === 'COP' && (
                <>
                  <div className="field-container col-span-2">
                    <label>Químico</label>
                    <input
                      type="text"
                      value={salaSaneadoForm.cop_quimico}
                      onChange={(e) => setSalaSaneadoForm({ ...salaSaneadoForm, cop_quimico: e.target.value })}
                    />
                  </div>
                  <div className="field-container">
                    <label>Hora Inicio</label>
                    <input
                      type="time"
                      value={salaSaneadoForm.cop_hora_inicio}
                      onChange={(e) => setSalaSaneadoForm({ ...salaSaneadoForm, cop_hora_inicio: e.target.value })}
                    />
                  </div>
                  <div className="field-container">
                    <label>Hora Fin</label>
                    <input
                      type="time"
                      value={salaSaneadoForm.cop_hora_fin}
                      onChange={(e) => setSalaSaneadoForm({ ...salaSaneadoForm, cop_hora_fin: e.target.value })}
                    />
                  </div>
                </>
              )}

              {salaSaneadoForm.tipo_limpieza === 'CIP' && (
                <div className="col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                    <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Sanitizante</h4>
                    <div className="form-grid">
                      <div className="field-container">
                        <label>Temperatura</label>
                        <input type="number" step="0.1" value={salaSaneadoForm.cip_sanitizante_temp} onChange={(e) => setSalaSaneadoForm({ ...salaSaneadoForm, cip_sanitizante_temp: e.target.value })} />
                      </div>
                      <div className="field-container">
                        <label>Hora Inicio</label>
                        <input type="time" value={salaSaneadoForm.cip_sanitizante_inicio} onChange={(e) => setSalaSaneadoForm({ ...salaSaneadoForm, cip_sanitizante_inicio: e.target.value })} />
                      </div>
                      <div className="field-container">
                        <label>Hora Fin</label>
                        <input type="time" value={salaSaneadoForm.cip_sanitizante_fin} onChange={(e) => setSalaSaneadoForm({ ...salaSaneadoForm, cip_sanitizante_fin: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                    <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Desinfectante</h4>
                    <div className="form-grid">
                      <div className="field-container">
                        <label>Temperatura</label>
                        <input type="number" step="0.1" value={salaSaneadoForm.cip_desinfectante_temp} onChange={(e) => setSalaSaneadoForm({ ...salaSaneadoForm, cip_desinfectante_temp: e.target.value })} />
                      </div>
                      <div className="field-container">
                        <label>Hora Inicio</label>
                        <input type="time" value={salaSaneadoForm.cip_desinfectante_inicio} onChange={(e) => setSalaSaneadoForm({ ...salaSaneadoForm, cip_desinfectante_inicio: e.target.value })} />
                      </div>
                      <div className="field-container">
                        <label>Hora Fin</label>
                        <input type="time" value={salaSaneadoForm.cip_desinfectante_fin} onChange={(e) => setSalaSaneadoForm({ ...salaSaneadoForm, cip_desinfectante_fin: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                    <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Enjuague Sanitizante</h4>
                    <div className="form-grid">
                      <div className="field-container">
                        <label>Hora Inicio</label>
                        <input type="time" value={salaSaneadoForm.cip_enjuague_sanitizante_inicio} onChange={(e) => setSalaSaneadoForm({ ...salaSaneadoForm, cip_enjuague_sanitizante_inicio: e.target.value })} />
                      </div>
                      <div className="field-container">
                        <label>Hora Fin</label>
                        <input type="time" value={salaSaneadoForm.cip_enjuague_sanitizante_fin} onChange={(e) => setSalaSaneadoForm({ ...salaSaneadoForm, cip_enjuague_sanitizante_fin: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                    <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Enjuague Desinfectante</h4>
                    <div className="form-grid">
                      <div className="field-container">
                        <label>Hora Inicio</label>
                        <input type="time" value={salaSaneadoForm.cip_enjuague_desinfectante_inicio} onChange={(e) => setSalaSaneadoForm({ ...salaSaneadoForm, cip_enjuague_desinfectante_inicio: e.target.value })} />
                      </div>
                      <div className="field-container">
                        <label>Hora Fin</label>
                        <input type="time" value={salaSaneadoForm.cip_enjuague_desinfectante_fin} onChange={(e) => setSalaSaneadoForm({ ...salaSaneadoForm, cip_enjuague_desinfectante_fin: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="field-container col-span-2">
                <label>Responsable <span className="required-star">*</span></label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <select
                    required
                    value={salaSaneadoForm.responsable}
                    onChange={(e) => setSalaSaneadoForm({ ...salaSaneadoForm, responsable: e.target.value })}
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
              <button type="button" className="btn btn-secondary" onClick={() => setSalaSaneadoForm(initialSalaSaneadoState)}>
                <RotateCcw size={16} /> Limpiar
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Registrar Saneado
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
