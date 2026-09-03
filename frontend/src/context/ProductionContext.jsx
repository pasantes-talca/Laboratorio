import React, { createContext, useContext, useState, useEffect } from 'react';

const ProductionContext = createContext(null);

const STORAGE_KEY = 'calidad_active_production_v2';

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
        linea1: { ...DEFAULT_LINE_STATE, ...(parsed.linea1 || {}) },
        linea2: { ...DEFAULT_LINE_STATE, ...(parsed.linea2 || {}) },
      };
    }
  } catch (_) {}
  return DEFAULT_STATE;
}

export function ProductionProvider({ children }) {
  const [state, setState] = useState(loadFromStorage);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {}
  }, [state]);

  // Derived: the active line's full production data exposed as flat object
  const production = {
    linea: state.activeLine,
    ...state[state.activeLine],
  };

  /**
   * updateProduction({ key: value, ... })
   * - If `linea` changes → switch active line (does NOT overwrite the line's config)
   * - All other keys → update current active line's config
   */
  const updateProduction = (data) => {
    setState((prev) => {
      if (data.linea && data.linea !== prev.activeLine) {
        // Only switch active line; don't touch either line's config
        return { ...prev, activeLine: data.linea };
      }

      const { linea: _ignore, ...lineData } = data;
      const activeLine = prev.activeLine;
      return {
        ...prev,
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
