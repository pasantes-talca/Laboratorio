import { describe, it, expect } from 'vitest';
import {
  getConcentradosForSabor,
  getTamanosForSabor,
  getNormalizedSaborKey,
  SABOR_CONCENTRADOS_MAP,
  SABOR_TAMANOS_MAP,
} from './productRules';

describe('productRules', () => {
  it('correctly maps valid concentrados for each flavor according to specifications', () => {
    expect(getConcentradosForSabor('Cola')).toEqual(['XQ', 'KG', 'IFF']);
    expect(getConcentradosForSabor('Pomelo')).toEqual(['IFF', 'TP', 'BA']);
    expect(getConcentradosForSabor('Lima')).toEqual(['IFF', 'TP', 'BA']);
    expect(getConcentradosForSabor('Naranja')).toEqual(['IFF', 'TP', 'BA']);
    expect(getConcentradosForSabor('Manzana')).toEqual(['IFF', 'TP', 'BA', 'XQ', 'KG']);
    expect(getConcentradosForSabor('Soda')).toEqual(['TALCA']);
    expect(getConcentradosForSabor('Sifon')).toEqual(['TALCA']);
    expect(getConcentradosForSabor('Sifón')).toEqual(['TALCA']);
  });

  it('correctly maps valid tamanos for each flavor according to specifications', () => {
    expect(getTamanosForSabor('Cola')).toEqual(['3L', '2,25L', '500ml']);
    expect(getTamanosForSabor('Pomelo')).toEqual(['3L', '2,25L', '500ml']);
    expect(getTamanosForSabor('Lima')).toEqual(['3L', '2,25L', '500ml']);
    expect(getTamanosForSabor('Naranja')).toEqual(['3L', '2,25L', '500ml']);
    expect(getTamanosForSabor('Manzana')).toEqual(['3L', '2,25L', '500ml']);
    expect(getTamanosForSabor('Soda')).toEqual(['2,25L', '500ml']);
    expect(getTamanosForSabor('Sifon')).toEqual(['2L']);
    expect(getTamanosForSabor('Sifón')).toEqual(['2L']);
  });

  it('normalizes strings with accents and casing', () => {
    expect(getNormalizedSaborKey('SIFÓN')).toBe('sifon');
    expect(getNormalizedSaborKey('Lima Limón')).toBe('lima');
    expect(getNormalizedSaborKey('')).toBe('');
  });
});
