export const FORM_NAV = {
  calidad: [
    { id: 'bebida', slug: 'bebida', label: 'Bebida Terminada' },
    { id: 'jarabe', slug: 'jarabe', label: 'Control de Jarabe' },
    { id: 'torque', slug: 'torque', label: 'Control de Torque' },
  ],
  jarabe: [
    { id: 'simple', slug: 'simple', label: 'Jarabe Simple' },
    { id: 'terminado', slug: 'terminado', label: 'Jarabe Terminado' },
    { id: 'saneo', slug: 'saneo-tanques', label: 'Saneo de Tanques' },
    { id: 'parte', slug: 'parte', label: 'Parte de Jarabe' },
  ],
  agua: [
    { id: 'fisicoQuimico', slug: 'fisico-quimico', label: 'Control Físico Químico' },
    { id: 'analisisCloro', slug: 'analisis-cloro', label: 'Análisis de Cloro' },
    { id: 'osmosisInversa', slug: 'osmosis-inversa', label: 'Ósmosis Inversa' },
    { id: 'filtroArena', slug: 'filtro-arena', label: 'Filtro de Arena' },
    { id: 'dashboard', slug: 'dashboard', label: 'Dashboard de Agua' },
  ],
  saneado: [
    { id: 'control', slug: 'control', label: 'Control de Saneado' },
  ],
};

export function defaultFormFor(page) {
  return FORM_NAV[page]?.[0]?.id || null;
}
