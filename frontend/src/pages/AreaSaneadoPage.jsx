import React, { useState, useEffect } from 'react';
import { Waves, Save, RotateCcw, User } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { getResponsables, submitSalaSaneado } from '../services/api';

export default function AreaSaneadoPage() {
  const { showToast } = useToast();
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

  const initialFormState = {
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
    cip_opciones: [],
  };

  const [form, setForm] = useState(initialFormState);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { cip_opciones, ...rest } = form;
      const payload = {
        ...rest,
        cop_hora_inicio: form.cop_hora_inicio || null,
        cop_hora_fin: form.cop_hora_fin || null,
        cip_sanitizante_temp: form.cip_sanitizante_temp ? parseFloat(form.cip_sanitizante_temp) : null,
        cip_sanitizante_inicio: form.cip_sanitizante_inicio || null,
        cip_sanitizante_fin: form.cip_sanitizante_fin || null,
        cip_desinfectante_temp: form.cip_desinfectante_temp ? parseFloat(form.cip_desinfectante_temp) : null,
        cip_desinfectante_inicio: form.cip_desinfectante_inicio || null,
        cip_desinfectante_fin: form.cip_desinfectante_fin || null,
        cip_enjuague_sanitizante_inicio: form.cip_enjuague_sanitizante_inicio || null,
        cip_enjuague_sanitizante_fin: form.cip_enjuague_sanitizante_fin || null,
        cip_enjuague_desinfectante_inicio: form.cip_enjuague_desinfectante_inicio || null,
        cip_enjuague_desinfectante_fin: form.cip_enjuague_desinfectante_fin || null,
      };
      await submitSalaSaneado(payload);
      showToast('Control de Área de Saneado guardado con éxito', 'success');
      setForm(initialFormState);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="content-grid" style={{ gridTemplateColumns: '1fr' }}>
      <main className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            borderBottom: '1px solid var(--border-glass)',
            paddingBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                background: 'rgba(56, 189, 248, 0.1)',
                padding: '0.6rem',
                borderRadius: '10px',
                color: 'var(--accent-primary, #38bdf8)',
              }}
            >
              <Waves size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Área de Saneado
              </h2>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Control y registro de limpieza y desinfección de líneas (COP / CIP)
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field-container">
              <label>
                Línea <span className="required-star">*</span>
              </label>
              <select
                required
                value={form.linea}
                onChange={(e) => setForm({ ...form, linea: e.target.value })}
              >
                <option value="" disabled>
                  Seleccione línea...
                </option>
                <option value="1">Línea 1</option>
                <option value="2">Línea 2</option>
              </select>
            </div>

            <div className="field-container">
              <label>
                ¿Es Post Mantenimiento? <span className="required-star">*</span>
              </label>
              <select
                required
                value={form.post_mantenimiento ? 'Si' : 'No'}
                onChange={(e) =>
                  setForm({ ...form, post_mantenimiento: e.target.value === 'Si' })
                }
              >
                <option value="No">No</option>
                <option value="Si">Si</option>
              </select>
            </div>

            <div className="field-container col-span-2">
              <label>
                COP o CIP <span className="required-star">*</span>
              </label>
              <select
                required
                value={form.tipo_limpieza}
                onChange={(e) => setForm({ ...form, tipo_limpieza: e.target.value })}
              >
                <option value="COP">COP</option>
                <option value="CIP">CIP</option>
              </select>
            </div>

            {form.tipo_limpieza === 'COP' && (
              <>
                <div className="field-container col-span-2">
                  <label>Químico</label>
                  <input
                    type="text"
                    placeholder="Nombre o descripción del químico"
                    value={form.cop_quimico}
                    onChange={(e) => setForm({ ...form, cop_quimico: e.target.value })}
                  />
                </div>
                <div className="field-container">
                  <label>Hora Inicio</label>
                  <input
                    type="time"
                    value={form.cop_hora_inicio}
                    onChange={(e) => setForm({ ...form, cop_hora_inicio: e.target.value })}
                  />
                </div>
                <div className="field-container">
                  <label>Hora Fin</label>
                  <input
                    type="time"
                    value={form.cop_hora_fin}
                    onChange={(e) => setForm({ ...form, cop_hora_fin: e.target.value })}
                  />
                </div>
              </>
            )}

            {form.tipo_limpieza === 'CIP' && (
              <div
                className="col-span-2"
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}
              >
                <div className="field-container">
                  <label>Etapas CIP a registrar</label>
                  <div
                    style={{
                      display: 'flex',
                      gap: '1.5rem',
                      flexWrap: 'wrap',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-glass)',
                      padding: '1rem',
                    }}
                  >
                    {[
                      'Sanitizante',
                      'Desinfectante',
                      'Enjuague Sanitizante',
                      'Enjuague Desinfectante',
                    ].map((opt) => (
                      <label
                        key={opt}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={form.cip_opciones?.includes(opt) || false}
                          onChange={(e) => {
                            const currentOpts = form.cip_opciones || [];
                            const newOpts = e.target.checked
                              ? [...currentOpts, opt]
                              : currentOpts.filter((o) => o !== opt);
                            setForm({ ...form, cip_opciones: newOpts });
                          }}
                          style={{ cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                {(form.cip_opciones || []).includes('Sanitizante') && (
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-glass)',
                    }}
                  >
                    <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Sanitizante</h4>
                    <div className="form-grid">
                      <div className="field-container">
                        <label>Temperatura (°C)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Ej: 85.0"
                          value={form.cip_sanitizante_temp}
                          onChange={(e) =>
                            setForm({ ...form, cip_sanitizante_temp: e.target.value })
                          }
                        />
                      </div>
                      <div className="field-container">
                        <label>Hora Inicio</label>
                        <input
                          type="time"
                          value={form.cip_sanitizante_inicio}
                          onChange={(e) =>
                            setForm({ ...form, cip_sanitizante_inicio: e.target.value })
                          }
                        />
                      </div>
                      <div className="field-container">
                        <label>Hora Fin</label>
                        <input
                          type="time"
                          value={form.cip_sanitizante_fin}
                          onChange={(e) =>
                            setForm({ ...form, cip_sanitizante_fin: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(form.cip_opciones || []).includes('Desinfectante') && (
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-glass)',
                    }}
                  >
                    <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Desinfectante</h4>
                    <div className="form-grid">
                      <div className="field-container">
                        <label>Temperatura (°C)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Ej: 20.5"
                          value={form.cip_desinfectante_temp}
                          onChange={(e) =>
                            setForm({ ...form, cip_desinfectante_temp: e.target.value })
                          }
                        />
                      </div>
                      <div className="field-container">
                        <label>Hora Inicio</label>
                        <input
                          type="time"
                          value={form.cip_desinfectante_inicio}
                          onChange={(e) =>
                            setForm({ ...form, cip_desinfectante_inicio: e.target.value })
                          }
                        />
                      </div>
                      <div className="field-container">
                        <label>Hora Fin</label>
                        <input
                          type="time"
                          value={form.cip_desinfectante_fin}
                          onChange={(e) =>
                            setForm({ ...form, cip_desinfectante_fin: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(form.cip_opciones || []).includes('Enjuague Sanitizante') && (
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-glass)',
                    }}
                  >
                    <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
                      Enjuague Sanitizante
                    </h4>
                    <div className="form-grid">
                      <div className="field-container">
                        <label>Hora Inicio</label>
                        <input
                          type="time"
                          value={form.cip_enjuague_sanitizante_inicio}
                          onChange={(e) =>
                            setForm({ ...form, cip_enjuague_sanitizante_inicio: e.target.value })
                          }
                        />
                      </div>
                      <div className="field-container">
                        <label>Hora Fin</label>
                        <input
                          type="time"
                          value={form.cip_enjuague_sanitizante_fin}
                          onChange={(e) =>
                            setForm({ ...form, cip_enjuague_sanitizante_fin: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(form.cip_opciones || []).includes('Enjuague Desinfectante') && (
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-glass)',
                    }}
                  >
                    <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
                      Enjuague Desinfectante
                    </h4>
                    <div className="form-grid">
                      <div className="field-container">
                        <label>Hora Inicio</label>
                        <input
                          type="time"
                          value={form.cip_enjuague_desinfectante_inicio}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              cip_enjuague_desinfectante_inicio: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="field-container">
                        <label>Hora Fin</label>
                        <input
                          type="time"
                          value={form.cip_enjuague_desinfectante_fin}
                          onChange={(e) =>
                            setForm({ ...form, cip_enjuague_desinfectante_fin: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="field-container col-span-2">
              <label>
                Responsable <span className="required-star">*</span>
              </label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <select
                  required
                  value={form.responsable}
                  onChange={(e) => setForm({ ...form, responsable: e.target.value })}
                >
                  <option value="" disabled>
                    Seleccione responsable...
                  </option>
                  {responsables.map((r) => (
                    <option key={r.id} value={r.nombre_completo}>
                      {r.nombre_completo}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setForm(initialFormState)}
            >
              <RotateCcw size={16} /> Limpiar
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Registrar Saneado
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
