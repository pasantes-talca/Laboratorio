import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart3,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  Gauge,
  Droplet,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useProduction } from '../context/ProductionContext';
import { getControlesBebida, getControlesJarabe, getControlesTorque } from '../services/api';
import { PRODUCT_STANDARDS, findProductStandard } from '../data/productStandards';
import ControlChart from '../components/ControlChart';

export default function DashboardPage() {
  const { production } = useProduction();

  // Estados de datos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bebidaData, setBebidaData] = useState([]);
  const [jarabeData, setJarabeData] = useState([]);
  const [torqueData, setTorqueData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showStandardsModal, setShowStandardsModal] = useState(false);

  // 4 Filtros Solicitados: Línea, Mes, Fecha, Producto
  const [selectedLinea, setSelectedLinea] = useState(production.linea || 'linea1'); // 'linea1' | 'linea2'
  const [selectedMes, setSelectedMes] = useState('2026-02'); // 'todos' | 'YYYY-MM'
  const [selectedFecha, setSelectedFecha] = useState('todas'); // 'todas' | 'YYYY-MM-DD'
  const [selectedSabor, setSelectedSabor] = useState('COLA Red. XQ - KG');

  // Cargar datos de la API
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [bebidaRes, jarabeRes, torqueRes] = await Promise.allSettled([
        getControlesBebida(),
        getControlesJarabe(),
        getControlesTorque(),
      ]);

      if (bebidaRes.status === 'fulfilled') setBebidaData(bebidaRes.value || []);
      if (jarabeRes.status === 'fulfilled') setJarabeData(jarabeRes.value || []);
      if (torqueRes.status === 'fulfilled') setTorqueData(torqueRes.value || []);

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
      setError('No se pudieron cargar algunos datos de control. Mostrando información disponible.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Extraer lista única de Meses disponibles a partir de los datos
  const availableMonths = useMemo(() => {
    const monthsSet = new Set();
    const addDate = (dateStr) => {
      if (dateStr && dateStr.length >= 7) {
        monthsSet.add(dateStr.slice(0, 7)); // 'YYYY-MM'
      }
    };

    bebidaData.forEach((d) => addDate(d.fecha));
    jarabeData.forEach((d) => addDate(d.fecha));
    torqueData.forEach((d) => addDate(d.fecha));

    const sorted = Array.from(monthsSet).sort().reverse();
    return sorted.length > 0 ? sorted : ['2026-02', '2026-08'];
  }, [bebidaData, jarabeData, torqueData]);

  // Si el mes seleccionado no existe en los disponibles, fijar el más reciente
  useEffect(() => {
    if (availableMonths.length > 0 && selectedMes !== 'todos' && !availableMonths.includes(selectedMes)) {
      setSelectedMes(availableMonths[0]);
    }
  }, [availableMonths, selectedMes]);

  // Extraer lista única de Fechas disponibles según el Mes seleccionado
  const availableDates = useMemo(() => {
    const datesSet = new Set();
    const addDate = (dateStr) => {
      if (!dateStr) return;
      if (selectedMes === 'todos' || dateStr.startsWith(selectedMes)) {
        datesSet.add(dateStr); // 'YYYY-MM-DD'
      }
    };

    bebidaData.forEach((d) => addDate(d.fecha));
    jarabeData.forEach((d) => addDate(d.fecha));
    torqueData.forEach((d) => addDate(d.fecha));

    return Array.from(datesSet).sort();
  }, [bebidaData, jarabeData, torqueData, selectedMes]);

  // Formateador amigable de nombres de mes
  const formatMonthName = (monthStr) => {
    if (!monthStr || monthStr === 'todos') return 'Todos los Meses';
    const [y, m] = monthStr.split('-');
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const mIndex = parseInt(m, 10) - 1;
    return `${monthNames[mIndex] || m} ${y}`;
  };

  // Formateador amigable de fechas
  const formatDateName = (dateStr) => {
    if (!dateStr || dateStr === 'todas') return 'Todo el Mes / Todas';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Extraer lista de Productos disponibles para la Fecha, Mes y Línea seleccionados
  const availableProducts = useMemo(() => {
    const lineaNum = selectedLinea === 'linea1' ? 1 : 2;
    const rawNames = new Set();

    const checkItem = (d, checkLinea = true) => {
      if (!d) return;
      if (checkLinea && d.linea && d.linea !== lineaNum) return;
      if (selectedFecha !== 'todas') {
        if (d.fecha !== selectedFecha) return;
      } else if (selectedMes !== 'todos') {
        if (!d.fecha || !d.fecha.startsWith(selectedMes)) return;
      }
      const name = d.marca || d.sabor;
      if (name && strValid(name)) {
        rawNames.add(name.trim());
      }
    };

    function strValid(s) {
      const lower = String(s).toLowerCase();
      return lower !== '' && !lower.includes('parada') && !lower.includes('pausa') && lower !== 'null' && lower !== 'undefined';
    }

    bebidaData.forEach((d) => checkItem(d, true));
    torqueData.forEach((d) => checkItem(d, true));
    jarabeData.forEach((d) => checkItem(d, false));

    if (rawNames.size === 0) {
      // Si no hay mediciones específicas en ese día, mostrar los estándares oficiales
      return PRODUCT_STANDARDS;
    }

    // Mapear los nombres crudos a los estándares oficiales correspondientes
    const matchedStandards = new Map();
    rawNames.forEach((raw) => {
      const std = findProductStandard(raw);
      if (std) {
        matchedStandards.set(std.id, std);
      }
    });

    return matchedStandards.size > 0 ? Array.from(matchedStandards.values()) : PRODUCT_STANDARDS;
  }, [bebidaData, jarabeData, torqueData, selectedLinea, selectedMes, selectedFecha]);

  // Si el sabor actual no está entre los productos disponibles del día, autoseleccionar el primero
  useEffect(() => {
    if (availableProducts.length > 0) {
      const isCurrentAvailable = availableProducts.some(
        (p) => p.sabor.toLowerCase() === (selectedSabor || '').toLowerCase()
      );
      if (!isCurrentAvailable) {
        setSelectedSabor(availableProducts[0].sabor);
      }
    }
  }, [availableProducts, selectedSabor]);

  // Obtener estándar del producto seleccionado
  const currentStandard = useMemo(() => {
    return findProductStandard(selectedSabor);
  }, [selectedSabor]);

  const isSodaOrSifon = useMemo(() => {
    const s = (selectedSabor || '').toLowerCase();
    return s.includes('soda') || s.includes('sifon');
  }, [selectedSabor]);

  // Límites de torque según línea seleccionada
  const torqueLimits = useMemo(() => {
    if (!currentStandard) return null;
    if (selectedLinea === 'linea1') {
      return currentStandard.torqueLong || { min: 15, max: 20, objetivo: 17.5 };
    }
    return currentStandard.torqueShort || { min: 13, max: 17, objetivo: 15.0 };
  }, [currentStandard, selectedLinea]);

  // Helper para comparar sabor / producto
  const matchesSabor = useCallback((itemSaborOrMarca) => {
    if (!itemSaborOrMarca || !selectedSabor) return true;
    const sItem = itemSaborOrMarca.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const sTarget = selectedSabor.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (sTarget.includes('sifon')) return sItem.includes('sifon');
    if (sTarget.includes('soda')) return sItem.includes('soda');
    if (sTarget.includes('tonica')) return sItem.includes('tonica');
    if (sTarget.includes('manzana')) return sItem.includes('manzana');
    if (sTarget.includes('cola')) return sItem.includes('cola');
    if (sTarget.includes('naranja')) return sItem.includes('naranja');
    if (sTarget.includes('lima') || sTarget.includes('limon')) return sItem.includes('lima') || sItem.includes('limon');
    if (sTarget.includes('pomelo')) return sItem.includes('pomelo');

    return sItem.includes(sTarget) || sTarget.includes(sItem);
  }, [selectedSabor]);

  // Helper de filtrado por Mes y Fecha
  const matchesDateFilter = useCallback((itemDateStr) => {
    if (!itemDateStr) return true;
    if (selectedFecha !== 'todas') {
      return itemDateStr === selectedFecha;
    }
    if (selectedMes !== 'todos') {
      return itemDateStr.startsWith(selectedMes);
    }
    return true;
  }, [selectedMes, selectedFecha]);

  // Helper para formatear etiqueta de fecha/hora en los gráficos
  const formatDateTimeLabel = (dateStr, timeStr) => {
    const time = timeStr ? timeStr.slice(0, 5) : '';
    if (selectedFecha !== 'todas') {
      // Si ya filtramos por un día específico, mostrar la hora en el eje X
      return time || dateStr || '';
    }
    if (!dateStr) return time;
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const day = parts[2];
        const monthNum = parseInt(parts[1], 10);
        const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        const month = months[monthNum - 1] || parts[1];
        return `${day} ${month} ${time}`.trim();
      }
    } catch (_) {}
    return `${dateStr} ${time}`.trim();
  };

  // 1. Datos para gráfico de °BRIX (desde Jarabe)
  const brixChartData = useMemo(() => {
    if (isSodaOrSifon || !currentStandard?.brix) return [];

    let filtered = jarabeData.filter((item) => {
      if (item.bx_patron === null || item.bx_patron === undefined) return false;
      if (!matchesDateFilter(item.fecha)) return false;
      if (!matchesSabor(item.sabor)) return false;
      return true;
    });

    // Orden cronológico
    filtered = [...filtered].reverse();

    if (filtered.length === 0) {
      return [
        { label: 'Ref', valor: currentStandard.brix.objetivo, limiteMin: currentStandard.brix.min, limiteMax: currentStandard.brix.max, objetivo: currentStandard.brix.objetivo },
      ];
    }

    return filtered.map((item) => ({
      label: formatDateTimeLabel(item.fecha, item.hora),
      fullTime: `${item.fecha || ''} ${item.hora || ''}`.trim(),
      valor: item.bx_patron,
      limiteMin: currentStandard.brix.min,
      limiteMax: currentStandard.brix.max,
      objetivo: currentStandard.brix.objetivo,
      meta: { responsable: item.responsable, tanque: item.tanque },
    }));
  }, [jarabeData, currentStandard, isSodaOrSifon, matchesDateFilter, matchesSabor, selectedFecha]);

  // 2. Datos para gráfico de TA (desde Jarabe)
  const taChartData = useMemo(() => {
    if (isSodaOrSifon || !currentStandard?.ta) return [];

    let filtered = jarabeData.filter((item) => {
      if (item.ta === null || item.ta === undefined) return false;
      if (!matchesDateFilter(item.fecha)) return false;
      if (!matchesSabor(item.sabor)) return false;
      return true;
    });

    filtered = [...filtered].reverse();

    if (filtered.length === 0) {
      return [
        { label: 'Ref', valor: currentStandard.ta.objetivo, limiteMin: currentStandard.ta.min, limiteMax: currentStandard.ta.max, objetivo: currentStandard.ta.objetivo },
      ];
    }

    return filtered.map((item) => ({
      label: formatDateTimeLabel(item.fecha, item.hora),
      fullTime: `${item.fecha || ''} ${item.hora || ''}`.trim(),
      valor: item.ta,
      limiteMin: currentStandard.ta.min,
      limiteMax: currentStandard.ta.max,
      objetivo: currentStandard.ta.objetivo,
      meta: { responsable: item.responsable, tanque: item.tanque },
    }));
  }, [jarabeData, currentStandard, isSodaOrSifon, matchesDateFilter, matchesSabor, selectedFecha]);

  // 3. Datos para gráfico de Carbonatación / Vol. Gas (desde Control Bebida)
  const carbonatacionChartData = useMemo(() => {
    if (!currentStandard?.carbonatacion) return [];

    const lineaNum = selectedLinea === 'linea1' ? 1 : 2;

    let filtered = bebidaData.filter((item) => {
      if (item.vol_gas === null || item.vol_gas === undefined) return false;
      if (item.linea && item.linea !== lineaNum) return false;
      if (!matchesDateFilter(item.fecha)) return false;
      if (!matchesSabor(item.marca)) return false;
      return true;
    });

    filtered = [...filtered].reverse();

    if (filtered.length === 0) {
      return [
        { label: 'Ref', valor: currentStandard.carbonatacion.objetivo, limiteMin: currentStandard.carbonatacion.min, limiteMax: currentStandard.carbonatacion.max, objetivo: currentStandard.carbonatacion.objetivo },
      ];
    }

    return filtered.map((item) => ({
      label: formatDateTimeLabel(item.fecha, item.hora),
      fullTime: `${item.fecha || ''} ${item.hora || ''}`.trim(),
      valor: item.vol_gas,
      limiteMin: currentStandard.carbonatacion.min,
      limiteMax: currentStandard.carbonatacion.max,
      objetivo: currentStandard.carbonatacion.objetivo,
      meta: { responsable: item.responsable, tamano: item.tamano },
    }));
  }, [bebidaData, currentStandard, selectedLinea, matchesDateFilter, matchesSabor, selectedFecha]);

  // 4. Datos para gráfico de Torques por Cabezal (Eje X: CAB 1 a 12/14)
  const torqueChartData = useMemo(() => {
    if (!torqueLimits) return [];

    const totalCabezales = selectedLinea === 'linea1' ? 12 : 14;
    const lineaNum = selectedLinea === 'linea1' ? 1 : 2;

    const filtered = torqueData.filter((item) => {
      if (item.linea && item.linea !== lineaNum) return false;
      if (!matchesDateFilter(item.fecha)) return false;
      if (item.sabor && !matchesSabor(item.sabor)) return false;
      return true;
    });

    const cabPoints = [];
    for (let c = 1; c <= totalCabezales; c++) {
      const match = filtered.find((item) => Number(item.numero_cabezal) === c);
      cabPoints.push({
        label: `${c}`,
        fullTime: match ? `${match.fecha || ''} ${match.hora || ''}` : `Cabezal ${c}`,
        valor: match ? match.valor : null,
        limiteMin: torqueLimits.min,
        limiteMax: torqueLimits.max,
        objetivo: torqueLimits.objetivo,
        meta: match ? { responsable: match.responsable, color: match.color } : {},
      });
    }

    return cabPoints;
  }, [torqueData, torqueLimits, selectedLinea, matchesDateFilter, matchesSabor]);

  // Resumen de estado para KPI cards
  const latestBrix = brixChartData.filter(d => d.valor !== null).slice(-1)[0]?.valor;
  const latestTa = taChartData.filter(d => d.valor !== null).slice(-1)[0]?.valor;
  const latestCarb = carbonatacionChartData.filter(d => d.valor !== null).slice(-1)[0]?.valor;
  const torqueValues = torqueChartData.map(d => d.valor).filter(v => v !== null);
  const avgTorque = torqueValues.length ? (torqueValues.reduce((a, b) => a + b, 0) / torqueValues.length).toFixed(1) : null;

  return (
    <div className="dashboard-page" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header del Dashboard */}
      <div className="dashboard-header-bar card">
        <div className="dashboard-header-left">
          <div className="dashboard-title-group">
            <div className="dashboard-icon-badge">
              <BarChart3 size={24} color="#00f2fe" />
            </div>
            <div>
              <h2>Dashboard de Control Estadístico de Procesos</h2>
              <p className="dashboard-subtitle">
                Monitoreo en tiempo real de variables críticas de calidad según especificación BPM
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-header-right">
          {/* Selector de Línea Principal */}
          <div className="linea-toggle-group">
            <button
              type="button"
              className={`btn-linea-toggle ${selectedLinea === 'linea1' ? 'active-linea1' : ''}`}
              onClick={() => setSelectedLinea('linea1')}
            >
              <span className="dot-indicator" />
              Línea 1 (Long finish · 12 Cab)
            </button>
            <button
              type="button"
              className={`btn-linea-toggle ${selectedLinea === 'linea2' ? 'active-linea2' : ''}`}
              onClick={() => setSelectedLinea('linea2')}
            >
              <span className="dot-indicator" />
              Línea 2 (Short finish · 14 Cab)
            </button>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowStandardsModal(true)}
            title="Ver tabla oficial de tolerancias"
          >
            <BookOpen size={16} />
            Estándares BPM
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={loadDashboardData}
            disabled={loading}
            title="Actualizar datos"
          >
            <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Barra de Filtros Principales (Línea, Mes, Fecha, Producto) */}
      <div className="dashboard-filters-card card">
        <div className="filters-grid">
          
          {/* 1. Filtro de Línea */}
          <div className="filter-group">
            <label>
              <Gauge size={14} color="#00f2fe" />
              1. Línea de Producción
            </label>
            <select
              value={selectedLinea}
              onChange={(e) => setSelectedLinea(e.target.value)}
              className="dashboard-select"
            >
              <option value="linea1">Línea 1 (Long finish · 12 Cab)</option>
              <option value="linea2">Línea 2 (Short finish · 14 Cab)</option>
            </select>
          </div>

          {/* 2. Filtro de Mes */}
          <div className="filter-group">
            <label>
              <Calendar size={14} color="#38bdf8" />
              2. Mes
            </label>
            <select
              value={selectedMes}
              onChange={(e) => {
                setSelectedMes(e.target.value);
                setSelectedFecha('todas'); // reset fecha al cambiar mes
              }}
              className="dashboard-select"
            >
              <option value="todos">Todos los meses</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthName(m)}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Filtro de Fecha específica */}
          <div className="filter-group">
            <label>
              <Calendar size={14} color="#a855f7" />
              3. Fecha
            </label>
            <select
              value={selectedFecha}
              onChange={(e) => setSelectedFecha(e.target.value)}
              className="dashboard-select"
            >
              <option value="todas">Todo el mes seleccionado</option>
              {availableDates.map((d) => (
                <option key={d} value={d}>
                  {formatDateName(d)}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Filtro de Producto / Sabor (Filtrado según lo elaborado en la fecha) */}
          <div className="filter-group">
            <label>
              <Sparkles size={14} color="#fbbf24" />
              4. Producto / Sabor {selectedFecha !== 'todas' && <span style={{ color: '#00f2fe', fontSize: '0.72rem' }}>(del día)</span>}
            </label>
            <select
              value={selectedSabor}
              onChange={(e) => setSelectedSabor(e.target.value)}
              className="dashboard-select"
            >
              {availableProducts.map((p) => (
                <option key={p.id} value={p.sabor}>
                  {p.sabor} {p.grupo ? `(${p.grupo})` : ''}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Banner Informativo especial si es Soda o Sifón */}
      {isSodaOrSifon && (
        <div className="soda-sifon-notice card">
          <Info size={22} color="#00f2fe" />
          <div>
            <strong>Aviso de Especificación ({currentStandard?.sabor}):</strong>
            <span>
              Este producto no contiene Jarabe ni azúcar añadida. Los gráficos de °Brix y TA se omiten de acuerdo a la fórmula oficial. Se auditan estrictamente <strong>Carbonatación ({currentStandard?.carbonatacion?.objetivo} Vol. CO2)</strong> y <strong>Torque ({currentStandard?.torqueLong?.rango || '15-20'} Lbs.In)</strong>.
            </span>
          </div>
        </div>
      )}

      {/* Tarjetas KPI de Estado Rápido */}
      <div className="kpi-summary-grid">
        {/* Card Brix */}
        <div className={`kpi-card card ${isSodaOrSifon ? 'kpi-card-disabled' : ''}`}>
          <div className="kpi-card-header">
            <span className="kpi-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <Droplet size={18} />
            </span>
            <span className="kpi-title">°Brix 20° Bebida</span>
          </div>
          <div className="kpi-value-row">
            {isSodaOrSifon ? (
              <span className="kpi-value-na">N/A</span>
            ) : (
              <>
                <span className="kpi-value">{latestBrix !== undefined ? Number(latestBrix).toFixed(2) : '--'}</span>
                <span className="kpi-unit">°Bx</span>
              </>
            )}
          </div>
          <div className="kpi-target-info">
            {isSodaOrSifon ? (
              'Sin jarabe formulado'
            ) : (
              <>
                <span>Obj: <strong>{currentStandard?.brix?.objetivo ?? '--'}</strong></span>
                <span>Rango: {currentStandard?.brix ? `${currentStandard.brix.min} - ${currentStandard.brix.max}` : '--'}</span>
              </>
            )}
          </div>
        </div>

        {/* Card TA */}
        <div className={`kpi-card card ${isSodaOrSifon ? 'kpi-card-disabled' : ''}`}>
          <div className="kpi-card-header">
            <span className="kpi-icon-wrap" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399' }}>
              <Layers size={18} />
            </span>
            <span className="kpi-title">TA Gasto NaOH</span>
          </div>
          <div className="kpi-value-row">
            {isSodaOrSifon ? (
              <span className="kpi-value-na">N/A</span>
            ) : (
              <>
                <span className="kpi-value">{latestTa !== undefined ? Number(latestTa).toFixed(1) : '--'}</span>
                <span className="kpi-unit">ml</span>
              </>
            )}
          </div>
          <div className="kpi-target-info">
            {isSodaOrSifon ? (
              'Sin acidez formulada'
            ) : (
              <>
                <span>Obj: <strong>{currentStandard?.ta?.objetivo ?? '--'}</strong></span>
                <span>Rango: {currentStandard?.ta ? `${currentStandard.ta.min} - ${currentStandard.ta.max}` : '--'}</span>
              </>
            )}
          </div>
        </div>

        {/* Card Carbonatación */}
        <div className="kpi-card card">
          <div className="kpi-card-header">
            <span className="kpi-icon-wrap" style={{ background: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe' }}>
              <Sparkles size={18} />
            </span>
            <span className="kpi-title">Carbonatación CO2</span>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">{latestCarb !== undefined ? Number(latestCarb).toFixed(2) : '--'}</span>
            <span className="kpi-unit">Vol</span>
          </div>
          <div className="kpi-target-info">
            <span>Obj: <strong>{currentStandard?.carbonatacion?.objetivo ?? '--'}</strong></span>
            <span>Rango: {currentStandard?.carbonatacion ? `${currentStandard.carbonatacion.min} - ${currentStandard.carbonatacion.max}` : '--'}</span>
          </div>
        </div>

        {/* Card Torque */}
        <div className="kpi-card card">
          <div className="kpi-card-header">
            <span className="kpi-icon-wrap" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>
              <Gauge size={18} />
            </span>
            <span className="kpi-title">
              Torque ({selectedLinea === 'linea1' ? 'Long finish' : 'Short finish'})
            </span>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">{avgTorque || '--'}</span>
            <span className="kpi-unit">Lbs.In</span>
          </div>
          <div className="kpi-target-info">
            <span>Obj: <strong>{torqueLimits?.objetivo ?? '--'}</strong></span>
            <span>Rango: {torqueLimits ? `${torqueLimits.min} - ${torqueLimits.max}` : '--'}</span>
          </div>
        </div>
      </div>

      {/* Grilla Principal de los 4 Gráficos */}
      <div className="dashboard-charts-grid">
        {/* Gráfico 1: Brix */}
        <div className="chart-card card">
          <ControlChart
            type="time"
            title="°Brix 20° Bebida (Control de Jarabe)"
            data={brixChartData}
            staticLimits={currentStandard?.brix}
            yAxisLabel="VALOR | LIMITE_MIN | LIMITE_MAX | OBJETIVO"
            xAxisLabel="FECHA_HORA"
            unit="°Bx"
            notApplicable={isSodaOrSifon}
            notApplicableMessage={`El producto ${selectedSabor} no utiliza Jarabe ni tiene especificación de Brix.`}
          />
        </div>

        {/* Gráfico 2: TA */}
        <div className="chart-card card">
          <ControlChart
            type="time"
            title="Acidez Titulable - TA Gasto NaOH (Control de Jarabe)"
            data={taChartData}
            staticLimits={currentStandard?.ta}
            yAxisLabel="VALOR | LIMITE_MIN | LIMITE_MAX | OBJETIVO"
            xAxisLabel="FECHA_HORA"
            unit="ml"
            notApplicable={isSodaOrSifon}
            notApplicableMessage={`El producto ${selectedSabor} no contiene acidez formulada en jarabe.`}
          />
        </div>

        {/* Gráfico 3: Carbonatación */}
        <div className="chart-card card">
          <ControlChart
            type="time"
            title="Carbonatación Vol. CO2 (Control de Bebida Terminada)"
            data={carbonatacionChartData}
            staticLimits={currentStandard?.carbonatacion}
            yAxisLabel="VALOR | LIMITE_MIN | LIMITE_MAX | OBJETIVO"
            xAxisLabel="FECHA_HORA"
            unit="Vol"
          />
        </div>

        {/* Gráfico 4: Torque por Cabezales */}
        <div className="chart-card card">
          <ControlChart
            type="cab"
            title={`Control de Torque por Cabezal (${selectedLinea === 'linea1' ? 'Línea 1 · Long finish' : 'Línea 2 · Short finish'})`}
            data={torqueChartData}
            staticLimits={torqueLimits}
            yAxisLabel="OBJETIVO | VALOR | LIMITE_MIN | LIMITE_MAX"
            xAxisLabel="CAB"
            unit="Lbs.In"
          />
        </div>
      </div>

      {/* Modal / Panel de Estándares de Productos (BPM) */}
      {showStandardsModal && (
        <div className="modal-backdrop" onClick={() => setShowStandardsModal(false)}>
          <div
            className="modal-card modal-standards-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '900px', width: '95%' }}
          >
            <div className="modal-header">
              <h3>
                <BookOpen size={20} color="#00f2fe" />
                ESTÁNDAR DE PRODUCTOS - FÓRMULA NUEVA (BPM)
              </h3>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setShowStandardsModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="standards-table-wrapper" style={{ overflowX: 'auto', marginTop: '1rem' }}>
              <table className="standards-official-table">
                <thead>
                  <tr>
                    <th rowSpan={2}>Marca</th>
                    <th rowSpan={2}>Sabor</th>
                    <th rowSpan={2}>°Brix 20° Bebida</th>
                    <th rowSpan={2}>TA Gasto de NaOH</th>
                    <th rowSpan={2}>Carbonatación Vol. CO2</th>
                    <th colSpan={2}>Torque (Lbs.In)</th>
                    <th rowSpan={2}>Vencimiento</th>
                  </tr>
                  <tr>
                    <th>Long finish (L1)</th>
                    <th>Short finish (L2)</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Sifón y Soda */}
                  <tr>
                    <td rowSpan={2} className="marca-col">TALCA</td>
                    <td><strong>SIFÓN</strong></td>
                    <td className="text-muted">-</td>
                    <td className="text-muted">-</td>
                    <td><strong>5,2</strong> ± 0,5</td>
                    <td><strong>110 - 120</strong></td>
                    <td className="text-muted">-</td>
                    <td>6 Meses</td>
                  </tr>
                  <tr>
                    <td><strong>SODA</strong></td>
                    <td className="text-muted">-</td>
                    <td className="text-muted">-</td>
                    <td><strong>4,2</strong> ± 0,5</td>
                    <td><strong>15 - 20</strong></td>
                    <td className="text-muted">-</td>
                    <td>6 Meses</td>
                  </tr>

                  {/* Header Grupo Givaudan */}
                  <tr className="group-header-row">
                    <td colSpan={8}>GIVAUDAN</td>
                  </tr>
                  {PRODUCT_STANDARDS.filter(p => p.grupo === 'GIVAUDAN').map(p => (
                    <tr key={p.id}>
                      <td className="marca-col">TALCA</td>
                      <td><strong>{p.sabor}</strong></td>
                      <td><strong>{p.brix.objetivo.toFixed(2)}</strong> (+0,5/ -0,2)</td>
                      <td><strong>{p.ta.objetivo}</strong> ± 1</td>
                      <td><strong>{p.carbonatacion.objetivo.toFixed(1)}</strong> (+0,5/ -0,2)</td>
                      <td>15 - 20</td>
                      <td>15 ± 2</td>
                      <td>{p.vencimiento}</td>
                    </tr>
                  ))}

                  {/* Header Grupo IFF */}
                  <tr className="group-header-row">
                    <td colSpan={8}>IFF</td>
                  </tr>
                  {PRODUCT_STANDARDS.filter(p => p.grupo === 'IFF').map(p => (
                    <tr key={p.id}>
                      <td className="marca-col">TALCA</td>
                      <td><strong>{p.sabor}</strong></td>
                      <td><strong>{p.brix.objetivo.toFixed(2)}</strong> (+0,5/ -0,2)</td>
                      <td><strong>{p.ta.objetivo}</strong> ± 1</td>
                      <td><strong>{p.carbonatacion.objetivo.toFixed(1)}</strong> (+0,5/ -0,2)</td>
                      <td>15 - 20</td>
                      <td>15 ± 2</td>
                      <td>{p.vencimiento}</td>
                    </tr>
                  ))}

                  {/* Otras */}
                  <tr className="group-header-row">
                    <td colSpan={8}>OTRAS</td>
                  </tr>
                  {PRODUCT_STANDARDS.filter(p => p.grupo === 'OTRAS').map(p => (
                    <tr key={p.id}>
                      <td className="marca-col">TALCA</td>
                      <td><strong>{p.sabor}</strong></td>
                      <td><strong>{p.brix.objetivo.toFixed(2)}</strong> (+0,5/ -0,2)</td>
                      <td><strong>{p.ta.objetivo}</strong> ± 1</td>
                      <td><strong>{p.carbonatacion.objetivo.toFixed(1)}</strong> (+0,5/ -0,2)</td>
                      <td>15 - 20</td>
                      <td>15 ± 2</td>
                      <td>{p.vencimiento}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowStandardsModal(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
