import { describe, expect, it } from 'vitest';
import { LINE_IDS, getLineConfig, isLineId, lineNumber } from './productionLines';

describe('productionLines', () => {
  it('lists three lines', () => {
    expect(LINE_IDS).toEqual(['linea1', 'linea2', 'linea3']);
  });

  it('validates ids', () => {
    expect(isLineId('linea3')).toBe(true);
    expect(isLineId('linea4')).toBe(false);
  });

  it('maps ids to numbers', () => {
    expect(lineNumber('linea1')).toBe(1);
    expect(lineNumber('linea3')).toBe(3);
  });

  it('line 3 reuses line 2 standards', () => {
    const two = getLineConfig('linea2');
    const three = getLineConfig('linea3');
    expect(three.label).toBe('Línea 3');
    expect(three.finish).toBe('short');
    expect(three.finish).toBe(two.finish);
    expect(three.cabezales).toBe(16);
    expect(getLineConfig('linea1').cabezales).toBe(12);
  });
});
