import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { LoadDateProvider, useLoadDate } from './LoadDateContext';
import { LOAD_DATE_KEY, readLoadDate } from '../utils/loadDate';

const wrapper = ({ children }) => <LoadDateProvider>{children}</LoadDateProvider>;
const NOW = new Date(2026, 10, 18, 12, 0, 0); // 2026-11-18, local time
const MINUTE = 60 * 1000;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  sessionStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('LoadDateContext', () => {
  it('defaults to no backdated date (records use today)', () => {
    const { result } = renderHook(() => useLoadDate(), { wrapper });
    expect(result.current.loadDate).toBeNull();
    expect(result.current.isBackdated).toBe(false);
    expect(result.current.minDate).toBe('2026-11-11');
    expect(result.current.maxDate).toBe('2026-11-18');
  });

  it('sets a date inside the window and persists it in sessionStorage', () => {
    const { result } = renderHook(() => useLoadDate(), { wrapper });
    act(() => result.current.setLoadDate('2026-11-15'));
    expect(result.current.loadDate).toBe('2026-11-15');
    expect(result.current.isBackdated).toBe(true);
    expect(readLoadDate()).toBe('2026-11-15');
  });

  it('accepts both window edges', () => {
    const { result } = renderHook(() => useLoadDate(), { wrapper });
    act(() => result.current.setLoadDate('2026-11-11'));
    expect(result.current.loadDate).toBe('2026-11-11');
  });

  it('ignores dates outside the window or malformed', () => {
    const { result } = renderHook(() => useLoadDate(), { wrapper });
    act(() => result.current.setLoadDate('2026-11-10'));
    expect(result.current.loadDate).toBeNull();
    act(() => result.current.setLoadDate('2026-11-19'));
    expect(result.current.loadDate).toBeNull();
    act(() => result.current.setLoadDate('not-a-date'));
    expect(result.current.loadDate).toBeNull();
  });

  it('treats today as "no backdated date"', () => {
    const { result } = renderHook(() => useLoadDate(), { wrapper });
    act(() => result.current.setLoadDate('2026-11-15'));
    act(() => result.current.setLoadDate('2026-11-18'));
    expect(result.current.loadDate).toBeNull();
    expect(sessionStorage.getItem(LOAD_DATE_KEY)).toBeNull();
  });

  it('resets back to today', () => {
    const { result } = renderHook(() => useLoadDate(), { wrapper });
    act(() => result.current.setLoadDate('2026-11-15'));
    act(() => result.current.resetLoadDate());
    expect(result.current.loadDate).toBeNull();
    expect(sessionStorage.getItem(LOAD_DATE_KEY)).toBeNull();
  });

  it('restores a stored date on mount (same tab, new mount)', () => {
    sessionStorage.setItem(LOAD_DATE_KEY, JSON.stringify({ date: '2026-11-14', lastActivity: NOW.getTime() }));
    const { result } = renderHook(() => useLoadDate(), { wrapper });
    expect(result.current.loadDate).toBe('2026-11-14');
  });

  it('drops a stored date that fell outside the window', () => {
    sessionStorage.setItem(LOAD_DATE_KEY, JSON.stringify({ date: '2026-11-01', lastActivity: NOW.getTime() }));
    const { result } = renderHook(() => useLoadDate(), { wrapper });
    expect(result.current.loadDate).toBeNull();
    expect(sessionStorage.getItem(LOAD_DATE_KEY)).toBeNull();
  });

  it('drops the date when the window moves past it (next day)', () => {
    vi.setSystemTime(new Date(2026, 10, 18, 23, 50, 0));
    const { result } = renderHook(() => useLoadDate(), { wrapper });
    act(() => result.current.setLoadDate('2026-11-11'));
    expect(result.current.loadDate).toBe('2026-11-11');
    act(() => {
      // 11 minutes later it is the next day: the oldest allowed date is now 2026-11-12
      vi.advanceTimersByTime(11 * MINUTE);
    });
    expect(result.current.loadDate).toBeNull();
  });

  it('expires after 30 minutes without activity', () => {
    const { result } = renderHook(() => useLoadDate(), { wrapper });
    act(() => result.current.setLoadDate('2026-11-15'));
    act(() => vi.advanceTimersByTime(29 * MINUTE));
    expect(result.current.loadDate).toBe('2026-11-15');
    act(() => vi.advanceTimersByTime(2 * MINUTE));
    expect(result.current.loadDate).toBeNull();
    expect(readLoadDate()).toBeNull();
  });

  it('user interaction keeps the session alive', () => {
    const { result } = renderHook(() => useLoadDate(), { wrapper });
    act(() => result.current.setLoadDate('2026-11-15'));
    act(() => vi.advanceTimersByTime(25 * MINUTE));
    act(() => { window.dispatchEvent(new Event('pointerdown')); });
    act(() => vi.advanceTimersByTime(25 * MINUTE));
    expect(result.current.loadDate).toBe('2026-11-15');
  });

  it('tolerates sessionStorage failures and still works in memory', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('blocked'); });
    const { result } = renderHook(() => useLoadDate(), { wrapper });
    expect(result.current.loadDate).toBeNull();
    act(() => result.current.setLoadDate('2026-11-15'));
    expect(result.current.loadDate).toBe('2026-11-15');
    expect(readLoadDate()).toBe('2026-11-15');
    act(() => result.current.resetLoadDate());
    expect(result.current.loadDate).toBeNull();
    expect(readLoadDate()).toBeNull();
  });

  it('ignores corrupted stored values', () => {
    sessionStorage.setItem(LOAD_DATE_KEY, '{oops');
    const { result } = renderHook(() => useLoadDate(), { wrapper });
    expect(result.current.loadDate).toBeNull();
  });

  it('throws when used outside the provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useLoadDate())).toThrow('useLoadDate must be used within LoadDateProvider');
    spy.mockRestore();
  });
});
