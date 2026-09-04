const API_BASE = '/api';

export async function fetchJson(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorDetail = 'Error en el servidor';
    try {
      const err = await res.json();
      errorDetail = err.detail || err.message || errorDetail;
    } catch (_) {}
    throw new Error(errorDetail);
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
export async function getControlesBebida() {
  return fetchJson('/control-bebida');
}

export async function submitControlBebida(payload) {
  return fetchJson('/control-bebida', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getControlesJarabe() {
  return fetchJson('/controles-jarabe');
}

export async function submitControlJarabe(payload) {
  return fetchJson('/controles-jarabe', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getControlesTorque() {
  return fetchJson('/controles-torque');
}

export async function submitControlTorque(payload) {
  return fetchJson('/controles-torque', {
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
    body: formData,
  });

  if (!res.ok) {
    let errorDetail = 'Error al parsear el archivo';
    try {
      const err = await res.json();
      errorDetail = err.detail || errorDetail;
    } catch (_) {}
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

export async function submitAreaSaneado(payload) {
  return submitSalaSaneado(payload);
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
