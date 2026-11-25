import { FormField } from '../../../componentes/FormLayout';
import JarabeSimpleForm from '../componentes/JarabeSimpleForm';
import JarabeTerminadoForm from '../componentes/JarabeTerminadoForm';
import SaneoTanquesForm from '../componentes/SaneoTanquesForm';
import ParteJarabeForm from '../componentes/ParteJarabeForm';
import React, { useState, useEffect, useCallback } from 'react';
import { PackageCheck } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { getResponsablesJarabe, getSabores, getTanques } from '../../../services/api';
import { getJarabeSimples, submitJarabeSimple, submitJarabeTerminado, submitSaneoTanque, submitParteJarabe, parseJarabeExcel } from '../api/jarabeApi';
import { getConcentradosForSabor } from '../../../utils/productRules';

export default function SalaJarabePage({ initialTab = 'simple' }) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);
  useEffect(() => setActiveTab(initialTab), [initialTab]);
  const [responsables, setResponsables] = useState([]);
  const [sabores, setSabores] = useState([]);
  const [tanquesCatalog, setTanquesCatalog] = useState([]);
  // volcado_numero auto-computed
  const [volcadoAuto, setVolcadoAuto] = useState(null);
  const [availableVolcados, setAvailableVolcados] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [r, s, t] = await Promise.all([
          getResponsablesJarabe(),
          getSabores(),
          getTanques(),
        ]);
        setResponsables(r);
        setSabores(s);
        const processedTanques = t.map(tanque =>
          tanque.numero === 'TALCA' ? { ...tanque, numero: 'N/A' } : tanque
        ).reduce((acc, curr) => {
          if (!acc.some(x => x.numero === curr.numero)) acc.push(curr);
          return acc;
        }, []);
        setTanquesCatalog(processedTanques);
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
    } catch { setVolcadoAuto(null); }
  }, []);

  useEffect(() => {
    const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date());
    computeVolcado(simpleForm.tanque, date);
  }, [simpleForm.tanque, computeVolcado]);

  const handleSimpleSubmit = async (e) => {
    e.preventDefault();
    try {
      const validResponsables = simpleForm.responsables.filter(Boolean);
      if (!validResponsables.length) {
        showToast('Seleccioná al menos un responsable', 'error');
        return;
      }
      const payload = {
        tanque: simpleForm.tanque,
        volcado_numero: parseInt(simpleForm.volcado_numero || volcadoAuto, 10) || 1,
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
    <div className="content-grid" style={activeTab === 'simple' ? { gridTemplateColumns: 'minmax(0, 1fr)' } : undefined}>
      <main className="card">
        {/* Tabs Header */}


        {/* TAB 1: JARABE SIMPLE */}
        {activeTab === 'simple' && (
          <JarabeSimpleForm
            responsables={responsables}
            volcadoAuto={volcadoAuto}
            setVolcadoAuto={setVolcadoAuto}
            tanquesCatalog={tanquesCatalog}
            simpleForm={simpleForm}
            setSimpleForm={setSimpleForm}
            handleSimpleSubmit={handleSimpleSubmit}
          />
        )}

        {/* TAB 2: JARABE TERMINADO */}
        {activeTab === 'terminado' && (
          <JarabeTerminadoForm
            responsables={responsables}
            availableVolcados={availableVolcados}
            today={today}
            terminadoForm={terminadoForm}
            setTerminadoForm={setTerminadoForm}
            handleTerminadoSubmit={handleTerminadoSubmit}
          />
        )}

        {/* TAB 3: SANEO DE TANQUES */}
        {activeTab === 'saneo' && (
          <SaneoTanquesForm
            responsables={responsables}
            tanquesCatalog={tanquesCatalog}
            today={today}
            saneoForm={saneoForm}
            setSaneoForm={setSaneoForm}
            handleSaneoSubmit={handleSaneoSubmit}
          />
        )}

        {/* TAB 4: PARTE DE JARABE & EXCEL IMPORT */}
        {activeTab === 'parte' && (
          <ParteJarabeForm
            responsables={responsables}
            sabores={sabores}
            tanquesCatalog={tanquesCatalog}
            today={today}
            parteForm={parteForm}
            setParteForm={setParteForm}
            parsingExcel={parsingExcel}
            handleExcelUpload={handleExcelUpload}
            handleParteSubmit={handleParteSubmit}
          />
        )}
      </main>

      {/* Sidebar: Producción Activa (Jarabe) */}
      {activeTab === 'terminado' && (
        <aside className="sidebar-card lab-context">
          <div className="sidebar-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <PackageCheck size={20} color="var(--color-azul-clinico)" />
              <span>Jarabe Terminado Activo</span>
            </div>
          </div>

          <div className="sidebar-data-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <>
                <FormField className="field-container" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fecha <span className="required-star">*</span></label>
                  <input
                    type="date"
                    required
                    form="terminado-form"
                    value={terminadoForm.fecha}
                    onChange={(e) => setTerminadoForm({ ...terminadoForm, fecha: e.target.value })}
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.9rem', width: '100%' }}
                  />
                </FormField>

                <FormField className="field-container" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sabor / Marca <span className="required-star">*</span></label>
                  <select
                    required
                    form="terminado-form"
                    value={terminadoForm.sabor}
                    onChange={(e) => {
                      const newSabor = e.target.value;
                      const validConc = getConcentradosForSabor(newSabor);
                      const nextConc = validConc && validConc.length > 0
                        ? (validConc.includes(terminadoForm.concentrado) ? terminadoForm.concentrado : validConc[0])
                        : '';
                      setTerminadoForm({ ...terminadoForm, sabor: newSabor, concentrado: nextConc });
                    }}
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.9rem', width: '100%' }}
                  >
                    <option value="" disabled>Seleccione sabor...</option>
                    {sabores.map((s) => (
                      <option key={s.id} value={s.nombre}>{s.nombre}</option>
                    ))}
                  </select>
                </FormField>

                <FormField className="field-container" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tipo de Concentrado <span className="required-star">*</span></label>
                  <select
                    required
                    form="terminado-form"
                    value={terminadoForm.concentrado}
                    disabled={!terminadoForm.sabor}
                    onChange={(e) => setTerminadoForm({ ...terminadoForm, concentrado: e.target.value })}
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.9rem', width: '100%' }}
                  >
                    <option value="" disabled>Seleccione...</option>
                    {terminadoForm.sabor && getConcentradosForSabor(terminadoForm.sabor).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </FormField>

                <FormField className="field-container" style={{ marginBottom: 0 }}>
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
                </FormField>
              </>
          </div>
        </aside>
      )}
    </div>
  );
}
