// Single source of truth for production line settings.
// Line 3 shares line 2 standards (short finish) but has 16 torque heads.
export const LINE_CONFIG = {
  linea1: { number: 1, label: 'Línea 1', finish: 'long', finishLabel: 'Long finish', cabezales: 12 },
  linea2: { number: 2, label: 'Línea 2', finish: 'short', finishLabel: 'Short finish', cabezales: 14 },
  linea3: { number: 3, label: 'Línea 3', finish: 'short', finishLabel: 'Short finish', cabezales: 16 },
};

export const LINE_IDS = Object.keys(LINE_CONFIG);

export const isLineId = (line) => Object.prototype.hasOwnProperty.call(LINE_CONFIG, line);

export const getLineConfig = (line) => LINE_CONFIG[line] || LINE_CONFIG.linea1;

export const lineNumber = (line) => getLineConfig(line).number;
