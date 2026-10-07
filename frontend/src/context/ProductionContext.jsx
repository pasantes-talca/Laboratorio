import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getActiveProduction, saveActiveProduction } from '../services/api';

const ProductionContext = createContext(null);
const LINE_KEY = 'calidad_selected_line';
const EMPTY_PRODUCTION = {
  turno: 'Mañana', sabor: '', tipoConcentrado: '', tamano: '',
  version: 0, actualizadaEn: null, actualizadaPor: null,
};

function storedLine() {
  try {
    return sessionStorage.getItem(LINE_KEY) === 'linea2' ? 'linea2' : 'linea1';
  } catch {
    return 'linea1';
  }
}

function normalize(record, line) {
  return {
    linea: line,
    turno: record.turno || 'Mañana',
    sabor: record.sabor || '',
    tipoConcentrado: record.concentrado || '',
    tamano: record.tamano || '',
    version: record.version || 0,
    actualizadaEn: record.actualizada_en || null,
    actualizadaPor: record.actualizada_por || null,
  };
}

export function ProductionProvider({ children }) {
  const [selectedLine, setSelectedLine] = useState(storedLine);
  const [byLine, setByLine] = useState({});
  const [loadingLine, setLoadingLine] = useState(null);
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectLine = useCallback((line) => {
    if (line !== 'linea1' && line !== 'linea2') return;
    try { sessionStorage.setItem(LINE_KEY, line); } catch {}
    setSelectedLine(line);
  }, []);

  const refreshProduction = useCallback(async (line = selectedLine) => {
    setLoadingLine(line);
    try {
      const record = await getActiveProduction(line === 'linea2' ? 2 : 1);
      const normalized = normalize(record, line);
      setByLine((previous) => ({
        ...previous,
        [line]: previous[line]?.version > normalized.version ? previous[line] : normalized,
      }));
      setErrors((previous) => ({ ...previous, [line]: '' }));
      return normalized;
    } catch (err) {
      setErrors((previous) => ({ ...previous, [line]: err.message || 'No se pudo cargar la producción' }));
      throw err;
    } finally {
      setLoadingLine((current) => current === line ? null : current);
    }
  }, [selectedLine]);

  useEffect(() => {
    refreshProduction().catch(() => {});
    const timer = setInterval(() => refreshProduction().catch(() => {}), 15000);
    return () => clearInterval(timer);
  }, [refreshProduction]);

  const saveProduction = useCallback(async (line, form, expectedVersion) => {
    try {
      const record = await saveActiveProduction(line === 'linea2' ? 2 : 1, {
        expected_version: expectedVersion,
        turno: form.turno,
        sabor: form.sabor,
        concentrado: form.tipoConcentrado,
        tamano: form.tamano,
      });
      const normalized = normalize(record, line);
      setByLine((previous) => ({ ...previous, [line]: normalized }));
      setErrors((previous) => ({ ...previous, [line]: '' }));
      return normalized;
    } catch (err) {
      await refreshProduction(line).catch(() => {});
      throw err;
    }
  }, [refreshProduction]);

  const production = byLine[selectedLine] || { ...EMPTY_PRODUCTION, linea: selectedLine };
  const productionLoaded = Boolean(byLine[selectedLine]);
  const productionLoading = loadingLine === selectedLine || (!productionLoaded && !errors[selectedLine]);
  const productionError = errors[selectedLine] || '';
  const productionReady = Boolean(byLine[selectedLine]?.version) && !productionLoading && !productionError;

  return (
    <ProductionContext.Provider value={{
      production, selectedLine, selectLine, refreshProduction, saveProduction,
      productionReady, productionLoaded, productionLoading, productionError,
      isModalOpen, openModal: () => setIsModalOpen(true), closeModal: () => setIsModalOpen(false),
    }}>
      {children}
    </ProductionContext.Provider>
  );
}

export function useProduction() {
  const ctx = useContext(ProductionContext);
  if (!ctx) throw new Error('useProduction must be used within ProductionProvider');
  return ctx;
}
