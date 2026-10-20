import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Search, X, History, Pencil, ArrowLeft, ArrowRight } from 'lucide-react';
import { useSession } from '../../context/AuthContext';
import { fetchJson } from '../../services/httpClient';
import { createExamples, previewCatalogue } from './preview';
import './administracion.css';

const emptyFilters = { desde: '', hasta: '', responsable: '', usuario: '', q: '' };
function display(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value).split('-').reverse().join('/');
  if (/^\d{4}-\d{2}-\d{2}T/.test(String(value))) return new Date(value).toLocaleString('es-AR');
  return String(value);
}
const timestamp = value => value ? new Date(value).toLocaleString('es-AR') : 'Sin fecha registrada';

function Editor({ form, record, onClose, onSave, preview }) {
  const [values, setValues] = useState(record.values);
  const [reason, setReason] = useState('');
  const [tab, setTab] = useState('edit');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(false);
  const dialog = useRef(null);
  const busyRef = useRef(false);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.querySelector('button')?.focus();
    const keydown = event => {
      if (event.key === 'Escape' && !busyRef.current) closeRef.current();
      if (event.key !== 'Tab') return;
      const nodes = [...dialog.current.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]')];
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('keydown', keydown); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  const changed = Object.fromEntries(Object.entries(values).filter(([key, value]) => JSON.stringify(value) !== JSON.stringify(record.values[key])));
  async function save(event) {
    event.preventDefault();
    setBusy(true); busyRef.current = true; setError('');
    try { await onSave({ valores: changed, motivo: reason.trim(), expected_version: record.version }); }
    catch (err) { setError(err.message); setConflict(err.status === 409); }
    finally { setBusy(false); busyRef.current = false; }
  }
  return <div className="admin-scrim"><section className="admin-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-dialog-title" ref={dialog}>
    <header className="admin-dialog-header"><div><span className="admin-eyebrow">REGISTRO #{record.id}</span><h2 id="admin-dialog-title">{form.label}</h2></div><button type="button" className="admin-icon" aria-label="Cerrar registro" disabled={busy} onClick={onClose}><X size={22} /></button></header>
    <div className="admin-record-meta"><span><b>Ingresado por</b>{record.created_by || 'Sin registro de autor'}</span><span><b>Fecha de ingreso</b>{timestamp(record.created_at)}</span></div>
    <div className="admin-tabs" role="tablist" aria-label="Detalle del registro"><button type="button" role="tab" aria-selected={tab === 'edit'} onClick={() => setTab('edit')}><Pencil size={16} />Editar datos</button><button type="button" role="tab" aria-selected={tab === 'history'} onClick={() => setTab('history')}><History size={16} />Historial ({record.history.length})</button></div>
    {tab === 'history' ? <div className="admin-history" role="tabpanel">{!record.history.length && <p className="admin-empty">Este registro todavía no tiene modificaciones administrativas.</p>}{record.history.map(item => <article key={item.id}><div className="admin-history-heading"><strong>{item.user}</strong><time>{timestamp(item.date)}</time></div><p>{item.reason}</p><dl>{Object.keys(item.after).map(key => <div key={key}><dt>{form.fields.find(f => f.key === key)?.label || key}</dt><dd><del>{display(item.before[key])}</del> → <b>{display(item.after[key])}</b></dd></div>)}</dl></article>)}</div> : <form onSubmit={save}>
      <div className="admin-editor-body"><p className="admin-help">Corregí los datos y explicá el motivo. Cada modificación quedará en el historial.</p>
        {form.id.startsWith('calidad-') && <p className="admin-help">Los datos del producto y la línea conservan la producción asociada al control.</p>}
        <div className="admin-field-grid">{form.fields.filter(field => field.key !== 'id').map(field => {
          const value = values[field.key];
          const set = next => setValues(old => ({ ...old, [field.key]: next }));
          const props = { id: `edit-${field.key}`, disabled: busy || field.readonly, required: field.required, value: value ?? '', onChange: e => set(e.target.value), maxLength: field.max_length || 10000 };
          return <label className="admin-field" key={field.key} htmlFor={props.id}><span>{field.label}{field.required && !field.readonly ? ' *' : ''}</span>
            {field.readonly ? <input {...props} value={display(value)} /> : field.options ? <select {...props}><option value="">Seleccionar</option>{field.options.map(option => <option key={option}>{option}</option>)}</select> : field.type === 'boolean' ? <select {...props} value={value == null ? '' : String(value)} onChange={e => set(e.target.value === '' ? null : e.target.value === 'true')}><option value="">Seleccionar</option><option value="true">Sí</option><option value="false">No</option></select> : field.type === 'list' ? <textarea {...props} value={Array.isArray(value) ? value.join('\n') : value ?? ''} onChange={e => set(e.target.value.split('\n'))} rows={3} placeholder="Un valor por línea" /> : <input {...props} type={['integer', 'number'].includes(field.type) ? 'number' : ['date', 'time'].includes(field.type) ? field.type : 'text'} step={field.type === 'integer' ? 1 : 'any'} onChange={e => set(['integer', 'number'].includes(field.type) ? e.target.value === '' ? null : Number(e.target.value) : e.target.value)} />}
          </label>;
        })}</div>
        <label className="admin-field admin-reason" htmlFor="edit-reason"><span>Motivo de la modificación *</span><textarea id="edit-reason" required minLength={5} maxLength={500} value={reason} disabled={busy} onChange={e => setReason(e.target.value)} rows={3} placeholder="Explicá por qué se corrige este registro" /></label>
        {error && <p className="admin-error" role="alert">{error}</p>}{conflict && <p>Conservamos tus cambios en esta pantalla. Cerrá y volvé a abrir el registro para revisar la última versión.</p>}
      </div><footer className="admin-dialog-footer"><button type="button" className="admin-button" disabled={busy} onClick={onClose}>Cancelar</button><button type="submit" className="admin-button primary" disabled={busy || conflict || !Object.keys(changed).length || reason.trim().length < 5}>{busy ? 'Guardando…' : preview ? 'Guardar cambio de prueba' : 'Guardar cambios'}</button></footer>
    </form>}
  </section></div>;
}

export default function AdminPage({ preview = false }) {
  const { user } = useSession();
  const allowed = preview || user?.role === 'administrador';
  const [catalog, setCatalog] = useState(preview ? previewCatalogue : []);
  const [formId, setFormId] = useState('agua-cloro');
  const [filters, setFilters] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [offset, setOffset] = useState(0);
  const [result, setResult] = useState({ items: [], total: 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [record, setRecord] = useState(null);
  const [revision, setRevision] = useState(0);
  const [catalogAttempt, setCatalogAttempt] = useState(0);
  const [examples, setExamples] = useState(() => preview ? createExamples() : {});
  const form = catalog.find(item => item.id === formId);
  const requestVersion = useRef(0);
  useEffect(() => {
    if (!allowed || preview) return;
    const controller = new AbortController();
    fetchJson('/admin/catalogo', { signal: controller.signal }).then(setCatalog).catch(err => { if (err.name !== 'AbortError') setError(err.message); });
    return () => controller.abort();
  }, [allowed, preview, catalogAttempt]);
  useEffect(() => {
    if (!allowed || !form) return;
    const controller = new AbortController();
    setBusy(true); setError('');
    if (preview) {
      const rows = examples[formId].filter(row => {
        const day = String(row.values.fecha || row.values.fecha_registro || '').slice(0, 10);
        return (!applied.desde || day >= applied.desde) && (!applied.hasta || day <= applied.hasta) && (!applied.usuario || row.created_by.includes(applied.usuario)) && (!applied.responsable || String(row.values.responsable || row.values.responsables || '').toLowerCase().includes(applied.responsable.toLowerCase())) && (!applied.q || Object.values(row.values).join(' ').toLowerCase().includes(applied.q.toLowerCase()));
      });
      setResult({ items: rows.slice(offset, offset + 25), total: rows.length }); setBusy(false);
    } else {
      const activeFilters = Object.fromEntries(Object.entries(applied).filter(([, value]) => value !== ''));
      const query = new URLSearchParams({ ...activeFilters, offset, limit: 25 });
      fetchJson(`/admin/${formId}/registros?${query}`, { signal: controller.signal }).then(setResult).catch(err => { if (err.name !== 'AbortError') setError(err.message); }).finally(() => { if (!controller.signal.aborted) setBusy(false); });
    }
    return () => controller.abort();
  }, [allowed, preview, form, formId, applied, offset, revision, examples]);
  useEffect(() => { requestVersion.current += 1; setRecord(null); }, [formId]);
  async function open(row) {
    const current = ++requestVersion.current;
    setError('');
    try { const detail = preview ? row : await fetchJson(`/admin/${formId}/registros/${row.id}`); if (current === requestVersion.current) setRecord(detail); }
    catch (err) { if (current === requestVersion.current) setError(err.message); }
  }
  async function save(body) {
    if (preview) {
      const next = { ...record, version: record.version + 1, values: { ...record.values, ...body.valores }, history: [{ id: record.version, user: 'administrador.ejemplo', date: new Date().toISOString(), reason: body.motivo, before: Object.fromEntries(Object.keys(body.valores).map(key => [key, record.values[key]])), after: body.valores }, ...record.history] };
      setExamples(old => ({ ...old, [formId]: old[formId].map(row => row.id === record.id ? next : row) }));
    } else await fetchJson(`/admin/${formId}/registros/${record.id}`, { method: 'PATCH', body: JSON.stringify(body) });
    setRecord(null); setRevision(old => old + 1); setNotice(preview ? 'Cambio de prueba guardado. Podés abrir el registro para ver su historial.' : 'Registro actualizado. La modificación quedó en el historial.');
  }
  function choose(id) { requestVersion.current += 1; setFormId(id); setOffset(0); setFilters(emptyFilters); setApplied(emptyFilters); setNotice(''); setResult({ items: [], total: 0 }); }
  if (!allowed) return <main className="admin-page"><section className="admin-card"><ShieldCheck /><h2>Administración de registros</h2><p>Ingresá con una cuenta de administrador para consultar y corregir los registros.</p><a className="admin-button primary" href="/administracion?demo=1">Ver pantalla de ejemplo</a></section></main>;
  return <main className="admin-page">
    {preview && <aside className="admin-demo"><strong>Vista de ejemplo</strong><span>Estos datos son ficticios. Los cambios son de prueba y se reinician al recargar la página.</span></aside>}
    <header className="admin-hero"><div className="admin-hero-icon"><ShieldCheck size={27} /></div><div><span className="admin-eyebrow">ADMINISTRACIÓN</span><h1>Registros del laboratorio</h1><p>Consultá las cargas, corregí datos y revisá cada modificación.</p></div><span className="admin-badge">{preview ? 'Datos de ejemplo' : user.username}</span></header>
    <section className="admin-card"><div className="admin-section-heading"><span className="admin-step">1</span><div><h2>Elegí qué registros consultar</h2><p>Todos los formularios, en un mismo lugar.</p></div></div>
      <div className="admin-selector-grid"><label className="admin-field"><span>Módulo</span><select value={form?.module || ''} onChange={e => choose(catalog.find(item => item.module === e.target.value).id)}>{[...new Set(catalog.map(item => item.module))].map(module => <option value={module} key={module}>{catalog.find(item => item.module === module).module_label}</option>)}</select></label><label className="admin-field"><span>Formulario</span><select value={formId} onChange={e => choose(e.target.value)}>{catalog.filter(item => item.module === form?.module).map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label></div>
      <form className="admin-filters" onSubmit={e => { e.preventDefault(); setOffset(0); setApplied({ ...filters }); }}>
        {[['desde', 'Desde', 'date'], ['hasta', 'Hasta', 'date'], ['responsable', 'Responsable', 'text'], ['usuario', 'Ingresado por', 'text'], ['q', 'Buscar en los datos', 'search']].map(([key, label, type]) => <label className="admin-field" key={key}><span>{label}</span><input type={type} value={filters[key]} maxLength={100} onChange={e => setFilters(old => ({ ...old, [key]: e.target.value }))} /></label>)}
        <div className="admin-filter-actions"><button type="submit" className="admin-button primary" disabled={busy}><Search size={17} />Buscar</button><button type="button" className="admin-button" onClick={() => { setFilters(emptyFilters); setApplied(emptyFilters); setOffset(0); }}>Limpiar</button></div>
      </form>
    </section>
    {error && <div className="admin-error" role="alert">{error} <button type="button" className="admin-button" onClick={() => { if (!catalog.length) setCatalogAttempt(old => old + 1); else setRevision(old => old + 1); }}>Reintentar</button></div>}{notice && <p className="admin-success" role="status">{notice}</p>}
    <section className="admin-card admin-results"><div className="admin-results-heading"><div><span className="admin-eyebrow">REGISTROS INGRESADOS</span><h2>{form?.label || 'Cargando formularios…'}</h2></div><span className="admin-count">{result.total} registros</span></div>
      <div className="admin-table-wrap" aria-busy={busy}><table><thead><tr><th>ID</th>{form?.columns.map(key => <th key={key}>{form.fields.find(field => field.key === key)?.label}</th>)}<th>Ingresado por</th><th>Acciones</th></tr></thead><tbody>{!busy && result.items.map(row => <tr key={row.id}><td className="admin-record-id">#{row.id}</td>{form.columns.map(key => <td key={key}>{display(row.values[key])}</td>)}<td><span className="admin-author">{row.created_by || 'Sin registro de autor'}</span></td><td><button type="button" className="admin-button" onClick={() => open(row)}><Pencil size={15} />Ver / editar</button></td></tr>)}</tbody></table>{busy ? <p role="status" className="admin-empty">Cargando registros…</p> : !result.items.length && <p className="admin-empty">No hay registros que coincidan con la búsqueda.</p>}</div>
      <footer className="admin-pagination"><span>{result.total ? `${offset + 1}–${Math.min(offset + 25, result.total)} de ${result.total}` : '0 registros'}</span><div><button type="button" className="admin-button" disabled={!offset || busy} onClick={() => setOffset(old => Math.max(0, old - 25))}><ArrowLeft size={16} />Anterior</button><button type="button" className="admin-button" disabled={offset + 25 >= result.total || busy} onClick={() => setOffset(old => old + 25)}>Siguiente<ArrowRight size={16} /></button></div></footer>
    </section><p className="admin-footnote">Los registros anteriores a la identificación de usuarios pueden no tener un autor registrado.</p>
    {record && form && <Editor key={`${formId}-${record.id}`} form={form} record={record} onClose={() => setRecord(null)} onSave={save} preview={preview} />}
  </main>;
}
