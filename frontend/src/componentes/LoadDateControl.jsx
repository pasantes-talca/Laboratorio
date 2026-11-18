import React from 'react';
import { CalendarClock, Undo2 } from 'lucide-react';
import { useLoadDate } from '../context/LoadDateContext';
import { formatLoadDate } from '../utils/loadDate';

export function LoadDateControl() {
  const { loadDate, minDate, maxDate, setLoadDate, resetLoadDate } = useLoadDate();

  return (
    <div className="load-date-control">
      <label htmlFor="load-date-input">
        <CalendarClock size={16} aria-hidden="true" /> Fecha de carga
      </label>
      <input
        id="load-date-input"
        type="date"
        value={loadDate || ''}
        min={minDate}
        max={maxDate}
        onChange={(event) => (event.target.value ? setLoadDate(event.target.value) : resetLoadDate())}
        aria-describedby="load-date-hint"
      />
      <span id="load-date-hint" className="load-date-hint">
        Opcional: hasta 7 días atrás. Vacío registra con la fecha de hoy.
      </span>
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
