import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, RefreshCw, Info, Calendar, Layers, Gauge, Droplet, Sparkles, BookOpen } from 'lucide-react';
import { useProduction } from '../../../context/ProductionContext';
import { PRODUCT_STANDARDS } from '../../../data/productStandards';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { getControlesBebida, getControlesJarabe, getControlesTorque, loadAllPages } from '../api/dashboardApi';
import ControlChart from '../componentes/ControlChart';

export default function DashboardPage() {
  const { production } = useProduction();

  // Estados de datos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bebidaData, setBebidaData] = useState([]);
  const [jarabeData, setJarabeData] = useState([]);
  const [torqueData, setTorqueData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showStandardsModal, setShowStandardsModal] = useState(false);

  // 4 Filtros Solicitados: Línea, Mes, Fecha, Producto
  const [selectedLinea, setSelectedLinea] = useState(production.linea || 'linea1'); // 'linea1' | 'linea2'
  const [selectedMes, setSelectedMes] = useState(new Date().toLocaleDateString('sv-SE').slice(0, 7)); // 'todos' | 'YYYY-MM'
  const [selectedFecha, setSelectedFecha] = useState('todas'); // 'todas' | 'YYYY-MM-DD'
  const [selectedSabor, setSelectedSabor] = useState('COLA Red. XQ - KG');

  // Cargar datos de la API
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [bebidaRes, jarabeRes, torqueRes] = await Promise.allSettled([
        loadAllPages(getControlesBebida),
        loadAllPages(getControlesJarabe),
        loadAllPages(getControlesTorque),
      ]);

      if (bebidaRes.status === 'fulfilled') setBebidaData(bebidaRes.value || []);
      if (jarabeRes.status === 'fulfilled') setJarabeData(jarabeRes.value || []);
      if (torqueRes.status === 'fulfilled') setTorqueData(torqueRes.value || []);

      const failedSources = [
        bebidaRes.status === 'rejected' ? 'bebida terminada' : null,
        jarabeRes.status === 'rejected' ? 'jarabe' : null,
        torqueRes.status === 'rejected' ? 'torque' : null,
      ].filter(Boolean);
      if (failedSources.length) {
        setError(`No se pudieron actualizar: ${failedSources.join(', ')}. El resto de los datos sigue disponible.`);
      }

      if (failedSources.length === 0) setLastUpdated(new Date());
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

  const { availableMonths, availableDates, availableProducts, formatMonthName, formatDateName, currentStandard, isSodaOrSifon, torqueLimits, brixChartData, taChartData, carbonatacionChartData, torqueChartData, latestBrix, latestTa, latestCarb, avgTorque } = useDashboardMetrics({
    bebidaData, jarabeData, torqueData, selectedLinea, selectedMes, selectedFecha, selectedSabor, setSelectedMes, setSelectedSabor,
  });

  return (
    <div className="dashboard-page" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header del Dashboard */}
      <div className="dashboard-header-bar card">
        <div className="dashboard-header-left">
          <div className="dashboard-title-group">
            <div className="dashboard-icon-badge">
              <BarChart3 size={24} color="var(--color-rojo)" />
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

      <div aria-live="polite" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        {error ? <div className="alert alert-error" role="alert">{error}</div> : <span />}
        <small style={{ color: 'var(--color-gris-700)' }}>
          Última actualización completa: {lastUpdated ? lastUpdated.toLocaleString('es-AR') : 'Pendiente'}
        </small>
      </div>

      {/* Barra de Filtros Principales (Línea, Mes, Fecha, Producto) */}
      {jarabeData.some((record) => record.linea !== 1 && record.linea !== 2) && (
        <p className="sidebar-hint">
          Hay controles de jarabe antiguos sin línea identificada. Se conservan en el historial y se excluyen de los indicadores por línea.
        </p>
      )}
      <div className="dashboard-filters-card card">
        <div className="filters-grid">

          {/* 1. Filtro de Línea */}
          <div className="filter-group">
            <label>
              <Gauge size={14} color="var(--color-azul-clinico)" />
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
              <Sparkles size={14} color="var(--color-alerta, #D69E2E)" />
              4. Producto / Sabor {selectedFecha !== 'todas' && <span style={{ color: 'var(--color-azul-clinico, #0077B6)', fontSize: '0.72rem' }}>(del día)</span>}
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
          <Info size={22} color="var(--color-azul-clinico)" />
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
            <span className="kpi-icon-wrap" style={{ background: 'rgba(30, 78, 140, 0.12)', color: 'var(--color-azul-institucional, #1E4E8C)' }}>
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
            <span className="kpi-icon-wrap" style={{ background: 'rgba(47, 133, 90, 0.12)', color: 'var(--color-exito, #2F855A)' }}>
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
            <span className="kpi-icon-wrap" style={{ background: 'rgba(0, 119, 182, 0.12)', color: 'var(--color-azul-clinico, #0077B6)' }}>
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
            <span className="kpi-icon-wrap" style={{ background: 'rgba(214, 158, 46, 0.12)', color: 'var(--color-alerta, #D69E2E)' }}>
              <Gauge size={18} />
            </span>
            <span className="kpi-title">
              Torque ({selectedLinea === 'linea1' ? 'Long finish' : 'Short finish'})
            </span>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">{avgTorque ?? '--'}</span>
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
            title="°Brix 20° Bebida"
            data={brixChartData}
            staticLimits={currentStandard?.brix}
            yAxisLabel="VALOR | LIMITE_MIN | LIMITE_MAX | OBJETIVO"
            xAxisLabel="FECHA_HORA"
            unit="°Bx"
            notApplicable={isSodaOrSifon}
            notApplicableMessage={`El producto ${selectedSabor} no utiliza Jarabe ni tiene especificación de Brix.`}
            valorSecundarioLabel="Patrón Jarabe"
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
                <BookOpen size={20} color="var(--color-rojo)" />
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
