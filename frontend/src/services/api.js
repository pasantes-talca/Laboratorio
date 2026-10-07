const API_BASE = '/api';

export async function fetchJson(endpoint, options = {}) {
  const apiKey = import.meta.env.VITE_API_KEY;
  const user = localStorage.getItem('laboratorio_user') || 'operador-web';
  const role = localStorage.getItem('laboratorio_role') || 'operador';
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'X-API-Key': apiKey } : {}),
      'X-User': user,
      'X-Role': role,
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorDetail = 'Error en el servidor';
    try {
      const err = await res.json();
      errorDetail = err.detail || err.message || errorDetail;
    } catch {}
    const error = new Error(typeof errorDetail === 'string' ? errorDetail : JSON.stringify(errorDetail));
    error.status = res.status;
    throw error;
  }

  return res.json();
}

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

export async function getControlesBebida() {
  return fetchJson('/calidad/bebidas');
}

export async function submitControlBebida(payload) {
  return fetchJson('/calidad/bebidas', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getControlesJarabe() {
  return fetchJson('/calidad/jarabe');
}

export async function submitControlJarabe(payload) {
  return fetchJson('/calidad/jarabe', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getControlesTorque() {
  return fetchJson('/calidad/torque');
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
  
  const res = await fetch(`${API_BASE}/parse-jarabe-excel`, {
    method: 'POST',
    headers: {
      ...(import.meta.env.VITE_API_KEY ? { 'X-API-Key': import.meta.env.VITE_API_KEY } : {}),
      'X-User': localStorage.getItem('laboratorio_user') || 'operador-web',
      'X-Role': localStorage.getItem('laboratorio_role') || 'operador',
    },
    body: formData,
  });

  if (!res.ok) {
    let errorDetail = 'Error al parsear el archivo';
    try {
      const err = await res.json();
      errorDetail = err.detail || errorDetail;
    } catch {}
    throw new Error(errorDetail);
  }

  return res.json();
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
  const headers = {
    ...(import.meta.env.VITE_API_KEY ? { 'X-API-Key': import.meta.env.VITE_API_KEY } : {}),
    'X-User': localStorage.getItem('laboratorio_user') || 'operador-web',
    'X-Role': localStorage.getItem('laboratorio_role') || 'operador',
  };
  const response = await fetch(`${API_BASE}/reportes/calidad.csv`, { headers });
  if (!response.ok) throw new Error('No se pudo exportar el reporte');
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'controles-calidad.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}
