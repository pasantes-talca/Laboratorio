import React, { useState } from 'react';
import { CalendarClock, Undo2 } from 'lucide-react';
import { useLoadDate } from '../context/LoadDateContext';
import { formatLoadDate } from '../utils/loadDate';

export function LoadDateControl() {
  const { loadDate, minDate, maxDate, setLoadDate, resetLoadDate } = useLoadDate();
  const [open, setOpen] = useState(false);

  const handleChange = (event) => {
    if (event.target.value) {
      setLoadDate(event.target.value);
      setOpen(false);
    } else {
      resetLoadDate();
    }
  };

  return (
    <div className="load-date-control">
      <button
        type="button"
        className={`btn btn-secondary load-date-toggle${loadDate ? ' is-active' : ''}`}
        aria-expanded={open}
        aria-controls="load-date-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <CalendarClock size={16} aria-hidden="true" />
        {loadDate ? `Cargando: ${formatLoadDate(loadDate)}` : 'Cargar datos de fecha pasada'}
      </button>
      {open && (
        <div id="load-date-panel" className="load-date-panel">
          <label htmlFor="load-date-input">Fecha de carga</label>
          <input
            id="load-date-input"
            type="date"
            value={loadDate || ''}
            min={minDate}
            max={maxDate}
            onChange={handleChange}
            aria-describedby="load-date-hint"
          />
          <span id="load-date-hint" className="load-date-hint">
            Desde el 01/01/2026 hasta hoy. Sin fecha se registra con la de hoy.
          </span>
        </div>
      )}
    </div>
  );
}

export function LoadDateBanner() {
  const { loadDate, resetLoadDate } = useLoadDate();
  if (!loadDate) return null;

  return (
    <div className="load-date-banner" role="status">
      <CalendarClock size={18} aria-hidden="true" />
      <span>Cargando datos del <strong>{formatLoadDate(loadDate)}</strong>. Indique la hora de cada control.</span>
      <button type="button" className="btn btn-secondary" onClick={resetLoadDate}>
        <Undo2 size={15} aria-hidden="true" /> Volver a hoy
      </button>
    </div>
  );
}
