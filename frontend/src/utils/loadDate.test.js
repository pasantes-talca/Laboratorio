import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LOAD_DATE_KEY, clearLoadDate, formatLoadDate, readLoadDate, resolveHora, storeLoadDate, withLoadDate,
} from './loadDate';

const NOW = new Date(2026, 10, 18, 12, 0, 0);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  sessionStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('loadDate helpers', () => {
  it('formats ISO dates as DD/MM/AAAA', () => {
    expect(formatLoadDate('2026-11-05')).toBe('05/11/2026');
  });

  it('withLoadDate leaves the payload untouched when no date is active', () => {
    const payload = { a: 1 };
    expect(withLoadDate(payload)).toBe(payload);
    expect(withLoadDate(payload)).not.toHaveProperty('fecha');
  });

  it('withLoadDate adds fecha when a backdated date is active', () => {
    storeLoadDate('2026-11-15');
    expect(withLoadDate({ a: 1 })).toEqual({ a: 1, fecha: '2026-11-15' });
  });

  it('withLoadDate refreshes the activity timestamp', () => {
    storeLoadDate('2026-11-15');
    vi.advanceTimersByTime(20 * 60 * 1000);
    withLoadDate({});
    vi.advanceTimersByTime(20 * 60 * 1000);
    expect(readLoadDate()).toBe('2026-11-15');
  });

  it('does not send a stale date after the idle timeout', () => {
    storeLoadDate('2026-11-15');
    vi.advanceTimersByTime(31 * 60 * 1000);
    expect(withLoadDate({})).not.toHaveProperty('fecha');
    expect(sessionStorage.getItem(LOAD_DATE_KEY)).toBeNull();
  });

  it('storeLoadDate rejects dates outside the window', () => {
    expect(storeLoadDate('2025-12-31')).toBe(false);
    expect(storeLoadDate('2026-11-19')).toBe(false);
    expect(readLoadDate()).toBeNull();
  });

  it('clearLoadDate removes the stored date', () => {
    storeLoadDate('2026-11-15');
    clearLoadDate();
    expect(readLoadDate()).toBeNull();
  });

  it('resolveHora keeps a typed hora, defaults to now only for today', () => {
    expect(resolveHora(' 08:15 ')).toBe('08:15');
    expect(resolveHora('')).toMatch(/^\d{2}:\d{2}$/);
    storeLoadDate('2026-11-15');
    expect(resolveHora('')).toBe('');
    expect(resolveHora('09:00')).toBe('09:00');
  });
});
