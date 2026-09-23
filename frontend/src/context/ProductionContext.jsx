import React, { createContext, useContext, useState, useEffect } from 'react';

const ProductionContext = createContext(null);

const STORAGE_KEY = 'calidad_active_production_v2';
const LEGACY_STORAGE_KEY = 'calidad_active_production';

const DEFAULT_LINE_STATE = {
  turno: 'Mañana',
  sabor: '',
  tipoConcentrado: '',
  tamano: '',
  loteTapa: '',
};

const DEFAULT_STATE = {
  activeLine: 'linea1',
  linea1: { ...DEFAULT_LINE_STATE },
  linea2: { ...DEFAULT_LINE_STATE },
};

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        activeLine: parsed.activeLine || 'linea1',
        linea1: { ...DEFAULT_LINE_STATE, ...parsed.linea1 },
        linea2: { ...DEFAULT_LINE_STATE, ...parsed.linea2 },
      };
    }
    const legacySaved = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacySaved) {
      const legacy = JSON.parse(legacySaved);
      const activeLine = legacy.linea === 'linea2' ? 'linea2' : 'linea1';
      const lineData = { ...legacy };
      delete lineData.linea;
      return {
        ...DEFAULT_STATE,
        activeLine,
        [activeLine]: { ...DEFAULT_LINE_STATE, ...lineData },
      };
    }
  } catch {}
  return DEFAULT_STATE;
}

export function ProductionProvider({ children }) {
  const [state, setState] = useState(loadFromStorage);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Derived: the active line's full production data exposed as flat object
  const production = {
    linea: state.activeLine,
    ...state[state.activeLine],
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(production));
    } catch {}
  }, [state]);

  /**
   * updateProduction({ key: value, ... })
   * - If `linea` changes, switch line and apply any accompanying fields there.
   * - Otherwise, update the current active line's config.
   */
  const updateProduction = (data) => {
    setState((prev) => {
      const { linea, ...lineData } = data;
      const activeLine = linea || prev.activeLine;
      return {
        ...prev,
        activeLine,
        [activeLine]: { ...prev[activeLine], ...lineData },
      };
    });
  };

  return (
    <ProductionContext.Provider
      value={{
        production,
        updateProduction,
        isModalOpen,
        openModal: () => setIsModalOpen(true),
        closeModal: () => setIsModalOpen(false),
      }}
    >
      {children}
    </ProductionContext.Provider>
  );
}

export function useProduction() {
  const ctx = useContext(ProductionContext);
  if (!ctx) throw new Error('useProduction must be used within ProductionProvider');
  return ctx;
}
