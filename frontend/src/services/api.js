import { fetchJson, request } from './httpClient';
export { fetchJson } from './httpClient';

// Master Catalogs
export async function getMarcas() {
  return fetchJson('/marcas');
}

export async function getTiposConcentrado() {
  return fetchJson('/tipos-concentrado');
}

export async function getTamanos() {
  return fetchJson('/tamanos');
}

export async function getResponsables() {
  return fetchJson('/responsables');
}

export async function getResponsablesJarabe() {
  return fetchJson('/responsables-jarabe');
}

export async function getTanques() {
  return fetchJson('/tanques');
}

export async function getSabores() {
  return fetchJson('/sabores');
}

// Quality Control endpoints
export async function getActiveProduction(line) {
  return fetchJson(`/calidad/produccion/${line}`);
}

export async function saveActiveProduction(line, payload) {
  return fetchJson(`/calidad/produccion/${line}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function getControlesBebida(params = {}) {
  const query = new URLSearchParams(params).toString();
  return fetchJson(`/calidad/bebidas${query ? '?' + query : ''}`);
}

export async function submitControlBebida(payload) {
  return fetchJson('/calidad/bebidas', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getControlesJarabe(params = {}) {
  const query = new URLSearchParams(params).toString();
  return fetchJson(`/calidad/jarabe${query ? '?' + query : ''}`);
}

export async function submitControlJarabe(payload) {
  return fetchJson('/calidad/jarabe', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getControlesTorque(params = {}) {
  const query = new URLSearchParams(params).toString();
  return fetchJson(`/calidad/torque${query ? '?' + query : ''}`);
}

export async function submitControlTorque(payload) {
  return fetchJson('/calidad/torque', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getPausas() {
  return fetchJson('/pausas');
}

export async function submitControlPausa(payload) {
  return fetchJson('/pausas', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Jarabe Production endpoints
export async function getJarabeSimples(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return fetchJson(`/jarabe-simple${qs ? '?' + qs : ''}`);
}

export async function submitJarabeSimple(payload) {
  return fetchJson('/jarabe-simple', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function submitJarabeTerminado(payload) {
  return fetchJson('/jarabe-terminado', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function submitSaneoTanque(payload) {
  return fetchJson('/saneo-tanques', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function submitParteJarabe(payload) {
  return fetchJson('/parte-jarabe', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Parse Excel / HTML file
export async function parseJarabeExcel(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    return await fetchJson('/parse-jarabe-excel', { method: 'POST', body: formData });
  } catch (error) {
    if (error.message === 'Error en el servidor') error.message = 'Error al parsear el archivo';
    throw error;
  }
}

// Agua endpoints
export async function submitControlFisicoQuimico(payload) {
  return fetchJson('/agua/fisico-quimico', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function submitSalaSaneado(payload) {
  return fetchJson('/saneado/sala-saneado', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function submitAnalisisCloro(payload) {
  return fetchJson('/agua/analisis-cloro', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function submitOsmosisInversa(payload) {
  return fetchJson('/agua/osmosis-inversa', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function submitFiltroArena(payload) {
  return fetchJson('/agua/filtro-arena', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function downloadQualityCsv() {
  const response = await request('/reportes/calidad.csv');
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'controles-calidad.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}
