import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as api from './api';

// Helper: build a Response-like object without the network layer
function jsonResponse(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  };
}

function stubFetch(response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchJson (core transport)', () => {
  it('calls relative /api URLs and parses JSON on success', async () => {
    const fetchMock = stubFetch(jsonResponse({ data: [1, 2] }));

    await expect(api.fetchJson('/marcas')).resolves.toEqual({ data: [1, 2] });
    expect(fetchMock).toHaveBeenCalledWith('/api/marcas', {
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('propagates detail from a non-ok JSON error response', async () => {
    stubFetch(jsonResponse({ detail: 'Tanque inexistente' }, { ok: false, status: 404 }));

    await expect(api.fetchJson('/tanques')).rejects.toThrow('Tanque inexistente');
  });

  it('falls back to message field when detail is absent', async () => {
    stubFetch(jsonResponse({ message: 'boom' }, { ok: false, status: 500 }));

    await expect(api.fetchJson('/x')).rejects.toThrow('boom');
  });

  it('uses generic server error when error body is not JSON', async () => {
    stubFetch(
      Object.assign(jsonResponse({}, { ok: false }), {
        json: () => Promise.reject(new SyntaxError('not json')),
      })
    );

    await expect(api.fetchJson('/x')).rejects.toThrow('Error en el servidor');
  });

  it('forwards method and body options to fetch', async () => {
    const fetchMock = stubFetch(jsonResponse({ ok: true }));
    const payload = { sabor: 'COLA' };

    await api.fetchJson('/control-bebida', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual(payload);
    // default Content-Type header is applied
    expect(init.headers['Content-Type']).toBe('application/json');
  });
});

describe('catalog getters hit correct endpoints', () => {
  const catalogCases = [
    ['getMarcas', '/marcas'],
    ['getTiposConcentrado', '/tipos-concentrado'],
    ['getTamanos', '/tamanos'],
    ['getResponsables', '/responsables'],
    ['getResponsablesJarabe', '/responsables-jarabe'],
    ['getTanques', '/tanques'],
    ['getSabores', '/sabores'],
  ];

  it.each(catalogCases)('%s GETs /api%s and returns parsed body', async (fnName, endpoint) => {
    const fetchMock = stubFetch(jsonResponse([{ id: 1 }]));
    const result = await api[fnName]();
    expect(result).toEqual([{ id: 1 }]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`/api${endpoint}`);
    expect(init.method).toBeUndefined(); // default GET
  });
});

describe('quality control endpoints', () => {
  it('getControlesBebida GETs /api/control-bebida', async () => {
    const fetchMock = stubFetch(jsonResponse([]));
    await api.getControlesBebida();
    expect(fetchMock.mock.calls[0][0]).toBe('/api/control-bebida');
  });

  it('getControlesJarabe GETs /api/controles-jarabe', async () => {
    const fetchMock = stubFetch(jsonResponse([]));
    await api.getControlesJarabe();
    expect(fetchMock.mock.calls[0][0]).toBe('/api/controles-jarabe');
  });

  it('getControlesTorque GETs /api/controles-torque', async () => {
    const fetchMock = stubFetch(jsonResponse([]));
    await api.getControlesTorque();
    expect(fetchMock.mock.calls[0][0]).toBe('/api/controles-torque');
  });

  it('getPausas GETs /api/pausas', async () => {
    const fetchMock = stubFetch(jsonResponse([]));
    await api.getPausas();
    expect(fetchMock.mock.calls[0][0]).toBe('/api/pausas');
  });

  it.each([
    ['submitControlBebida', '/control-bebida'],
    ['submitControlJarabe', '/controles-jarabe'],
    ['submitControlTorque', '/controles-torque'],
    ['submitControlPausa', '/pausas'],
  ])('%s POSTs serialized JSON to /api%s', async (fnName, endpoint) => {
    const fetchMock = stubFetch(jsonResponse({ id: 9 }));
    const payload = { linea: 1, turno: 'Mañana' };

    const result = await api[fnName](payload);

    expect(result).toEqual({ id: 9 });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`/api${endpoint}`);
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body)).toEqual(payload);
  });
});

describe('jarabe production endpoints', () => {
  it('getJarabeSimples appends query string when params provided', async () => {
    const fetchMock = stubFetch(jsonResponse([]));
    await api.getJarabeSimples({ turno: 'Noche', linea: 'linea2' });
    const url = fetchMock.mock.calls[0][0];
    expect(url).toBe('/api/jarabe-simple?turno=Noche&linea=linea2');
  });

  it('getJarabeSimples omits query string when params empty', async () => {
    const fetchMock = stubFetch(jsonResponse([]));
    await api.getJarabeSimples();
    expect(fetchMock.mock.calls[0][0]).toBe('/api/jarabe-simple');
  });

  it.each([
    ['submitJarabeSimple', '/jarabe-simple'],
    ['submitJarabeTerminado', '/jarabe-terminado'],
    ['submitSaneoTanque', '/saneo-tanques'],
    ['submitParteJarabe', '/parte-jarabe'],
  ])('%s POSTs serialized JSON to /api%s', async (fnName, endpoint) => {
    const fetchMock = stubFetch(jsonResponse({ status: 'ok' }));
    const payload = { responsables: JSON.stringify(['Ana']) };

    const result = await api[fnName](payload);

    expect(result).toEqual({ status: 'ok' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`/api${endpoint}`);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual(payload);
  });
});

describe('parseJarabeExcel', () => {
  function makeFile() {
    return new File(['content'], 'planilla.xlsx', { type: 'application/vnd.ms-excel' });
  }

  it('POSTs FormData to /api/parse-jarabe-excel without Content-Type header', async () => {
    const fetchMock = stubFetch(jsonResponse({ rows: [] }));
    const file = makeFile();

    const result = await api.parseJarabeExcel(file);

    expect(result).toEqual({ rows: [] });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/parse-jarabe-excel');
    expect(init.method).toBe('POST');
    expect(init.body).toBeInstanceOf(FormData);
    // browser must set multipart boundary itself -> no explicit Content-Type
    expect(init.headers).toBeUndefined();
    expect(init.body.get('file')).toBe(file);
  });

  it('propagates detail from parse errors', async () => {
    stubFetch(jsonResponse({ detail: 'Formato inválido' }, { ok: false, status: 400 }));

    await expect(api.parseJarabeExcel(makeFile())).rejects.toThrow('Formato inválido');
  });

  it('uses parse-specific generic error when body is not JSON', async () => {
    stubFetch(
      Object.assign(jsonResponse({}, { ok: false, status: 500 }), {
        json: () => Promise.reject(new SyntaxError('nope')),
      })
    );

    await expect(api.parseJarabeExcel(makeFile())).rejects.toThrow(
      'Error al parsear el archivo'
    );
  });
});

describe('error propagation for POST submissions', () => {
  it('rejected promise from fetch propagates to caller', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    await expect(api.submitControlBebida({})).rejects.toThrow('network down');
  });
});
