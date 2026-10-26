import React, { useEffect, useState } from 'react';
import { ArrowUpRight, FlaskConical, RefreshCw } from 'lucide-react';
import { fetchJson } from '../../../services/api';
import '../styles/jarabe-dashboard.css';

const TYPES = { simple: 'Jarabe simple', terminado: 'Jarabe terminado', saneo: 'Saneo de tanques', parte: 'Parte de jarabe' };
const STATES = { preparando: 'Preparando jarabe', terminado: 'Terminado · pendiente de saneo', saneando: 'En saneo', apto: 'Apto según saneo', revisar: 'Revisar estado', sin_datos: 'Sin registros' };
const format = value => value == null ? 'Sin dato' : Number(value).toLocaleString('es-AR', { maximumFractionDigits: 2 });
const date = value => value ? new Date(`${value}T12:00:00`).toLocaleDateString('es-AR') : 'Sin registrar';
const timestamp = value => value ? new Date(value).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', dateStyle: 'short', timeStyle: 'short' }) : 'Sin fecha de carga';
const currentMonth = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date()).slice(0, 7);
const EMPTY = { mes: '', fecha: '', tanque: '', sabor: '', tipo: '' };

function movement(item, finish = false) {
  if (!item) return 'Sin registrar';
  const hour = finish ? item.hora_fin : item.hora;
  return `${date(finish ? item.fecha_fin || item.fecha : item.fecha)}${hour ? ` · ${hour.slice(0, 5)}${item.hora_de_carga && !finish ? ' (carga)' : ''}` : ' · sin hora'}`;
}

function detail(row) {
  if (row.tipo === 'simple') return `Volcado ${row.volcado_numero || '—'} · ${format(row.bolsas)} bolsas`;
  if (row.tipo === 'terminado') return row.litros == null ? 'Litros sin informar' : `${format(row.litros)} L`;
  if (row.tipo === 'saneo') return `${row.producto || 'Producto sin registrar'} · Fin: ${row.hora_fin?.slice(0, 5) || 'pendiente'}`;
  return `Carga ${row.numero_carga_trilay || '—'} · ${row.turno || 'Turno sin registrar'}`;
}

export default function JarabeDashboardPage({ onNavigate }) {
  const [filters, setFilters] = useState(() => ({ ...EMPTY, mes: currentMonth() }));
  const [offset, setOffset] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState(null);
  const [options, setOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updated, setUpdated] = useState(null);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true); setError('');
    const params = new URLSearchParams({ limit: '25', offset: String(offset) });
    Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
    fetchJson(`/jarabe/dashboard?${params}`, { signal: controller.signal }).then(result => {
      if (active) { setData(result); setOptions(result.opciones); setUpdated(new Date()); }
    }).catch(err => { if (active && err.name !== 'AbortError') setError(err.message || 'Error al cargar los registros.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [filters, offset, refresh]);
  function change(key, value) {
    setOffset(0);
    setFilters(previous => ({ ...previous, [key]: value, ...(key === 'mes' ? { fecha: '' } : {}), ...(key === 'tipo' ? { sabor: '' } : {}) }));
  }
  const months = [...new Set([currentMonth(), ...(options.meses || [])])].sort().reverse();
  const selections = [
    ['tipo', 'Formulario', 'Todos los formularios', Object.entries(TYPES)],
    ['mes', 'Mes', 'Todos los meses', months.map(value => [value, new Date(`${value}-01T12:00:00`).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })])],
    ['fecha', 'Fecha del control', 'Todo el período', (options.fechas || []).filter(value => !filters.mes || value.startsWith(filters.mes)).map(value => [value, date(value)])],
    ['tanque', 'Tanque del historial', 'Todos los tanques', (options.tanques || []).map(value => [value, value])],
    ...(['terminado', 'parte'].includes(filters.tipo) ? [['sabor', 'Sabor', 'Todos los sabores', (options.sabores || []).map(value => [value, value])]] : []),
  ];
  const ready = data && !loading && !error;
  const board = data?.estado_tanques || { tanques: [], resumen: {} };
  const visibleTanks = board.tanques.filter(tank => (!status || tank.estado === status) && tank.tanque.toLowerCase().includes(search.trim().toLowerCase()));
  return <main className="syrup-dashboard">
    <header className="syrup-hero"><div><span className="syrup-eyebrow"><FlaskConical size={16} /> SALA DE JARABE</span><h1>Dashboard de Jarabe</h1><p>Estado de los tanques y seguimiento de las preparaciones.</p></div><div className="tank-header-actions"><button type="button" disabled={loading} onClick={() => setRefresh(value => value + 1)}><RefreshCw size={15} /> Actualizar</button><button type="button" onClick={() => onNavigate?.('jarabe', 'simple')}>Registrar jarabe simple <ArrowUpRight size={17} /></button></div></header>
    {loading && <p className="syrup-message" role="status">Actualizando tanques e historial…</p>}
    {error && <div className="syrup-message syrup-error" role="alert">No se pudo cargar el dashboard: {error} <button type="button" onClick={() => setRefresh(value => value + 1)}>Reintentar</button></div>}
    {ready && <>
      <div className="syrup-section-caption"><span>Estado según los registros disponibles · Actualizado {timestamp(updated)}</span><span>{board.tanques.length} tanques</span></div>
      <section className="tank-summary" aria-label="Resumen de tanques">{Object.entries(STATES).map(([key, label]) => <button type="button" key={key} className={`tank-total tank-${key}`} aria-pressed={status === key} onClick={() => setStatus(previous => previous === key ? '' : key)}><strong>{board.resumen[key] || 0}</strong><span>{label}</span></button>)}</section>
      <section aria-labelledby="tank-board-title"><div className="tank-board-heading"><div><h2 id="tank-board-title">Estado de los tanques</h2><p>El estado usa todos los movimientos disponibles y no cambia con los filtros del historial.</p></div><div className="tank-board-filters"><label>Buscar tanque<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Número de tanque" /></label><label>Estado<select value={status} onChange={event => setStatus(event.target.value)}><option value="">Todos los estados</option>{Object.entries(STATES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label></div></div>
        <p className="tank-explanation">Un tanque se muestra apto cuando tiene un saneo finalizado y no hay una preparación posterior registrada. Si faltan horas para ordenar los movimientos, se indica “Revisar estado”. Las horas marcadas “carga” corresponden al ingreso del formulario ese mismo día.</p>
        {board.sin_tanque_asignado && <p className="syrup-notice">Hay registros con tanque N/A o sin asignación física. Podés consultarlos en el historial.</p>}
        <div className="tank-grid">{visibleTanks.map(tank => {
          const moves = tank.movimientos;
          const nextForm = { preparando: 'terminado', terminado: 'saneo', apto: 'simple', saneando: 'saneo' }[tank.estado];
          return <article className={`tank-card tank-${tank.estado}`} key={tank.tanque} aria-label={`Tanque ${tank.tanque}`}><div className="tank-card-heading"><h3>Tanque {tank.tanque}</h3><span className="tank-status">{STATES[tank.estado]}</span></div><p className="tank-reason">{tank.motivo}</p>
            <dl><div><dt>Último jarabe simple</dt><dd>{movement(moves.simple)}</dd></div><div><dt>Último jarabe terminado</dt><dd>{movement(moves.terminado)}{moves.terminado?.sabor && <small>{moves.terminado.sabor}</small>}</dd></div><div><dt>Último saneo</dt><dd>{movement(moves.saneo, true)}{moves.saneo && <small>{moves.saneo.completo ? 'Finalizado' : 'Sin cierre registrado'}</small>}</dd></div><div><dt>Último parte de jarabe</dt><dd>{movement(moves.parte)}{moves.parte?.sabor && <small>{moves.parte.sabor}</small>}</dd></div></dl>
            {nextForm && <button type="button" onClick={() => onNavigate?.('jarabe', nextForm)}>Abrir {TYPES[nextForm].toLowerCase()} <ArrowUpRight size={14} /></button>}
          </article>;
        })}</div>
        {!visibleTanks.length && <p className="syrup-message">No hay tanques que coincidan con la búsqueda.</p>}
      </section>
    </>}
    <section className="syrup-panel tank-history"><div className="syrup-panel-heading"><div><h2>Historial de cargas</h2><p>Consultá los registros de cada formulario de Sala de Jarabe.</p></div>{ready && <span className="syrup-pill">{data.historial.total} registros</span>}</div>
      <div className="syrup-toolbar tank-history-filters">{selections.map(([key, title, all, values]) => <label key={key}>{title}<select aria-label={title} value={filters[key]} onChange={event => change(key, event.target.value)}><option value="">{all}</option>{values.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>)}<div className="syrup-toolbar-actions"><button type="button" onClick={() => { setOffset(0); setFilters({ ...EMPTY }); }}>Limpiar filtros</button></div></div>
      {ready && <><div className="syrup-table-scroll"><table><thead><tr><th>Cargado el</th><th>Fecha / hora del control</th><th>Formulario</th><th>Tanque</th><th>Sabor</th><th>Detalle</th><th>Responsables</th></tr></thead><tbody>{data.historial.registros.map(row => <tr key={`${row.tipo}-${row.id}`}><td className="syrup-nowrap">{timestamp(row.cargado_en)}</td><td className="syrup-nowrap">{date(row.fecha)}<small>{row.hora?.slice(0, 5) || 'Hora no registrada'}</small></td><td>{TYPES[row.tipo]}</td><td>{row.tanque}</td><td>{row.sabor || '—'}</td><td>{detail(row)}</td><td>{row.responsables.join(', ') || 'Sin registrar'}</td></tr>)}{!data.historial.registros.length && <tr><td colSpan="7">No hay cargas con estos filtros.</td></tr>}</tbody></table></div><div className="syrup-pagination"><span>{data.historial.total ? `${offset + 1}–${Math.min(offset + 25, data.historial.total)} de ${data.historial.total}` : '0 registros'}</span><div><button type="button" disabled={!offset} onClick={() => setOffset(value => Math.max(0, value - 25))}>Anterior</button><button type="button" disabled={offset + 25 >= data.historial.total} onClick={() => setOffset(value => value + 25)}>Siguiente</button></div></div></>}
    </section>
  </main>;
}
