import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearLoadDate, loadDateBounds, readLoadDate, storeLoadDate, touchLoadDate,
} from '../utils/loadDate';

const LoadDateContext = createContext(null);
const CHECK_INTERVAL_MS = 30 * 1000;
const ACTIVITY_THROTTLE_MS = 15 * 1000;
const ACTIVITY_EVENTS = ['pointerdown', 'keydown'];

export function LoadDateProvider({ children }) {
  const [loadDate, setLoadDateState] = useState(() => readLoadDate());

  const setLoadDate = useCallback((iso) => {
    if (storeLoadDate(iso)) {
      setLoadDateState(iso);
    } else if (!iso || iso === loadDateBounds().max) {
      clearLoadDate();
      setLoadDateState(null);
    }
  }, []);

  const resetLoadDate = useCallback(() => {
    clearLoadDate();
    setLoadDateState(null);
  }, []);

  useEffect(() => {
    const sync = () => setLoadDateState(readLoadDate());
    const timer = setInterval(sync, CHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!loadDate) return undefined;
    let lastTouch = Date.now();
    const onActivity = () => {
      if (Date.now() - lastTouch < ACTIVITY_THROTTLE_MS) return;
      lastTouch = Date.now();
      touchLoadDate();
    };
    ACTIVITY_EVENTS.forEach((name) => window.addEventListener(name, onActivity, true));
    return () => ACTIVITY_EVENTS.forEach((name) => window.removeEventListener(name, onActivity, true));
  }, [loadDate]);

  const value = useMemo(() => {
    const { min, max } = loadDateBounds();
    return {
      loadDate, isBackdated: Boolean(loadDate), minDate: min, maxDate: max, setLoadDate, resetLoadDate,
    };
  }, [loadDate, setLoadDate, resetLoadDate]);

  return <LoadDateContext.Provider value={value}>{children}</LoadDateContext.Provider>;
}

export function useLoadDate() {
  const ctx = useContext(LoadDateContext);
  if (!ctx) throw new Error('useLoadDate must be used within LoadDateProvider');
  return ctx;
}
