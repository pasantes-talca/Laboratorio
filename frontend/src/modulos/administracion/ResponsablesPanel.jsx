import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { fetchJson } from '../../services/httpClient';

const MODULES = [
  { id: 'calidad', label: 'Control de calidad' },
  { id: 'agua', label: 'Control de Agua' },
  { id: 'jarabe', label: 'Preparación de Jarabe' },
];

export default function ResponsablesPanel() {
  const [lists, setLists] = useState({ calidad: [], agua: [], jarabe: [] });
  const [drafts, setDrafts] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async signal => {
    try { setLists(await fetchJson('/admin/responsables', { signal })); }
    catch (err) { if (err.name !== 'AbortError') setError(err.message); }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  async function add(event, module) {
    event.preventDefault();
    const nombre = (drafts[module.id] || '').trim();
    if (!nombre || busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await fetchJson('/admin/responsables', { method: 'POST', body: JSON.stringify({ modulo: module.id, nombre }) });
      setDrafts(old => ({ ...old, [module.id]: '' }));
      setNotice(`${nombre} se agregó a ${module.label}.`);
      await load();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function remove(person, module) {
    if (busy || !window.confirm(`¿Querés eliminar a ${person.nombre} de ${module.label}? Los registros ya cargados conservan su nombre.`)) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await fetchJson(`/admin/responsables/${person.id}`, { method: 'DELETE' });
      setNotice(`${person.nombre} se eliminó de ${module.label}.`);
      await load();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <>
    {error && <div className="admin-error" role="alert">{error}</div>}
    {notice && <p className="admin-success" role="status">{notice}</p>}
    <div className="admin-responsables-grid">
      {MODULES.map(module => <section className="admin-card" key={module.id} role="region" aria-label={module.label}>
        <div className="admin-results-heading"><div><span className="admin-eyebrow">RESPONSABLES</span><h2>{module.label}</h2></div><span className="admin-count">{lists[module.id]?.length || 0}</span></div>
        <form className="admin-responsable-add" onSubmit={event => add(event, module)}>
          <label className="admin-field"><span>Nombre y apellido</span>
            <input type="text" aria-label={`Nuevo responsable de ${module.label}`} maxLength={100} value={drafts[module.id] || ''} disabled={busy} onChange={e => setDrafts(old => ({ ...old, [module.id]: e.target.value }))} />
          </label>
          <button type="submit" className="admin-button primary" disabled={busy || !(drafts[module.id] || '').trim()}><Plus size={16} />Agregar</button>
        </form>
        <ul className="admin-responsable-list">
          {lists[module.id]?.map(person => <li key={person.id}><span>{person.nombre}</span>
            <button type="button" className="admin-button danger" disabled={busy} aria-label={`Eliminar a ${person.nombre} de ${module.label}`} onClick={() => remove(person, module)}><Trash2 size={15} />Eliminar</button>
          </li>)}
        </ul>
        {!lists[module.id]?.length && <p className="admin-empty">Todavía no hay responsables cargados.</p>}
      </section>)}
    </div>
  </>;
}
