// Estándar de Productos - Fórmula Nueva (BPM)
// Tabla oficial de tolerancias y objetivos de laboratorio

export const PRODUCT_STANDARDS = [
  {
    id: 'sifon',
    marca: 'TALCA',
    sabor: 'SIFÓN',
    concentrado: '',
    brix: null, // No aplica
    ta: null,   // No aplica
    carbonatacion: {
      objetivo: 5.2,
      min: 4.7,
      max: 5.7,
      tolerancia: '±0.5',
    },
    torqueLong: {
      min: 110,
      max: 120,
      objetivo: 115,
      rango: '110 - 120',
    },
    torqueShort: null,
    vencimiento: '6 Meses',
  },
  {
    id: 'soda',
    marca: 'TALCA',
    sabor: 'SODA',
    concentrado: '',
    brix: null, // No aplica
    ta: null,   // No aplica
    carbonatacion: {
      objetivo: 4.2,
      min: 3.7,
      max: 4.7,
      tolerancia: '±0.5',
    },
    torqueLong: {
      min: 15,
      max: 20,
      objetivo: 17.5,
      rango: '15 - 20',
    },
    torqueShort: null,
    vencimiento: '6 Meses',
  },
  // GIVAUDAN
  {
    id: 'cola-xq',
    marca: 'TALCA',
    sabor: 'COLA Red. XQ',
    grupo: 'GIVAUDAN',
    concentrado: 'XQ',
    brix: {
      objetivo: 7.60,
      min: 7.40,
      max: 8.10,
      tolerancia: '+0.5 / -0.2',
    },
    ta: {
      objetivo: 14.0,
      min: 13.0,
      max: 15.0,
      tolerancia: '±1',
    },
    carbonatacion: {
      objetivo: 4.2,
      min: 4.0,
      max: 4.7,
      tolerancia: '+0.5 / -0.2',
    },
    torqueLong: { min: 15, max: 20, objetivo: 17.5, rango: '15 - 20' },
    torqueShort: { min: 13, max: 17, objetivo: 15.0, rango: '15 ± 2' },
    vencimiento: '6 Meses',
  },
  {
    id: 'cola-kg',
    marca: 'TALCA',
    sabor: 'COLA Red. KG',
    grupo: 'GIVAUDAN',
    concentrado: 'KG',
    brix: {
      objetivo: 7.60,
      min: 7.40,
      max: 8.10,
      tolerancia: '+0.5 / -0.2',
    },
    ta: {
      objetivo: 14.0,
      min: 13.0,
      max: 15.0,
      tolerancia: '±1',
    },
    carbonatacion: {
      objetivo: 4.2,
      min: 4.0,
      max: 4.7,
      tolerancia: '+0.5 / -0.2',
    },
    torqueLong: { min: 15, max: 20, objetivo: 17.5, rango: '15 - 20' },
    torqueShort: { min: 13, max: 17, objetivo: 15.0, rango: '15 ± 2' },
    vencimiento: '6 Meses',
  },
  {
    id: 'naranja-givaudan',
    marca: 'TALCA',
    sabor: 'NARANJA Red. BA',
    grupo: 'GIVAUDAN',
    concentrado: 'GIVAUDAN',
    brix: {
      objetivo: 8.10,
      min: 7.90,
      max: 8.60,
      tolerancia: '+0.5 / -0.2',
    },
    ta: {
      objetivo: 34.0,
      min: 33.0,
      max: 35.0,
      tolerancia: '±1',
    },
    carbonatacion: {
      objetivo: 3.4,
      min: 3.2,
      max: 3.9,
      tolerancia: '+0.5 / -0.2',
    },
    torqueLong: { min: 15, max: 20, objetivo: 17.5, rango: '15 - 20' },
    torqueShort: { min: 13, max: 17, objetivo: 15.0, rango: '15 ± 2' },
    vencimiento: '6 Meses',
  },
  {
    id: 'lima-limon-givaudan',
    marca: 'TALCA',
    sabor: 'LIMA LIMÓN Red. TP',
    grupo: 'GIVAUDAN',
    concentrado: 'GIVAUDAN',
    brix: {
      objetivo: 10.06,
      min: 9.86,
      max: 10.56,
      tolerancia: '+0.5 / -0.2',
    },
    ta: {
      objetivo: 36.0,
      min: 35.0,
      max: 37.0,
      tolerancia: '±1',
    },
    carbonatacion: {
      objetivo: 4.2,
      min: 4.0,
      max: 4.7,
      tolerancia: '+0.5 / -0.2',
    },
    torqueLong: { min: 15, max: 20, objetivo: 17.5, rango: '15 - 20' },
    torqueShort: { min: 13, max: 17, objetivo: 15.0, rango: '15 ± 2' },
    vencimiento: '6 Meses',
  },
  {
    id: 'pomelo-givaudan',
    marca: 'TALCA',
    sabor: 'POMELO BA',
    grupo: 'GIVAUDAN',
    concentrado: 'GIVAUDAN',
    brix: {
      objetivo: 7.30,
      min: 7.10,
      max: 7.80,
      tolerancia: '+0.5 / -0.2',
    },
    ta: {
      objetivo: 44.0,
      min: 43.0,
      max: 45.0,
      tolerancia: '±1',
    },
    carbonatacion: {
      objetivo: 3.4,
      min: 3.2,
      max: 3.9,
      tolerancia: '+0.5 / -0.2',
    },
    torqueLong: { min: 15, max: 20, objetivo: 17.5, rango: '15 - 20' },
    torqueShort: { min: 13, max: 17, objetivo: 15.0, rango: '15 ± 2' },
    vencimiento: '6 Meses',
  },
  // IFF
  {
    id: 'cola-iff',
    marca: 'TALCA',
    sabor: 'COLA Red. IFF',
    grupo: 'IFF',
    concentrado: 'IFF',
    brix: {
      objetivo: 7.60,
      min: 7.40,
      max: 8.10,
      tolerancia: '+0.5 / -0.2',
    },
    ta: {
      objetivo: 14.0,
      min: 13.0,
      max: 15.0,
      tolerancia: '±1',
    },
    carbonatacion: {
      objetivo: 4.2,
      min: 4.0,
      max: 4.7,
      tolerancia: '+0.5 / -0.2',
    },
    torqueLong: { min: 15, max: 20, objetivo: 17.5, rango: '15 - 20' },
    torqueShort: { min: 13, max: 17, objetivo: 15.0, rango: '15 ± 2' },
    vencimiento: '6 Meses',
  },
  {
    id: 'naranja-iff',
    marca: 'TALCA',
    sabor: 'NARANJA Red. IFF',
    grupo: 'IFF',
    concentrado: 'IFF',
    brix: {
      objetivo: 8.10,
      min: 7.90,
      max: 8.60,
      tolerancia: '+0.5 / -0.2',
    },
    ta: {
      objetivo: 30.0,
      min: 29.0,
      max: 31.0,
      tolerancia: '±1',
    },
    carbonatacion: {
      objetivo: 3.4,
      min: 3.2,
      max: 3.9,
      tolerancia: '+0.5 / -0.2',
    },
    torqueLong: { min: 15, max: 20, objetivo: 17.5, rango: '15 - 20' },
    torqueShort: { min: 13, max: 17, objetivo: 15.0, rango: '15 ± 2' },
    vencimiento: '6 Meses',
  },
  {
    id: 'lima-limon-iff',
    marca: 'TALCA',
    sabor: 'LIMA LIMÓN Red. IFF',
    grupo: 'IFF',
    concentrado: 'IFF',
    brix: {
      objetivo: 8.30,
      min: 8.10,
      max: 8.80,
      tolerancia: '+0.5 / -0.2',
    },
    ta: {
      objetivo: 36.0,
      min: 35.0,
      max: 37.0,
      tolerancia: '±1',
    },
    carbonatacion: {
      objetivo: 4.2,
      min: 4.0,
      max: 4.7,
      tolerancia: '+0.5 / -0.2',
    },
    torqueLong: { min: 15, max: 20, objetivo: 17.5, rango: '15 - 20' },
    torqueShort: { min: 13, max: 17, objetivo: 15.0, rango: '15 ± 2' },
    vencimiento: '6 Meses',
  },
  {
    id: 'pomelo-iff',
    marca: 'TALCA',
    sabor: 'POMELO Red. IFF',
    grupo: 'IFF',
    concentrado: 'IFF',
    brix: {
      objetivo: 7.30,
      min: 7.10,
      max: 7.80,
      tolerancia: '+0.5 / -0.2',
    },
    ta: {
      objetivo: 44.0,
      min: 43.0,
      max: 45.0,
      tolerancia: '±1',
    },
    carbonatacion: {
      objetivo: 3.4,
      min: 3.2,
      max: 3.9,
      tolerancia: '+0.5 / -0.2',
    },
    torqueLong: { min: 15, max: 20, objetivo: 17.5, rango: '15 - 20' },
    torqueShort: { min: 13, max: 17, objetivo: 15.0, rango: '15 ± 2' },
    vencimiento: '6 Meses',
  },
  // OTRAS
  {
    id: 'manzana',
    marca: 'TALCA',
    sabor: 'MANZANA',
    grupo: 'OTRAS',
    concentrado: '',
    brix: {
      objetivo: 7.41,
      min: 7.21,
      max: 7.91,
      tolerancia: '+0.5 / -0.2',
    },
    ta: {
      objetivo: 20.5,
      min: 19.5,
      max: 21.5,
      tolerancia: '±1',
    },
    carbonatacion: {
      objetivo: 3.5,
      min: 3.3,
      max: 4.0,
      tolerancia: '+0.5 / -0.2',
    },
    torqueLong: { min: 15, max: 20, objetivo: 17.5, rango: '15 - 20' },
    torqueShort: { min: 13, max: 17, objetivo: 15.0, rango: '15 ± 2' },
    vencimiento: '6 Meses',
  },
];

// Helper to normalize strings for robust matching
function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Encuentra el estándar correspondiente dado un sabor y concentrado.
 */
export function findProductStandard(sabor, concentrado = '') {
  if (!sabor) return PRODUCT_STANDARDS.find(p => p.id === 'cola-xq'); // Default COLA XQ
  
  const normSabor = normalize(sabor);
  const normConc = normalize(concentrado);

  // Exact or close match
  if (normSabor.includes('sifon')) return PRODUCT_STANDARDS.find(p => p.id === 'sifon');
  if (normSabor.includes('soda')) return PRODUCT_STANDARDS.find(p => p.id === 'soda');
  if (normSabor.includes('manzana')) return PRODUCT_STANDARDS.find(p => p.id === 'manzana');

  // Route Cola by concentrado: XQ or KG → separate entries; IFF
  if (normSabor.includes('cola')) {
    if (normSabor.includes('iff') || normConc.includes('iff')) {
      return PRODUCT_STANDARDS.find(p => p.id === 'cola-iff');
    }
    if (normConc.includes('kg') || normSabor.includes('kg')) {
      return PRODUCT_STANDARDS.find(p => p.id === 'cola-kg');
    }
    // Default Cola (XQ or unspecified)
    return PRODUCT_STANDARDS.find(p => p.id === 'cola-xq');
  }

  if (normSabor.includes('naranja')) {
    if (normSabor.includes('iff') || normConc.includes('iff')) {
      return PRODUCT_STANDARDS.find(p => p.id === 'naranja-iff');
    }
    return PRODUCT_STANDARDS.find(p => p.id === 'naranja-givaudan');
  }

  if (normSabor.includes('lima') || normSabor.includes('limon')) {
    if (normSabor.includes('iff') || normConc.includes('iff')) {
      return PRODUCT_STANDARDS.find(p => p.id === 'lima-limon-iff');
    }
    return PRODUCT_STANDARDS.find(p => p.id === 'lima-limon-givaudan');
  }

  if (normSabor.includes('pomelo')) {
    if (normSabor.includes('iff') || normConc.includes('iff')) {
      return PRODUCT_STANDARDS.find(p => p.id === 'pomelo-iff');
    }
    return PRODUCT_STANDARDS.find(p => p.id === 'pomelo-givaudan');
  }

  // Fallback match by closest name
  const match = PRODUCT_STANDARDS.find(p => normalize(p.sabor).includes(normSabor) || normSabor.includes(normalize(p.sabor)));
  return match || PRODUCT_STANDARDS[2];
}
