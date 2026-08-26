import React, { createContext, useContext, useState, useEffect } from 'react';

const ProductionContext = createContext(null);

const STORAGE_KEY = 'calidad_active_production';

const DEFAULT_STATE = {
  linea: 'linea1',
  turno: 'Mañana',
  nocheSubturno: '',
  sabor: '',
  tipoConcentrado: '',
  tamano: '',
  loteTapa: '',
};

export function ProductionProvider({ children }) {
  const [production, setProduction] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...DEFAULT_STATE, ...JSON.parse(saved) };
    } catch (_) {}
    return DEFAULT_STATE;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(production));
    } catch (_) {}
  }, [production]);

  const updateProduction = (data) => {
    setProduction((prev) => ({ ...prev, ...data }));
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
