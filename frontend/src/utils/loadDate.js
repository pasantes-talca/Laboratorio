// Per-browser-session "load date" mode: lets a user enter data for a recent past day.
// State lives in sessionStorage (per tab) and never in the shared production record.

export const LOAD_DATE_KEY = 'load_date_session';
export const MAX_BACKDATE_DAYS = 7;
export const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

// Used only when sessionStorage throws, so the UI and the API layer still agree.
let memoryState = null;

export function toIsoDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function loadDateBounds(now = new Date()) {
  const min = new Date(now.getFullYear(), now.getMonth(), now.getDate() - MAX_BACKDATE_DAYS);
  return { min: toIsoDate(min), max: toIsoDate(now) };
}

function isValidIso(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day;
}

// A selectable backdated date: valid, before today and not older than the window.
export function isBackdatable(value, now = new Date()) {
  if (!isValidIso(value)) return false;
  const { min, max } = loadDateBounds(now);
  return value >= min && value < max;
}

export function formatLoadDate(iso) {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

function readRaw() {
  try {
    const raw = sessionStorage.getItem(LOAD_DATE_KEY);
    memoryState = null;
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    // Storage blocked or corrupted JSON: a blocked store falls back to memory.
    if (error instanceof SyntaxError) return null;
    return memoryState;
  }
}

function writeRaw(state) {
  memoryState = state;
  try {
    sessionStorage.setItem(LOAD_DATE_KEY, JSON.stringify(state));
  } catch { /* Storage unavailable; the in-memory copy keeps the mode consistent. */ }
}

export function clearLoadDate() {
  memoryState = null;
  try { sessionStorage.removeItem(LOAD_DATE_KEY); } catch { /* ignore */ }
}

// Returns the active backdated ISO date, or null. Expired or out-of-window values are dropped.
export function readLoadDate(now = new Date()) {
  const state = readRaw();
  if (!state) return null;
  const idle = now.getTime() - Number(state.lastActivity);
  if (!isBackdatable(state.date, now) || !(idle >= 0 && idle <= IDLE_TIMEOUT_MS)) {
    clearLoadDate();
    return null;
  }
  return state.date;
}

export function storeLoadDate(iso, now = new Date()) {
  if (!isBackdatable(iso, now)) return false;
  writeRaw({ date: iso, lastActivity: now.getTime() });
  return true;
}

// Extends the idle window; returns the active date or null.
export function touchLoadDate(now = new Date()) {
  const date = readLoadDate(now);
  if (date) writeRaw({ date, lastActivity: now.getTime() });
  return date;
}

// Adds `fecha` to a data-entry payload only while a backdated date is active.
export function withLoadDate(payload, now = new Date()) {
  const date = touchLoadDate(now);
  return date ? { ...payload, fecha: date } : payload;
}

// Forms that cannot store a past date must not silently save under today.
export function assertTodayOnly(now = new Date()) {
  if (readLoadDate(now)) {
    throw new Error('Este formulario no admite carga con fecha anterior. Use "Volver a hoy" para registrarlo.');
  }
}

// Empty hora defaults to the current time only when recording for today.
export function resolveHora(hora, now = new Date()) {
  const typed = (hora || '').trim();
  if (typed) return typed;
  if (readLoadDate(now)) return '';
  return now.toTimeString().slice(0, 5);
}
