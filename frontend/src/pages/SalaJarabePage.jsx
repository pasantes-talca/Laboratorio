import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet,
  Save,
  RotateCcw,
  Upload,
  Clock,
  Calendar,
  Building,
  Droplets,
  User,
  PackageCheck,
  Edit3,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useProduction } from '../context/ProductionContext';
import MultiInputList from '../components/MultiInputList';
import {
  getResponsablesJarabe,
  getSabores,
  getTiposConcentrado,
  getTanques,
  getJarabeSimples,
  submitJarabeSimple,
  submitJarabeTerminado,
  submitSaneoTanque,
  submitParteJarabe,
  parseJarabeExcel,
} from '../services/api';

export default function SalaJarabePage() {
  const { showToast } = useToast();
  const { production, openModal } = useProduction();

  const [activeTab, setActiveTab] = useState('simple');
  const [responsables, setResponsables] = useState([]);
  const [sabores, setSabores] = useState([]);
  const [concentrados, setConcentrados] = useState([]);
  const [tanquesCatalog, setTanquesCatalog] = useState([]);
  // volcado_numero auto-computed
  const [volcadoAuto, setVolcadoAuto] = useState(null);
  const [availableVolcados, setAvailableVolcados] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [r, s, c, t] = await Promise.all([
          getResponsablesJarabe(),
          getSabores(),
          getTiposConcentrado(),
          getTanques(),
        ]);
        setResponsables(r);
        setSabores(s);
        setConcentrados(c);
        setTanquesCatalog(t);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const today = new Date().toISOString().split('T')[0];

  // ----------------------------------------------------
  // FORM 1: JARABE SIMPLE
  // ----------------------------------------------------
  const [simpleForm, setSimpleForm] = useState({
    fecha: today,
    hora: '',
    tanque: '',
    volcado_numero: '',
    cantidad_bolsas: '',
    azucar_tipo: '',
    marcas: [''],
    ntus: [''],
    aux_standard: '',
    aux_hyflo: '',
    pasteurizado_desde: '',
    pasteurizado_hasta: '',
    pasteurizado_temp: '',
    responsables: [''],
  });

  // Auto-compute next volcado number when tanque or fecha changes
  const computeVolcado = useCallback(async (tanque, fecha) => {
    if (!tanque || tanque === 'N/A') { setVolcadoAuto(null); return; }
    try {
      const records = await getJarabeSimples({ tanque, fecha });
      const nextNum = records.length > 0
        ? Math.max(...records.map(r => r.volcado_numero || 0)) + 1
        : 1;
      setVolcadoAuto(nextNum);
    } catch (_) { setVolcadoAuto(null); }
  }, []);

  useEffect(() => {
    computeVolcado(simpleForm.tanque, simpleForm.fecha);
  }, [simpleForm.tanque, simpleForm.fecha, computeVolcado]);

  const handleSimpleSubmit = async (e) => {
    e.preventDefault();
    try {
      const validResponsables = simpleForm.responsables.filter(Boolean);
      if (!validResponsables.length) {
        showToast('Seleccioná al menos un responsable', 'error');
        return;
      }
      const payload = {
        fecha: simpleForm.fecha,
        hora: simpleForm.hora || null,
        tanque: simpleForm.tanque,
        volcado_numero: parseInt(simpleForm.volcado_numero, 10) || 1,
        cantidad_bolsas: parseInt(simpleForm.cantidad_bolsas, 10) || 0,
        azucar_tipo: simpleForm.azucar_tipo,
        azucar_marca: simpleForm.marcas.filter(Boolean).join(', '),
        azucar_ntu: simpleForm.ntus.filter(Boolean).join(', ') || null,
        aux_standard: parseFloat(simpleForm.aux_standard) || null,
        aux_hyflo: parseFloat(simpleForm.aux_hyflo) || null,
        pasteurizado_desde: simpleForm.pasteurizado_desde || null,
        pasteurizado_hasta: simpleForm.pasteurizado_hasta || null,
        pasteurizado_temp: parseFloat(simpleForm.pasteurizado_temp) || null,
        responsables: validResponsables,
      };
      await submitJarabeSimple(payload);
      showToast('Jarabe Simple registrado con éxito', 'success');
      setSimpleForm((prev) => ({
        ...prev,
        tanque: '',
        volcado_numero: '',
        cantidad_bolsas: '',
        azucar_tipo: '',
        marcas: [''],
        ntus: [''],
        aux_standard: '',
        aux_hyflo: '',
        pasteurizado_desde: '',
        pasteurizado_hasta: '',
        pasteurizado_temp: '',
        responsables: [''],
      }));
      setVolcadoAuto(null);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ----------------------------------------------------
  // FORM 2: JARABE TERMINADO
  // ----------------------------------------------------
  const [terminadoForm, setTerminadoForm] = useState({
    fecha: today,
    sabor: '',
    concentrado: '',
    tanque: '',
    unidades: '',
    volcados: [''],
    tiempo_filtrado: '',
    be_jarabe_simple: '',
    vol_jarabe_simple: '',
    lts_jarabe_terminado: '',
    responsables: [''],
  });

  // Fetch registered volcado numbers for the selected tank, sabor and fecha
  useEffect(() => {
    async function fetchVolcados() {
      if (!terminadoForm.tanque && !terminadoForm.sabor) {
        setAvailableVolcados([]);
        return;
      }
      try {
        const params = {};
        if (terminadoForm.tanque) params.tanque = terminadoForm.tanque;
        if (terminadoForm.sabor) params.sabor = terminadoForm.sabor;
        if (terminadoForm.fecha) params.fecha = terminadoForm.fecha;
        const records = await getJarabeSimples(params);
        const uniqueVols = Array.from(new Set(records.map(r => r.volcado_numero).filter(Boolean)));
        uniqueVols.sort((a, b) => a - b);
        setAvailableVolcados(uniqueVols);
      } catch (err) {
        console.error(err);
        setAvailableVolcados([]);
      }
    }
    fetchVolcados();
  }, [terminadoForm.tanque, terminadoForm.sabor, terminadoForm.fecha]);

  const handleTerminadoSubmit = async (e) => {
    e.preventDefault();
    try {
      const validResponsables = terminadoForm.responsables.filter(Boolean);
      if (!validResponsables.length) {
        showToast('Seleccioná al menos un responsable', 'error');
        return;
      }
      const payload = {
        fecha: terminadoForm.fecha,
        sabor: terminadoForm.sabor,
        concentrado: terminadoForm.concentrado,
        tanque: terminadoForm.tanque,
        unidades: parseInt(terminadoForm.unidades, 10) || 0,
        volcado_numero: terminadoForm.volcados.filter(Boolean).join(', '),
        tiempo_filtrado: terminadoForm.tiempo_filtrado || null,
        be_jarabe_simple: parseFloat(terminadoForm.be_jarabe_simple) || null,
        vol_jarabe_simple: parseFloat(terminadoForm.vol_jarabe_simple) || null,
        lts_jarabe_terminado: parseFloat(terminadoForm.lts_jarabe_terminado) || null,
        responsables: validResponsables,
      };
      await submitJarabeTerminado(payload);
      showToast('Jarabe Terminado registrado con éxito', 'success');
      setTerminadoForm((prev) => ({
        ...prev,
        tanque: '',
        unidades: '',
        volcados: [''],
        tiempo_filtrado: '',
        be_jarabe_simple: '',
        vol_jarabe_simple: '',
        lts_jarabe_terminado: '',
        responsables: [''],
      }));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ----------------------------------------------------
  // FORM 3: SANEO DE TANQUES
  // ----------------------------------------------------
  const [saneoForm, setSaneoForm] = useState({
    fecha: today,
    hora_inicio: '',
    hora_fin: '',
    tanque: '',
    producto: '',
    responsables: [''],
    numero_saneo: '',
  });

  const handleSaneoSubmit = async (e) => {
    e.preventDefault();
    try {
      const validResponsables = saneoForm.responsables.filter(Boolean);
      if (!validResponsables.length) {
        showToast('Seleccioná al menos un responsable', 'error');
        return;
      }
      const payload = {
        fecha: saneoForm.fecha,
        hora_inicio: saneoForm.hora_inicio || null,
        hora_fin: saneoForm.hora_fin || null,
        tanque: saneoForm.tanque,
        producto: saneoForm.producto,
        responsables: validResponsables,
        numero_saneo: parseInt(saneoForm.numero_saneo, 10) || null,
      };
      await submitSaneoTanque(payload);
      showToast('Saneo de tanque registrado con éxito', 'success');
      setSaneoForm((prev) => ({
        ...prev,
        hora_inicio: '',
        hora_fin: '',
        tanque: '',
        producto: '',
        responsables: [''],
        numero_saneo: '',
      }));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ----------------------------------------------------
  // FORM 4: PARTE DE JARABE & EXCEL IMPORT
  // ----------------------------------------------------
  const [parteForm, setParteForm] = useState({
    fecha: today,
    turno: 'Mañana',
    tanque: '',
    sabor: '',
    numero_carga_trilay: '',
    responsables: [''],
    azucar: '',
    sucralosa: '',
    reforzado_citrico: '',
    acesulfame_k: '',
    benzoato_sodio: '',
    sorbato_potasio: '',
    citrato_sodio: '',
    acido_citrico: '',
    acido_fosforico: '',
    acido_ascorbico: '',
    cafeina: '',
    colorante_caramelo: '',
  });

  const [parsingExcel, setParsingExcel] = useState(false);

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setParsingExcel(true);
      const res = await parseJarabeExcel(file);
      if (res.status === 'success' && res.data) {
        const d = res.data;
        setParteForm((prev) => ({
          ...prev,
          tanque: d.tanque || prev.tanque,
          sabor: d.sabor || prev.sabor,
          numero_carga_trilay: d.numero_carga || prev.numero_carga_trilay,
          azucar: d.azucar != null ? String(d.azucar) : '',
          sucralosa: d.sucralosa != null ? String(d.sucralosa) : '',
          reforzado_citrico: d.reforzado_citrico != null ? String(d.reforzado_citrico) : '',
          acesulfame_k: d.acesulfame_k != null ? String(d.acesulfame_k) : '',
          benzoato_sodio: d.benzoato_sodio != null ? String(d.benzoato_sodio) : '',
          sorbato_potasio: d.sorbato_potasio != null ? String(d.sorbato_potasio) : '',
          citrato_sodio: d.citrato_sodio != null ? String(d.citrato_sodio) : '',
          acido_citrico: d.acido_citrico != null ? String(d.acido_citrico) : '',
          acido_fosforico: d.acido_fosforico != null ? String(d.acido_fosforico) : '',
          acido_ascorbico: d.acido_ascorbico != null ? String(d.acido_ascorbico) : '',
          cafeina: d.cafeina != null ? String(d.cafeina) : '',
          colorante_caramelo: d.colorante_caramelo != null ? String(d.colorante_caramelo) : '',
        }));
        showToast('Datos de Parte de Jarabe extraídos correctamente', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setParsingExcel(false);
      e.target.value = '';
    }
  };

  const handleParteSubmit = async (e) => {
    e.preventDefault();
    try {
      const validResponsables = parteForm.responsables.filter(Boolean);
      if (!validResponsables.length) {
        showToast('Seleccioná al menos un responsable', 'error');
        return;
      }
      const payload = {
        fecha: parteForm.fecha,
        turno: parteForm.turno,
        tanque: parteForm.tanque,
        sabor: parteForm.sabor || null,
        numero_carga_trilay: parteForm.numero_carga_trilay,
        responsables: validResponsables,
        azucar: parseFloat(parteForm.azucar) || null,
        sucralosa: parseFloat(parteForm.sucralosa) || null,
        reforzado_citrico: parseFloat(parteForm.reforzado_citrico) || null,
        acesulfame_k: parseFloat(parteForm.acesulfame_k) || null,
        benzoato_sodio: parseFloat(parteForm.benzoato_sodio) || null,
        sorbato_potasio: parseFloat(parteForm.sorbato_potasio) || null,
        citrato_sodio: parseFloat(parteForm.citrato_sodio) || null,
        acido_citrico: parseFloat(parteForm.acido_citrico) || null,
        acido_fosforico: parseFloat(parteForm.acido_fosforico) || null,
        acido_ascorbico: parseFloat(parteForm.acido_ascorbico) || null,
        cafeina: parseFloat(parteForm.cafeina) || null,
        colorante_caramelo: parseFloat(parteForm.colorante_caramelo) || null,
      };
      await submitParteJarabe(payload);
      showToast('Parte de Jarabe registrado con éxito', 'success');
      setParteForm((prev) => ({
        ...prev,
        tanque: '',
        numero_carga_trilay: '',
        responsables: [''],
        azucar: '',
        sucralosa: '',
        reforzado_citrico: '',
        acesulfame_k: '',
        benzoato_sodio: '',
        sorbato_potasio: '',
        citrato_sodio: '',
        acido_citrico: '',
        acido_fosforico: '',
        acido_ascorbico: '',
        cafeina: '',
        colorante_caramelo: '',
      }));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };


  return (
    <div className="content-grid">
      <main className="card">
        {/* Tabs Header */}
        <div className="tabs-container">
          <button
            type="button"
            className={`tab-button ${activeTab === 'simple' ? 'active' : ''}`}
            onClick={() => setActiveTab('simple')}
          >
            <Layers size={18} />
            Jarabe Simple
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === 'terminado' ? 'active' : ''}`}
            onClick={() => setActiveTab('terminado')}
          >
            <Sparkles size={18} />
            Jarabe Terminado
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === 'saneo' ? 'active' : ''}`}
            onClick={() => setActiveTab('saneo')}
          >
            <ShieldCheck size={18} />
            Saneo de Tanques
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === 'parte' ? 'active' : ''}`}
            onClick={() => setActiveTab('parte')}
          >
            <FileSpreadsheet size={18} />
            Parte de Jarabe
          </button>
        </div>

        {/* TAB 1: JARABE SIMPLE */}
        {activeTab === 'simple' && (
          <form id="simple-form" onSubmit={handleSimpleSubmit} style={{ marginTop: '1.25rem' }}>
            <div className="form-grid">

              <div className="field-container">
                <label>
                  N° Volcado <span className="required-star">*</span>
                  {volcadoAuto !== null && (
                    <span style={{ marginLeft: '0.5rem', color: '#00f2fe', fontSize: '0.78rem' }}>
                      (sugerido: {volcadoAuto})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  required
                  placeholder={volcadoAuto !== null ? String(volcadoAuto) : 'Ej: 1'}
                  value={simpleForm.volcado_numero || (volcadoAuto !== null ? volcadoAuto : '')}
                  onChange={(e) => setSimpleForm({ ...simpleForm, volcado_numero: e.target.value })}
                />
              </div>

              <div className="field-container">
                <label>Cantidad de Bolsas <span className="required-star">*</span></label>
                <input
                  type="number"
                  required
                  placeholder="Ej: 80"
                  value={simpleForm.cantidad_bolsas}
                  onChange={(e) => setSimpleForm({ ...simpleForm, cantidad_bolsas: e.target.value })}
                />
              </div>

              <div className="field-container">
                <label>Tipo de Azúcar</label>
                <input
                  type="text"
                  placeholder="Ej: Común Tipo A, Refinada..."
                  value={simpleForm.azucar_tipo}
                  onChange={(e) => setSimpleForm({ ...simpleForm, azucar_tipo: e.target.value })}
                />
              </div>

              <div className="field-container col-span-2">
                <label>Marca(s) de Azúcar <span className="required-star">*</span></label>
                <MultiInputList
                  items={simpleForm.marcas}
                  onChange={(marcas) => setSimpleForm({ ...simpleForm, marcas })}
                  placeholder="Ej: Ledesma, Tabacal..."
                  addButtonText="Agregar Marca de azúcar"
                  icon={Building}
                  required
                />
              </div>

              <div className="field-container col-span-2">
                <label>Turbidez (NTU)</label>
                <MultiInputList
                  items={simpleForm.ntus}
                  onChange={(ntus) => setSimpleForm({ ...simpleForm, ntus })}
                  placeholder="Ej: 24.5"
                  addButtonText="Agregar NTU"
                  icon={Droplets}
                />
              </div>

              <div className="field-container">
                <label>Auxiliar Standard (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ej: 12.5"
                  value={simpleForm.aux_standard}
                  onChange={(e) => setSimpleForm({ ...simpleForm, aux_standard: e.target.value })}
                />
              </div>

              <div className="field-container">
                <label>Auxiliar Hyflo (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ej: 8.0"
                  value={simpleForm.aux_hyflo}
                  onChange={(e) => setSimpleForm({ ...simpleForm, aux_hyflo: e.target.value })}
                />
              </div>

              <div className="field-container">
                <label>Pasteurizado Desde</label>
                <input
                  type="time"
                  value={simpleForm.pasteurizado_desde}
                  onChange={(e) => setSimpleForm({ ...simpleForm, pasteurizado_desde: e.target.value })}
                />
              </div>

              <div className="field-container">
                <label>Pasteurizado Hasta</label>
                <input
                  type="time"
                  value={simpleForm.pasteurizado_hasta}
                  onChange={(e) => setSimpleForm({ ...simpleForm, pasteurizado_hasta: e.target.value })}
                />
              </div>

              <div className="field-container">
                <label>Temp Pasteurizado (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ej: 85.0"
                  value={simpleForm.pasteurizado_temp}
                  onChange={(e) => setSimpleForm({ ...simpleForm, pasteurizado_temp: e.target.value })}
                />
              </div>

              <div className="field-container col-span-2">
                <label>Responsables (Sala de Jarabe) <span className="required-star">*</span></label>
                <MultiInputList
                  type="select"
                  items={simpleForm.responsables}
                  options={responsables.map((r) => ({ value: r.nombre_completo, label: r.nombre_completo }))}
                  onChange={(responsables) => setSimpleForm({ ...simpleForm, responsables })}
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
                onClick={() => { setSimpleForm({
                  fecha: today,
                  hora: '',
                  tanque: '',
                  volcado_numero: '',
                  cantidad_bolsas: '',
                  azucar_tipo: '',
                  marcas: [''],
                  ntus: [''],
                  aux_standard: '',
                  aux_hyflo: '',
                  pasteurizado_desde: '',
                  pasteurizado_hasta: '',
                  pasteurizado_temp: '',
                  responsables: [''],
                }); setVolcadoAuto(null); }}
              >
                <RotateCcw size={16} /> Limpiar
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Registrar Jarabe Simple
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: JARABE TERMINADO */}
        {activeTab === 'terminado' && (
          <form id="terminado-form" onSubmit={handleTerminadoSubmit} style={{ marginTop: '1.25rem' }}>
            <div className="form-grid">

              <div className="field-container">
                <label>Unidades / Cargas <span className="required-star">*</span></label>
                <input
                  type="number"
                  required
                  placeholder="Ej: 2"
                  value={terminadoForm.unidades}
                  onChange={(e) => setTerminadoForm({ ...terminadoForm, unidades: e.target.value })}
                />
              </div>

              <div className="field-container">
                <label>Tiempo Filtrado (min / hs)</label>
                <input
                  type="text"
                  placeholder="Ej: 45 min"
                  value={terminadoForm.tiempo_filtrado}
                  onChange={(e) => setTerminadoForm({ ...terminadoForm, tiempo_filtrado: e.target.value })}
                />
              </div>

              <div className="field-container col-span-2">
                <label>Número(s) de Volcado <span className="required-star">*</span></label>
                {availableVolcados.length > 0 ? (
                  <MultiInputList
                    type="select"
                    items={terminadoForm.volcados}
                    options={availableVolcados.map(v => ({ value: String(v), label: `Volcado ${v}` }))}
                    onChange={(volcados) => setTerminadoForm({ ...terminadoForm, volcados })}
                    placeholder="Seleccione volcado..."
                    addButtonText="Agregar Número de Volcado"
                    required
                  />
                ) : (
                  <div>
                    <MultiInputList
                      items={terminadoForm.volcados}
                      onChange={(volcados) => setTerminadoForm({ ...terminadoForm, volcados })}
                      placeholder="Ej: 1"
                      addButtonText="Agregar Número de Volcado"
                      required
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                      No hay volcados registrados para este tanque/fecha en Jarabe Simple. Ingrese el número manualmente.
                    </span>
                  </div>
                )}
              </div>

              <div className="field-container">
                <label>°Brix Jarabe Simple</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ej: 65.5"
                  value={terminadoForm.be_jarabe_simple}
                  onChange={(e) => setTerminadoForm({ ...terminadoForm, be_jarabe_simple: e.target.value })}
                />
              </div>

              <div className="field-container">
                <label>Volumen Jarabe Simple (Lts)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ej: 4500"
                  value={terminadoForm.vol_jarabe_simple}
                  onChange={(e) => setTerminadoForm({ ...terminadoForm, vol_jarabe_simple: e.target.value })}
                />
              </div>

              <div className="field-container col-span-2">
                <label>Litros Jarabe Terminado (Lts)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ej: 6000"
                  value={terminadoForm.lts_jarabe_terminado}
                  onChange={(e) => setTerminadoForm({ ...terminadoForm, lts_jarabe_terminado: e.target.value })}
                />
              </div>

              <div className="field-container col-span-2">
                <label>Responsables (Sala de Jarabe) <span className="required-star">*</span></label>
                <MultiInputList
                  type="select"
                  items={terminadoForm.responsables}
                  options={responsables.map((r) => ({ value: r.nombre_completo, label: r.nombre_completo }))}
                  onChange={(responsables) => setTerminadoForm({ ...terminadoForm, responsables })}
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
                onClick={() => setTerminadoForm({
                  fecha: today,
                  sabor: '',
                  concentrado: '',
                  tanque: '',
                  unidades: '',
                  volcados: [''],
                  tiempo_filtrado: '',
                  be_jarabe_simple: '',
                  vol_jarabe_simple: '',
                  lts_jarabe_terminado: '',
                  responsables: [''],
                })}
              >
                <RotateCcw size={16} /> Limpiar
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Registrar Jarabe Terminado
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: SANEO DE TANQUES */}
        {activeTab === 'saneo' && (
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
        )}

        {/* TAB 4: PARTE DE JARABE & EXCEL IMPORT */}
        {activeTab === 'parte' && (
          <form onSubmit={handleParteSubmit} style={{ marginTop: '1.25rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileSpreadsheet size={18} />
                  Importar Parte desde Excel / HTML
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Cargue el reporte generado por sala de jarabe para autocompletar las cantidades.
                </div>
              </div>
              <label className="btn btn-success" style={{ cursor: 'pointer' }}>
                <Upload size={16} />
                {parsingExcel ? 'Procesando...' : 'Cargar Reporte Excel'}
                <input
                  type="file"
                  accept=".xls,.xlsx,.html,.htm"
                  style={{ display: 'none' }}
                  onChange={handleExcelUpload}
                  disabled={parsingExcel}
                />
              </label>
            </div>

            <div className="form-grid">
              <div className="field-container">
                <label>Fecha <span className="required-star">*</span></label>
                <input
                  type="date"
                  required
                  value={parteForm.fecha}
                  onChange={(e) => setParteForm({ ...parteForm, fecha: e.target.value })}
                />
              </div>

              <div className="field-container">
                <label>Turno <span className="required-star">*</span></label>
                <select
                  value={parteForm.turno}
                  onChange={(e) => setParteForm({ ...parteForm, turno: e.target.value })}
                >
                  <option value="Mañana">Mañana</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noche">Noche</option>
                </select>
              </div>

              <div className="field-container">
                <label>Tanque <span className="required-star">*</span></label>
                <select
                  required
                  value={parteForm.tanque}
                  onChange={(e) => setParteForm({ ...parteForm, tanque: e.target.value })}
                >
                  <option value="" disabled>Seleccione tanque...</option>
                  {tanquesCatalog.map((t) => (
                    <option key={t.id} value={t.numero}>{t.numero === 'N/A' ? 'N/A' : `Tanque ${t.numero}`}</option>
                  ))}
                </select>
              </div>

              <div className="field-container">
                <label>N° Carga Trilay <span className="required-star">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ej: TR-4521"
                  value={parteForm.numero_carga_trilay}
                  onChange={(e) => setParteForm({ ...parteForm, numero_carga_trilay: e.target.value })}
                />
              </div>

              <div className="field-container col-span-2">
                <label>Sabor / Marca</label>
                <select
                  value={parteForm.sabor}
                  onChange={(e) => setParteForm({ ...parteForm, sabor: e.target.value })}
                >
                  <option value="">Seleccione sabor (opcional)...</option>
                  {sabores.map((s) => (
                    <option key={s.id} value={s.nombre}>{s.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="field-container col-span-2">
                <label>Responsables (Sala de Jarabe) <span className="required-star">*</span></label>
                <MultiInputList
                  type="select"
                  items={parteForm.responsables}
                  options={responsables.map((r) => ({ value: r.nombre_completo, label: r.nombre_completo }))}
                  onChange={(responsables) => setParteForm({ ...parteForm, responsables })}
                  placeholder="Seleccione responsable..."
                  addButtonText="Agregar responsable"
                  icon={User}
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem' }}>
              <h4 style={{ fontSize: '1rem', color: '#00f2fe', marginBottom: '1rem', fontWeight: 600 }}>
                Dosificación de Materias Primas e Insumos (kg)
              </h4>
              <div className="form-grid">
                <div className="field-container">
                  <label>Azúcar (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={parteForm.azucar}
                    onChange={(e) => setParteForm({ ...parteForm, azucar: e.target.value })}
                  />
                </div>

                <div className="field-container">
                  <label>Sucralosa (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={parteForm.sucralosa}
                    onChange={(e) => setParteForm({ ...parteForm, sucralosa: e.target.value })}
                  />
                </div>

                <div className="field-container">
                  <label>Reforzado Cítrico (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={parteForm.reforzado_citrico}
                    onChange={(e) => setParteForm({ ...parteForm, reforzado_citrico: e.target.value })}
                  />
                </div>

                <div className="field-container">
                  <label>Acesulfame K (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={parteForm.acesulfame_k}
                    onChange={(e) => setParteForm({ ...parteForm, acesulfame_k: e.target.value })}
                  />
                </div>

                <div className="field-container">
                  <label>Benzoato de Sodio (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={parteForm.benzoato_sodio}
                    onChange={(e) => setParteForm({ ...parteForm, benzoato_sodio: e.target.value })}
                  />
                </div>

                <div className="field-container">
                  <label>Sorbato de Potasio (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={parteForm.sorbato_potasio}
                    onChange={(e) => setParteForm({ ...parteForm, sorbato_potasio: e.target.value })}
                  />
                </div>

                <div className="field-container">
                  <label>Citrato de Sodio (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={parteForm.citrato_sodio}
                    onChange={(e) => setParteForm({ ...parteForm, citrato_sodio: e.target.value })}
                  />
                </div>

                <div className="field-container">
                  <label>Ácido Cítrico (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={parteForm.acido_citrico}
                    onChange={(e) => setParteForm({ ...parteForm, acido_citrico: e.target.value })}
                  />
                </div>

                <div className="field-container">
                  <label>Ácido Fosfórico (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={parteForm.acido_fosforico}
                    onChange={(e) => setParteForm({ ...parteForm, acido_fosforico: e.target.value })}
                  />
                </div>

                <div className="field-container">
                  <label>Ácido Ascórbico (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={parteForm.acido_ascorbico}
                    onChange={(e) => setParteForm({ ...parteForm, acido_ascorbico: e.target.value })}
                  />
                </div>

                <div className="field-container">
                  <label>Cafeína (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={parteForm.cafeina}
                    onChange={(e) => setParteForm({ ...parteForm, cafeina: e.target.value })}
                  />
                </div>

                <div className="field-container">
                  <label>Colorante Caramelo (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={parteForm.colorante_caramelo}
                    onChange={(e) => setParteForm({ ...parteForm, colorante_caramelo: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setParteForm({
                  fecha: today,
                  turno: 'Mañana',
                  tanque: '',
                  sabor: '',
                  numero_carga_trilay: '',
                  responsables: [''],
                  azucar: '',
                  sucralosa: '',
                  reforzado_citrico: '',
                  acesulfame_k: '',
                  benzoato_sodio: '',
                  sorbato_potasio: '',
                  citrato_sodio: '',
                  acido_citrico: '',
                  acido_fosforico: '',
                  acido_ascorbico: '',
                  cafeina: '',
                  colorante_caramelo: '',
                })}
              >
                <RotateCcw size={16} /> Limpiar
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Registrar Parte de Jarabe
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Sidebar: Producción Activa (Jarabe) */}
      {(activeTab === 'simple' || activeTab === 'terminado') && (
        <aside className="sidebar-card">
          <div className="sidebar-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <PackageCheck size={20} color="#00f2fe" />
              <span>{activeTab === 'simple' ? 'Jarabe Simple Activo' : 'Jarabe Terminado Activo'}</span>
            </div>
          </div>

          <div className="sidebar-data-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {activeTab === 'simple' ? (
              <>
                <div className="field-container" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fecha <span className="required-star">*</span></label>
                  <div className="input-wrapper">
                    <Calendar className="input-icon" size={16} />
                    <input
                      type="date"
                      required
                      form="simple-form"
                      value={simpleForm.fecha}
                      onChange={(e) => setSimpleForm({ ...simpleForm, fecha: e.target.value })}
                      style={{ padding: '0.4rem 0.6rem 0.4rem 2.2rem', fontSize: '0.9rem', width: '100%' }}
                    />
                  </div>
                </div>

                <div className="field-container" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Hora</label>
                  <div className="input-wrapper">
                    <Clock className="input-icon" size={16} />
                    <input
                      type="time"
                      form="simple-form"
                      value={simpleForm.hora}
                      onChange={(e) => setSimpleForm({ ...simpleForm, hora: e.target.value })}
                      style={{ padding: '0.4rem 0.6rem 0.4rem 2.2rem', fontSize: '0.9rem', width: '100%' }}
                    />
                  </div>
                </div>

                <div className="field-container" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tanque Asignado <span className="required-star">*</span></label>
                  <select
                    required
                    form="simple-form"
                    value={simpleForm.tanque}
                    onChange={(e) => setSimpleForm({ ...simpleForm, tanque: e.target.value })}
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.9rem', width: '100%' }}
                  >
                    <option value="" disabled>Seleccione tanque...</option>
                    {tanquesCatalog.map((t) => (
                      <option key={t.id} value={t.numero}>{t.numero === 'N/A' ? 'N/A' : `Tanque ${t.numero}`}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="field-container" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fecha <span className="required-star">*</span></label>
                  <input
                    type="date"
                    required
                    form="terminado-form"
                    value={terminadoForm.fecha}
                    onChange={(e) => setTerminadoForm({ ...terminadoForm, fecha: e.target.value })}
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.9rem', width: '100%' }}
                  />
                </div>

                <div className="field-container" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sabor / Marca <span className="required-star">*</span></label>
                  <select
                    required
                    form="terminado-form"
                    value={terminadoForm.sabor}
                    onChange={(e) => setTerminadoForm({ ...terminadoForm, sabor: e.target.value })}
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.9rem', width: '100%' }}
                  >
                    <option value="" disabled>Seleccione sabor...</option>
                    {sabores.map((s) => (
                      <option key={s.id} value={s.nombre}>{s.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="field-container" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tipo de Concentrado <span className="required-star">*</span></label>
                  <select
                    required
                    form="terminado-form"
                    value={terminadoForm.concentrado}
                    onChange={(e) => setTerminadoForm({ ...terminadoForm, concentrado: e.target.value })}
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.9rem', width: '100%' }}
                  >
                    <option value="" disabled>Seleccione...</option>
                    {concentrados.map((c) => (
                      <option key={c.id} value={c.codigo}>{c.codigo}</option>
                    ))}
                  </select>
                </div>

                <div className="field-container" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tanque <span className="required-star">*</span></label>
                  <select
                    required
                    form="terminado-form"
                    value={terminadoForm.tanque}
                    onChange={(e) => setTerminadoForm({ ...terminadoForm, tanque: e.target.value })}
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.9rem', width: '100%' }}
                  >
                    <option value="" disabled>Seleccione tanque...</option>
                    {tanquesCatalog.map((t) => (
                      <option key={t.id} value={t.numero}>{t.numero === 'N/A' ? 'N/A' : `Tanque ${t.numero}`}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
