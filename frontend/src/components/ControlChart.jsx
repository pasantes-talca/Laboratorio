import React, { useState, useId } from 'react';

/**
 * ControlChart - Gráfico de control de calidad según diseño oficial.
 * 
 * Props:
 * - type: 'time' | 'cab'
 * - title: string
 * - data: Array<{ label: string, valor: number | null, limiteMin?: number, limiteMax?: number, objetivo?: number }>
 * - staticLimits?: { min: number, max: number, objetivo: number }
 * - yAxisLabel?: string
 * - xAxisLabel?: string
 * - unit?: string
 * - yMinManual?: number
 * - yMaxManual?: number
 * - notApplicable?: boolean
 * - notApplicableMessage?: string
 * - valorSecundarioLabel?: string
 */
export default function ControlChart({
  type = 'time',
  title,
  data = [],
  staticLimits = null,
  yAxisLabel = 'VALOR | LIMITE_MIN | LIMITE_MAX | OBJETIVO',
  xAxisLabel = type === 'cab' ? 'CAB' : 'FECHA_HORA',
  unit = '',
  yMinManual = null,
  yMaxManual = null,
  notApplicable = false,
  notApplicableMessage = 'No aplica para este producto',
  valorSecundarioLabel = 'PATRON',
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const chartId = useId();

  if (notApplicable) {
    return (
      <div className="control-chart-container">
        {title && <div className="control-chart-title">{title}</div>}
        <div className="control-chart-na-box">
          <div className="control-chart-na-badge">N/A</div>
          <p>{notApplicableMessage}</p>
        </div>
      </div>
    );
  }

  // Dimensiones del SVG
  const width = 800;
  const height = 380;
  const padding = {
    top: 50,
    right: 35,
    bottom: type === 'cab' ? 45 : 65,
    left: 70,
  };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Filtrar o normalizar puntos de datos
  const points = data.map((d, index) => {
    const minLim = d.limiteMin ?? staticLimits?.min ?? null;
    const maxLim = d.limiteMax ?? staticLimits?.max ?? null;
    const obj = d.objetivo ?? staticLimits?.objetivo ?? null;
    return {
      index,
      label: d.label || (type === 'cab' ? `${index + 1}` : ''),
      fullTime: d.fullTime || d.label,
      valor: d.valor !== null && d.valor !== undefined && !isNaN(d.valor) ? Number(d.valor) : null,
      valorSecundario: d.valorSecundario !== null && d.valorSecundario !== undefined && !isNaN(d.valorSecundario) ? Number(d.valorSecundario) : null,
      limiteMin: minLim !== null ? Number(minLim) : null,
      limiteMax: maxLim !== null ? Number(maxLim) : null,
      objetivo: obj !== null ? Number(obj) : null,
      meta: d.meta || {},
    };
  });

  // Calcular rango Y
  let allYValues = [];
  points.forEach((p) => {
    if (p.valor !== null) allYValues.push(p.valor);
    if (p.valorSecundario !== null) allYValues.push(p.valorSecundario);
    if (p.limiteMin !== null) allYValues.push(p.limiteMin);
    if (p.limiteMax !== null) allYValues.push(p.limiteMax);
    if (p.objetivo !== null) allYValues.push(p.objetivo);
  });

  if (staticLimits) {
    if (staticLimits.min !== null && staticLimits.min !== undefined) allYValues.push(staticLimits.min);
    if (staticLimits.max !== null && staticLimits.max !== undefined) allYValues.push(staticLimits.max);
    if (staticLimits.objetivo !== null && staticLimits.objetivo !== undefined) allYValues.push(staticLimits.objetivo);
  }

  let yMin = yMinManual !== null ? yMinManual : (allYValues.length ? Math.min(...allYValues) : 0);
  let yMax = yMaxManual !== null ? yMaxManual : (allYValues.length ? Math.max(...allYValues) : 10);

  if (yMin === yMax) {
    yMin -= 1;
    yMax += 1;
  } else {
    const range = yMax - yMin;
    const yMargin = Math.max(range * 0.15, 0.4);
    if (yMinManual === null) yMin = Math.floor((yMin - yMargin) * 10) / 10;
    if (yMaxManual === null) yMax = Math.ceil((yMax + yMargin) * 10) / 10;
  }

  // Generar ticks para eje Y (5 a 6 ticks limpios)
  const yTicksCount = 5;
  const yStep = (yMax - yMin) / (yTicksCount - 1);
  const yTicks = Array.from({ length: yTicksCount }, (_, i) => {
    const val = yMin + i * yStep;
    return Math.round(val * 100) / 100;
  });

  // Funciones de escala
  const scaleY = (val) => {
    if (val === null || val === undefined || isNaN(val)) return null;
    const clamped = Math.max(yMin, Math.min(yMax, val));
    const ratio = (clamped - yMin) / (yMax - yMin);
    return padding.top + chartHeight - ratio * chartHeight;
  };

  const scaleX = (index) => {
    if (points.length <= 1) return padding.left + chartWidth / 2;
    const step = chartWidth / (points.length - 1);
    return padding.left + index * step;
  };

  // Coordenadas calculadas
  const computedPoints = points.map((p, idx) => ({
    ...p,
    x: scaleX(idx),
    yVal: scaleY(p.valor),
    ySec: scaleY(p.valorSecundario),
    yMin: scaleY(p.limiteMin),
    yMax: scaleY(p.limiteMax),
    yObj: scaleY(p.objetivo),
  }));

  // Generar Paths para SVG
  const generatePath = (yKey) => {
    const valid = computedPoints.filter((p) => p[yKey] !== null);
    if (valid.length === 0) return '';
    return valid.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p[yKey]}`).join(' ');
  };

  const pathValor = computedPoints
    .filter((p) => p.yVal !== null)
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.yVal}`)
    .join(' ');

  const pathValorSecundario = computedPoints
    .filter((p) => p.ySec !== null)
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.ySec}`)
    .join(' ');

  const pathLimiteMin = generatePath('yMin');
  const pathLimiteMax = generatePath('yMax');
  const pathObjetivo = generatePath('yObj');

  const hasData = points.some((p) => p.valor !== null || p.valorSecundario !== null);
  const hasSecondaryData = points.some((p) => p.valorSecundario !== null);

  return (
    <div className="control-chart-container">
      {title && (
        <div className="control-chart-header">
          <h4 className="control-chart-title">{title}</h4>
          {hasData && (
            <div className="control-chart-points-count">
              {type === 'cab' ? `${points.filter(p => p.valor !== null).length} cabezales medidos` : `${points.filter(p => p.valor !== null).length} mediciones`}
            </div>
          )}
        </div>
      )}

      {/* Leyenda superior oficial */}
      <div className="control-chart-legend">
        <div className="legend-item">
          <span className="legend-symbol symbol-valor">
            <span className="dot" />
            <span className="line" />
          </span>
          <span className="legend-text">VALOR</span>
        </div>

        {hasSecondaryData && (
          <div className="legend-item">
            <span className="legend-symbol" style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0077B6' }} />
              <span style={{ width: '16px', height: '2px', backgroundColor: '#0077B6', marginLeft: '-12px' }} />
            </span>
            <span className="legend-text">{valorSecundarioLabel}</span>
          </div>
        )}

        <div className="legend-item">
          <span className="legend-symbol symbol-min" />
          <span className="legend-text">LIMITE_MIN</span>
        </div>

        <div className="legend-item">
          <span className="legend-symbol symbol-max" />
          <span className="legend-text">LIMITE_MAX</span>
        </div>

        <div className="legend-item">
          <span className="legend-symbol symbol-obj" />
          <span className="legend-text">OBJETIVO</span>
        </div>
      </div>

      {/* Lienzo SVG */}
      <div className="control-chart-svg-wrapper">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="control-chart-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Fondo del área de datos */}
          <rect
            x={padding.left}
            y={padding.top}
            width={chartWidth}
            height={chartHeight}
            fill="#ffffff"
            stroke="#262626"
            strokeWidth="1.2"
          />

          {/* Rejilla Horizontal punteada (Grid Y) */}
          {yTicks.map((tickVal, i) => {
            const yPos = scaleY(tickVal);
            return (
              <g key={`ytick-${i}`}>
                <line
                  x1={padding.left}
                  y1={yPos}
                  x2={padding.left + chartWidth}
                  y2={yPos}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 10}
                  y={yPos + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#1A202C"
                  fontWeight="600"
                  fontFamily="'Inter', sans-serif"
                >
                  {tickVal.toFixed(Number.isInteger(tickVal) ? 0 : 2)}
                </text>
              </g>
            );
          })}

          {/* Rejilla Vertical punteada (Grid X) */}
          {computedPoints.map((p, i) => (
            <g key={`xtick-${i}`}>
              <line
                x1={p.x}
                y1={padding.top}
                x2={p.x}
                y2={padding.top + chartHeight}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* Marca del eje */}
              <line
                x1={p.x}
                y1={padding.top + chartHeight}
                x2={p.x}
                y2={padding.top + chartHeight + 5}
                stroke="#0F2C45"
                strokeWidth="1.2"
              />
              {/* Etiqueta X */}
              <text
                x={p.x}
                y={padding.top + chartHeight + (type === 'cab' ? 18 : 16)}
                textAnchor={type === 'cab' ? 'middle' : 'end'}
                transform={type === 'cab' ? undefined : `rotate(-38, ${p.x}, ${padding.top + chartHeight + 16})`}
                fontSize={type === 'cab' ? '11' : '10'}
                fill="#1A202C"
                fontWeight="600"
                fontFamily="'Inter', sans-serif"
              >
                {p.label}
              </text>
            </g>
          ))}

          {/* Líneas de Límites y Objetivo */}
          {pathLimiteMin && (
            <path
              d={pathLimiteMin}
              fill="none"
              stroke="#E53E3E"
              strokeWidth="1.6"
              strokeDasharray="6 4"
            />
          )}
          {pathLimiteMax && (
            <path
              d={pathLimiteMax}
              fill="none"
              stroke="#E53E3E"
              strokeWidth="1.6"
              strokeDasharray="6 4"
            />
          )}
          {pathObjetivo && (
            <path
              d={pathObjetivo}
              fill="none"
              stroke="#2F855A"
              strokeWidth="1.8"
              strokeDasharray="6 4"
            />
          )}

          {/* Línea de VALOR (Verde Bosque Estructural #40675D) */}
          {pathValor && (
            <path
              d={pathValor}
              fill="none"
              stroke="#0077B6"
              strokeWidth="2.4"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {/* Línea de VALOR SECUNDARIO (Celeste Dinámico #78C0E0) */}
          {pathValorSecundario && (
            <path
              d={pathValorSecundario}
              fill="none"
              stroke="#E31B23"
              strokeWidth="2.2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {/* Nodos de VALOR (Círculos #40675D) */}
          {computedPoints.map((p, i) => {
            if (p.yVal === null) return null;
            const isHovered = hoveredPoint?.index === p.index;
            const isOutOfSpec =
              (p.limiteMin !== null && p.valor < p.limiteMin) ||
              (p.limiteMax !== null && p.valor > p.limiteMax);

            return (
              <g
                key={`node-${i}`}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Zona de hover invisible más grande */}
                <circle cx={p.x} cy={p.yVal} r={14} fill="transparent" />

                {/* Halo de alerta si está fuera de especificación */}
                {isOutOfSpec && (
                  <circle
                    cx={p.x}
                    cy={p.yVal}
                    r={8}
                    fill="none"
                    stroke="#E53E3E"
                    strokeWidth="2"
                    strokeDasharray="2 2"
                    opacity="0.85"
                  />
                )}

                {/* Nodo principal */}
                <circle
                  cx={p.x}
                  cy={p.yVal}
                  r={isHovered ? 6 : 4}
                  fill="#0077B6"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  style={{ transition: 'r 0.15s ease' }}
                />
              </g>
            );
          })}

          {/* Nodos de VALOR SECUNDARIO (Círculos #78C0E0) */}
          {computedPoints.map((p, i) => {
            if (p.ySec === null) return null;
            const isHovered = hoveredPoint?.index === p.index;

            return (
              <g
                key={`node-sec-${i}`}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Zona de hover invisible más grande */}
                <circle cx={p.x} cy={p.ySec} r={14} fill="transparent" />

                {/* Nodo principal */}
                <circle
                  cx={p.x}
                  cy={p.ySec}
                  r={isHovered ? 6 : 4}
                  fill="#E31B23"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  style={{ transition: 'r 0.15s ease' }}
                />
              </g>
            );
          })}

          {/* Label Eje Y Vertical rotado */}
          <text
            x={-(padding.top + chartHeight / 2)}
            y={22}
            transform="rotate(-90)"
            textAnchor="middle"
            fontSize="10.5"
            fill="#1A202C"
            fontWeight="700"
            letterSpacing="0.5px"
            fontFamily="'Inter', sans-serif"
          >
            {yAxisLabel}
          </text>

          {/* Label Eje X Horizontal centrado */}
          <text
            x={padding.left + chartWidth / 2}
            y={height - (type === 'cab' ? 10 : 8)}
            textAnchor="middle"
            fontSize="11"
            fill="#1A202C"
            fontWeight="700"
            letterSpacing="0.5px"
            fontFamily="'Inter', sans-serif"
          >
            {xAxisLabel}
          </text>

          {/* Mensaje de Sin Datos si no hay mediciones */}
          {!hasData && (
            <text
              x={padding.left + chartWidth / 2}
              y={padding.top + chartHeight / 2}
              textAnchor="middle"
              fontSize="13"
              fill="#94a3b8"
              fontWeight="600"
            >
              Sin mediciones registradas en este período
            </text>
          )}
        </svg>

        {/* Tooltip flotante interactivo */}
        {hoveredPoint && (
          <div
            className="chart-tooltip-popup"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.yVal / height) * 100}%`,
            }}
          >
            <div className="tooltip-title">
              {type === 'cab' ? `Cabezal #${hoveredPoint.label}` : hoveredPoint.fullTime}
            </div>
            {hoveredPoint.valor !== null && (
              <div className="tooltip-row highlight">
                <span>Valor Medido:</span>
                <strong>
                  {hoveredPoint.valor} {unit}
                </strong>
              </div>
            )}
            {hoveredPoint.valorSecundario !== null && (
              <div className="tooltip-row highlight" style={{ color: '#0077B6' }}>
                <span>{valorSecundarioLabel}:</span>
                <strong>
                  {hoveredPoint.valorSecundario} {unit}
                </strong>
              </div>
            )}
            {hoveredPoint.objetivo !== null && (
              <div className="tooltip-row">
                <span>Objetivo:</span>
                <span>
                  {hoveredPoint.objetivo} {unit}
                </span>
              </div>
            )}
            {hoveredPoint.limiteMin !== null && hoveredPoint.limiteMax !== null && (
              <div className="tooltip-row">
                <span>Rango Permitido:</span>
                <span>
                  {hoveredPoint.limiteMin} - {hoveredPoint.limiteMax} {unit}
                </span>
              </div>
            )}
            {hoveredPoint.meta?.responsable && (
              <div className="tooltip-row" style={{ marginTop: '4px', opacity: 0.8, fontSize: '0.75rem' }}>
                <span>Resp: {hoveredPoint.meta.responsable}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
