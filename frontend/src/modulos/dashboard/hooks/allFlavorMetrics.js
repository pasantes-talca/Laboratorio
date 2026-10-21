import { PRODUCT_STANDARDS, findProductStandard } from '../../../data/productStandards';

export const ALL_FLAVORS = 'todos';
const COLORS = ['#0077B6', '#9D3BB0', '#CA650B', '#247D48', '#B93455', '#3861B7', '#8C661E', '#087F83', '#7948AF', '#B74A26', '#587E21', '#705244', '#407A99', '#A72E7E', '#435F67', '#6D6C1A'];

function productFor(record) {
  const name = record.marca || record.sabor || '';
  const normalized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  // The shared matcher defaults to Cola for unknown names; do not apply that
  // default to a combined view containing unidentified products.
  const standard = /cola|naranja|lima|limon|pomelo|manzana|soda|sifon/.test(normalized)
    ? findProductStandard(name, record.concentrado || record.tipo_concentrado || '') : null;
  const key = standard?.id || `otro-${normalized}-${record.concentrado || ''}`;
  const index = standard ? PRODUCT_STANDARDS.indexOf(standard) : [...key].reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return { standard, series: { key, label: standard?.sabor || name || 'Sabor sin identificar', color: COLORS[index % COLORS.length] } };
}

export function allFlavorMetrics({ bebidaData, jarabeData, torqueData, selectedLinea, selectedMes, selectedFecha }) {
  const line = selectedLinea === 'linea1' ? 1 : 2;
  const matches = record => record.linea === line && record.fecha && (selectedFecha !== 'todas'
    ? record.fecha === selectedFecha : selectedMes === 'todos' || record.fecha.startsWith(selectedMes));
  const chronological = records => [...records].sort((a, b) => `${a.fecha} ${a.hora || ''}`.localeCompare(`${b.fecha} ${b.hora || ''}`) || (a.id || 0) - (b.id || 0));
  const label = record => selectedFecha !== 'todas' ? record.hora?.slice(0, 5) || record.fecha : `${record.fecha.slice(8, 10)}/${record.fecha.slice(5, 7)} ${record.hora?.slice(0, 5) || ''}`.trim();
  const point = (record, product, limits) => ({
    label: label(record), fullTime: `${record.fecha} ${record.hora || ''}`.trim(),
    valor: null, valorSecundario: null,
    limiteMin: limits?.min ?? null, limiteMax: limits?.max ?? null, objetivo: limits?.objetivo ?? null,
    series: product.series, meta: { responsable: record.responsable, tanque: record.tanque, tamano: record.tamano, color: record.color },
  });
  const drinks = bebidaData.filter(matches);
  const syrups = jarabeData.filter(matches);
  const brix = [];
  const ta = [];
  const gas = [];
  for (const record of drinks) {
    const product = productFor(record);
    if (Number.isFinite(record.grados_brix) && (!product.standard || product.standard.brix)) {
      brix.push({ record, ...point(record, product, product.standard?.brix), valor: record.grados_brix });
    }
    if (Number.isFinite(record.vol_gas)) gas.push({ record, ...point(record, product, product.standard?.carbonatacion), valor: record.vol_gas });
  }
  for (const record of syrups) {
    const product = productFor(record);
    if (Number.isFinite(record.bx_patron) && (!product.standard || product.standard.brix)) {
      brix.push({ record, ...point(record, product, product.standard?.brix), valorSecundario: record.bx_patron });
    }
    if (Number.isFinite(record.ta) && (!product.standard || product.standard.ta)) {
      ta.push({ record, ...point(record, product, product.standard?.ta), valor: record.ta });
    }
  }
  const sortedPoints = points => points.sort((a, b) => `${a.record.fecha} ${a.record.hora || ''}`.localeCompare(`${b.record.fecha} ${b.record.hora || ''}`) || (a.record.id || 0) - (b.record.id || 0)).map(({ record: _record, ...rest }) => rest);
  const heads = line === 1 ? 12 : 14;
  const byProduct = new Map();
  for (const record of chronological(torqueData.filter(matches))) {
    const head = Number(record.numero_cabezal);
    if (!Number.isInteger(head) || head < 1 || head > heads || !Number.isFinite(record.valor)) continue;
    const product = productFor(record);
    if (!byProduct.has(product.series.key)) byProduct.set(product.series.key, { product, records: new Map() });
    byProduct.get(product.series.key).records.set(head, record);
  }
  const torque = [];
  for (const { product, records } of byProduct.values()) {
    const limits = product.standard?.[line === 1 ? 'torqueLong' : 'torqueShort'];
    for (let head = 1; head <= heads; head++) {
      const record = records.get(head);
      torque.push({ ...(record ? point(record, product, limits) : {
        series: product.series, valorSecundario: null,
        limiteMin: limits?.min ?? null, limiteMax: limits?.max ?? null, objetivo: limits?.objetivo ?? null,
      }), label: String(head), valor: record?.valor ?? null });
    }
  }
  return { brixChartData: sortedPoints(brix), taChartData: sortedPoints(ta), carbonatacionChartData: sortedPoints(gas), torqueChartData: torque };
}
