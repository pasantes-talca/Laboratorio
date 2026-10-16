import FormLayout, { FormField } from '../../../componentes/FormLayout';
import BebidaForm from '../componentes/BebidaForm';
import ControlJarabeForm from '../componentes/ControlJarabeForm';
import TorqueForm from '../componentes/TorqueForm';
import React, { useState, useEffect } from 'react';
import { PauseCircle, Save, RotateCcw, X } from 'lucide-react';
import { useProduction } from '../../../context/ProductionContext';
import { useToast } from '../../../context/ToastContext';
import SidebarInfo from '../../../componentes/SidebarInfo';
import { getResponsables, getTanques } from '../../../services/api';
import { submitControlBebida, submitControlJarabe, submitControlTorque, submitControlPausa } from '../api/calidadApi';

const loteStorageKey = (linea) => `calidad_lote_tapa_${linea}`;

function readLoteTapa(linea) {
  try {
    return localStorage.getItem(loteStorageKey(linea)) || '';
  } catch {
    return '';
  }
}

function rememberLoteTapa(linea, value) {
  try {
    localStorage.setItem(loteStorageKey(linea), value);
  } catch {}
}

export default function CalidadPage({ initialTab = 'bebida' }) {
  const { production, productionReady, productionLoading, productionError, refreshProduction } = useProduction();
  const { showToast } = useToast();

  const handleProductionConflict = (err) => {
    if (err.status === 409) refreshProduction().catch(() => {});
    showToast(err.message, 'error');
  };

  const [showPausaModal, setShowPausaModal] = useState(false);

  const [activeTab, setActiveTab] = useState(initialTab);
  useEffect(() => setActiveTab(initialTab), [initialTab]);
  const [responsables, setResponsables] = useState([]);
  const [tanquesCatalog, setTanquesCatalog] = useState([]);

  // Load catalogs on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [r, t] = await Promise.all([
          getResponsables(),
          getTanques(),
        ]);
        setResponsables(r);
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
    lote_tapa: readLoteTapa(production.linea),
    control_videojet: 'OK',
    responsable: '',
  });

  useEffect(() => {
    setBebidaForm((previous) => ({ ...previous, lote_tapa: readLoteTapa(production.linea) }));
  }, [production.linea]);

  const handleBebidaSubmit = async (e) => {
    e.preventDefault();
    if (!productionReady) return;
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
        lote_tapa: bebidaForm.lote_tapa.trim(),
        linea: production.linea,
        turno: production.turno,
        production_version: production.version,
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
      handleProductionConflict(err);
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
    if (!productionReady) return;
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
        production_version: production.version,
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
      handleProductionConflict(err);
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
    if (!productionReady) return;
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
          production_version: production.version,
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
      handleProductionConflict(err);
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
        {/* Header: Tabs + Pausa */}
        {!productionReady && (
          <div role="status" className="production-status-banner">
            {productionError
              ? `No se pudo cargar la producción: ${productionError}`
              : productionLoading
                ? 'Cargando producción de esta línea…'
                : 'Configure la producción de esta línea con “Cambiar producción” antes de registrar controles.'}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.25rem' }}>


          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem', color: 'var(--color-alerta, #D69E2E)', borderColor: 'var(--color-alerta, #D69E2E)' }}
              onClick={() => setShowPausaModal(true)}
            >
              <PauseCircle size={15} style={{ marginRight: '0.3rem' }} />
              Registrar Pausa
            </button>
          </div>
        </div>

        {/* TAB 1: BEBIDA TERMINADA */}
        {activeTab === 'bebida' && (
          <BebidaForm
            production={production}
            productionReady={productionReady}
            responsables={responsables}
            bebidaForm={bebidaForm}
            setBebidaForm={setBebidaForm}
            handleBebidaSubmit={handleBebidaSubmit}
            rememberLoteTapa={rememberLoteTapa}
          />
        )}

        {/* TAB 2: CONTROL DE JARABE */}
        {activeTab === 'jarabe' && (
          <ControlJarabeForm
            productionReady={productionReady}
            responsables={responsables}
            tanquesCatalog={tanquesCatalog}
            jarabeForm={jarabeForm}
            setJarabeForm={setJarabeForm}
            handleJarabeSubmit={handleJarabeSubmit}
          />
        )}

        {/* TAB 3: CONTROL DE TORQUE — LISTA DINÁMICA DE CABEZALES */}
        {activeTab === 'torque' && (
          <TorqueForm
            production={production}
            productionReady={productionReady}
            responsables={responsables}
            maxCabezales={maxCabezales}
            torqueForm={torqueForm}
            setTorqueForm={setTorqueForm}
            addCabezal={addCabezal}
            removeCabezal={removeCabezal}
            updateCabezal={updateCabezal}
            handleTorqueSubmit={handleTorqueSubmit}
          />
        )}

      </main>

      <SidebarInfo />

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
            <FormLayout title="Registrar pausa" compact onSubmit={async (e) => { await handlePausaSubmit(e); setShowPausaModal(false); }} style={{ marginTop: '1rem' }}>
              <div className="form-grid">
                <FormField className="field-container col-span-2">
                  <label>Motivo de la Pausa <span className="required-star">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Cambio de formato, Mantenimiento preventivo"
                    value={pausaForm.motivo}
                    onChange={(e) => setPausaForm({ ...pausaForm, motivo: e.target.value })}
                  />
                </FormField>
                <FormField className="field-container col-span-2">
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
                </FormField>
                <FormField className="field-container col-span-2">
                  <label>Observaciones</label>
                  <textarea
                    rows="3"
                    placeholder="Detalles sobre la parada de línea..."
                    value={pausaForm.observacion}
                    onChange={(e) => setPausaForm({ ...pausaForm, observacion: e.target.value })}
                  />
                </FormField>
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
            </FormLayout>
          </div>
        </div>
      )}
    </div>
  );
}
