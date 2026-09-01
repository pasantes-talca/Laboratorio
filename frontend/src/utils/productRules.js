// Reglas de negocio para Producción Activa: tipos de concentrado y tamaños válidos por sabor

export const SABOR_CONCENTRADOS_MAP = {
  cola: ['XQ', 'KG', 'IFF'],
  pomelo: ['IFF', 'TP', 'BA'],
  lima: ['IFF', 'TP', 'BA'],
  naranja: ['IFF', 'TP', 'BA'],
  manzana: ['IFF', 'TP', 'BA', 'XQ', 'KG'],
  soda: ['TALCA'],
  sifon: ['TALCA'],
};

export const SABOR_TAMANOS_MAP = {
  cola: ['3L', '2,25L', '500ml'],
  pomelo: ['3L', '2,25L', '500ml'],
  lima: ['3L', '2,25L', '500ml'],
  naranja: ['3L', '2,25L', '500ml'],
  manzana: ['3L', '2,25L', '500ml'],
  soda: ['2,25L', '500ml'],
  sifon: ['2L'],
};

export function getNormalizedSaborKey(sabor) {
  if (!sabor || typeof sabor !== 'string') return '';
  const norm = sabor.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  for (const key of Object.keys(SABOR_CONCENTRADOS_MAP)) {
    if (norm.includes(key)) return key;
  }
  return norm;
}

export function getConcentradosForSabor(sabor) {
  const key = getNormalizedSaborKey(sabor);
  return SABOR_CONCENTRADOS_MAP[key] || [];
}

export function getTamanosForSabor(sabor) {
  const key = getNormalizedSaborKey(sabor);
  return SABOR_TAMANOS_MAP[key] || ['3L', '2,25L', '2L', '500ml'];
}
