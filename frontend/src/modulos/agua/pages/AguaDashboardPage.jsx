import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Droplets, RefreshCw } from 'lucide-react';
import { fetchJson } from '../../../services/api';
import '../styles/agua-dashboard.css';

const FORMS = {
  'fisico-quimico': { title: 'Físico químico', form: 'fisicoQuimico', group: 'Tipo de agua', field: 'tipo_agua' },
  'analisis-cloro': { title: 'Análisis de cloro', form: 'analisisCloro', group: 'Línea del rinser', field: 'cloro_riser_linea' },
  'osmosis-inversa': { title: 'Ósmosis inversa', form: 'osmosisInversa', group: 'Punto de presión', field: 'p_select' },
  'filtro-arena': { title: 'Filtro de arena', form: 'filtroArena' },
};
const COLORS = ['#0788bd', '#8b5fc8', '#db9030', '#228a69', '#d55a79'];
const format = value => value == null ? 'Sin dato' : Number(value).toLocaleString('es-AR', { maximumFractionDigits: 3 });
const date = value => value ? new Date(`${value}T12:00:00`).toLocaleDateString('es-AR') : '—';
const currentMonth = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date()).slice(0, 7);

function Trend({ rows, metric }) {
  const available = rows.filter(row => row[metric.campo] != null);
  if (!available.length) return <div className="water-empty">No hay mediciones de este parámetro con los filtros seleccionados.</div>;
  const days = [...new Set(rows.map(row => row.fecha))].sort();
  const groups = [...new Set(available.map(row => row.grupo || 'Mediciones'))];
  const values = available.map(row => row[metric.campo]);
  const low = Math.min(...values), high = Math.max(...values);
  const padding = (high - low || Math.abs(high) || 1) * .15;
  const min = low - padding, max = high + padding;
  const x = day => 72 + days.indexOf(day) / Math.max(1, days.length - 1) * 770;
  const y = value => 220 - (value - min) / (max - min) * 185;
  return <>
    <div className="water-legend">{groups.map((group, i) => <span key={group}><i style={{ background: COLORS[i % COLORS.length] }} />{group}</span>)}</div>
    <div className="water-chart-scroll"><svg viewBox="0 0 900 275" role="img" aria-label={`Evolución de ${metric.titulo}. Promedio diario por punto de control.`}>
      {[0, 1, 2, 3, 4].map(step => { const value = min + (max - min) * step / 4; return <g key={step}><line x1="72" x2="855" y1={y(value)} y2={y(value)} stroke="#e7eef4" /><text x="62" y={y(value) + 4} textAnchor="end">{format(value)}</text></g>; })}
      {days.map((day, index) => index % Math.ceil(days.length / 7) === 0 || index === days.length - 1 ? <text key={day} x={x(day)} y="250" textAnchor="middle">{date(day).slice(0, 5)}</text> : null)}
      {groups.map((group, index) => { const points = available.filter(row => (row.grupo || 'Mediciones') === group); const color = COLORS[index % COLORS.length]; return <g key={group}>
        <polyline points={points.map(row => `${x(row.fecha)},${y(row[metric.campo])}`).join(' ')} fill="none" stroke={color} strokeWidth="2.5" />
        {points.map(row => <circle key={row.fecha} cx={x(row.fecha)} cy={y(row[metric.campo])} r="4.5" fill={color} stroke="white" strokeWidth="2"><title>{group} · {date(row.fecha)} · {format(row[metric.campo])} {metric.unidad}</title></circle>)}
      </g>; })}
    </svg></div>
  </>;
}

export default function AguaDashboardPage({ onNavigate }) {
  const [filters, setFilters] = useState(() => ({ mes: currentMonth(), fecha: '', tipo: 'fisico-quimico', grupo: '' }));
  const [offset, setOffset] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [metricKey, setMetricKey] = useState('');
  const [data, setData] = useState(null);
  const [options, setOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updated, setUpdated] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true); setError('');
    const params = new URLSearchParams({ limit: '25', offset: String(offset) });
    Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
    fetchJson(`/agua/dashboard?${params}`, { signal: controller.signal }).then(result => {
      if (active) { setData(result); setOptions(result.opciones); setUpdated(new Date()); }
    }).catch(err => { if (active && err.name !== 'AbortError') setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [filters, offset, refresh]);
  function change(key, value) {
    setOffset(0);
    if (key === 'tipo') setMetricKey('');
    setFilters(previous => ({ ...previous, [key]: value, ...(key === 'mes' ? { fecha: '' } : {}), ...(key === 'tipo' ? { grupo: '' } : {}) }));
  }
  const form = FORMS[filters.tipo];
  const metric = data?.metricas.find(item => item.campo === metricKey) || data?.metricas[0];
  const months = [...new Set([currentMonth(), ...(options.meses || [])])].sort().reverse();
  const ready = data && !loading && !error;
  return <main className="water-dashboard">
    <header className="water-hero"><div><span className="water-eyebrow"><Droplets size={16} /> CONTROL DE AGUA</span><h1>Dashboard de Agua</h1><p>Seguí las mediciones y consultá los controles registrados.</p></div><button type="button" onClick={() => onNavigate?.('agua', form.form)}>Registrar control <ArrowUpRight size={17} /></button></header>
    <section className="water-toolbar" aria-label="Filtros de agua">
      <label>Mes<select value={filters.mes} onChange={event => change('mes', event.target.value)}><option value="">Todos los meses</option>{months.map(value => <option key={value} value={value}>{new Date(`${value}-01T12:00:00`).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</option>)}</select></label>
      <label>Fecha<select value={filters.fecha} onChange={event => change('fecha', event.target.value)}><option value="">Todo el período</option>{(options.fechas || []).filter(value => !filters.mes || value.startsWith(filters.mes)).map(value => <option key={value} value={value}>{date(value)}</option>)}</select></label>
      <div className="water-toolbar-actions"><button type="button" onClick={() => { setOffset(0); setFilters(previous => ({ ...previous, mes: '', fecha: '', grupo: '' })); }}>Ver todo</button><button type="button" disabled={loading} onClick={() => setRefresh(value => value + 1)}><RefreshCw size={15} /> Actualizar</button></div>
    </section>
    {loading && <p className="water-message" role="status">Cargando controles de agua…</p>}
    {error && <div className="water-message water-error" role="alert">No se pudieron cargar los datos: {error} <button type="button" onClick={() => setRefresh(value => value + 1)}>Reintentar</button></div>}
    {ready && <>
      <div className="water-section-caption"><span>Controles por formulario en el período</span><span>Actualizado {updated?.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span></div>
      <div className="water-form-cards" role="group" aria-label="Seleccionar formulario">{Object.entries(FORMS).map(([key, item], index) => <button key={key} type="button" aria-pressed={filters.tipo === key} className={filters.tipo === key ? 'selected' : ''} onClick={() => change('tipo', key)}><span className="water-card-number">0{index + 1}</span><span>{item.title}<strong>{format(data.conteos[key])}</strong><small>controles registrados</small></span></button>)}</div>
      <section className="water-panel"><div className="water-panel-heading"><div><span className="water-eyebrow">EVOLUCIÓN DE MEDICIONES</span><h2>{form.title}</h2><p>Promedios diarios por punto de control. Pasá sobre cada punto para ver el valor.</p></div><div className="water-chart-filters">
        {form.group && <label>{form.group}<select value={filters.grupo} onChange={event => change('grupo', event.target.value)}><option value="">Todos</option>{(options.grupos || []).map(value => <option key={value} value={value}>{value}</option>)}</select></label>}
        <label>Parámetro<select value={metric?.campo || ''} onChange={event => setMetricKey(event.target.value)}>{data.metricas.map(item => <option value={item.campo} key={item.campo}>{item.titulo}{item.unidad ? ` (${item.unidad})` : ''}</option>)}</select></label>
      </div></div>
        {metric && <Trend rows={data.series} metric={metric} />}
        <p className="water-chart-note">{metric?.titulo}{metric?.unidad ? ` · ${metric.unidad}` : ''} · Los valores corresponden a los registros cargados; no se han definido límites de especificación.</p>
      </section>
      <section className="water-panel"><div className="water-panel-heading"><div><h2>Historial de {form.title.toLowerCase()}</h2><p>{data.historial.total} registros con los filtros seleccionados · Fecha de planta</p></div><span className="water-pill">Datos registrados</span></div>
        <div className="water-table-scroll"><table><thead><tr><th>Fecha / hora</th>{form.group && <th>{form.group}</th>}{data.metricas.map(item => <th key={item.campo}>{item.titulo}{item.unidad && <small>{item.unidad}</small>}</th>)}{filters.tipo === 'analisis-cloro' && <><th>Carbón A</th><th>Carbón B</th><th>Carbón C</th></>}{filters.tipo === 'filtro-arena' && <th>Contralavado</th>}<th>Responsable</th></tr></thead><tbody>
          {data.historial.registros.map(row => <tr key={row.id}><td className="water-nowrap">{date(row.fecha_control)}<small>{row.hora?.slice(0, 5) || 'Hora no registrada'}</small></td>{form.group && <td>{row[form.field] || '—'}</td>}{data.metricas.map(item => <td key={item.campo}>{format(row[item.campo])}</td>)}{filters.tipo === 'analisis-cloro' && ['a', 'b', 'c'].map(key => <td key={key}>{row[`filtro_carbon_${key}`] || '—'}</td>)}{filters.tipo === 'filtro-arena' && <td>{date(row.fecha_contralavado)}</td>}<td>{row.responsable || 'No registrado en este formulario'}</td></tr>)}
          {!data.historial.registros.length && <tr><td colSpan="15" className="water-empty">No hay controles para estos filtros. Probá con otro período o seleccioná “Ver todo”.</td></tr>}
        </tbody></table></div>
        <div className="water-pagination"><span>{data.historial.total ? `${offset + 1}–${Math.min(offset + 25, data.historial.total)} de ${data.historial.total}` : '0 registros'}</span><div><button type="button" disabled={!offset} onClick={() => setOffset(value => Math.max(0, value - 25))}>Anterior</button><button type="button" disabled={offset + 25 >= data.historial.total} onClick={() => setOffset(value => value + 25)}>Siguiente</button></div></div>
      </section>
    </>}
  </main>;
}
