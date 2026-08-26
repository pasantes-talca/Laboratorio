import { describe, it, expect } from 'vitest';
import { PRODUCT_STANDARDS, findProductStandard } from './productStandards';

describe('PRODUCT_STANDARDS', () => {
  it('contains 11 products with unique ids', () => {
    expect(PRODUCT_STANDARDS).toHaveLength(11);
    const ids = PRODUCT_STANDARDS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every product has required shape fields', () => {
    for (const p of PRODUCT_STANDARDS) {
      expect(p.id).toBeTruthy();
      expect(p.marca).toBe('TALCA');
      expect(p.sabor).toBeTruthy();
      expect(typeof p.vencimiento).toBe('string');
    }
  });

  it('sifon and soda have null brix/ta (no aplica) but valid carbonatacion ranges', () => {
    for (const id of ['sifon', 'soda']) {
      const p = PRODUCT_STANDARDS.find((x) => x.id === id);
      expect(p.brix).toBeNull();
      expect(p.ta).toBeNull();
      expect(p.torqueShort).toBeNull();
      // min <= objetivo <= max
      expect(p.carbonatacion.min).toBeLessThanOrEqual(p.carbonatacion.objetivo);
      expect(p.carbonatacion.objetivo).toBeLessThanOrEqual(p.carbonatacion.max);
    }
  });

  it('soda carbonatacion boundary values are inclusive limits [3.7, 4.7]', () => {
    const soda = PRODUCT_STANDARDS.find((x) => x.id === 'soda');
    expect(soda.carbonatacion).toMatchObject({
      objetivo: 4.2,
      min: 3.7,
      max: 4.7,
      tolerancia: '±0.5',
    });
  });

  it('flavored products define brix/ta/carbonatacion with coherent numeric ranges', () => {
    const flavored = PRODUCT_STANDARDS.filter((p) => p.brix !== null);
    // sifon and soda are the only ones without brix
    expect(PRODUCT_STANDARDS.length - flavored.length).toBe(2);

    for (const p of flavored) {
      for (const metric of ['brix', 'ta', 'carbonatacion']) {
        const range = p[metric];
        expect(range.min, `${p.id}.${metric}.min`).toBeLessThanOrEqual(range.objetivo);
        expect(range.objetivo, `${p.id}.${metric}.objetivo`).toBeLessThanOrEqual(range.max);
        expect(range.tolerancia).toBeTruthy();
      }
      // torque ranges are coherent too
      for (const torqueKey of ['torqueLong', 'torqueShort']) {
        const t = p[torqueKey];
        expect(t.min).toBeLessThan(t.max);
        expect(t.objetivo).toBeGreaterThanOrEqual(t.min);
        expect(t.objetivo).toBeLessThanOrEqual(t.max);
      }
    }
  });

  it('groups are GIVAUDAN, IFF or OTRAS only', () => {
    const grupos = new Set(
      PRODUCT_STANDARDS.filter((p) => p.grupo).map((p) => p.grupo)
    );
    expect([...grupos].sort()).toEqual(['GIVAUDAN', 'IFF', 'OTRAS']);
  });
});

describe('findProductStandard', () => {
  it('returns COLA Givaudan (index 2) when sabor is falsy', () => {
    expect(findProductStandard('')).toBe(
      PRODUCT_STANDARDS.find((p) => p.id === 'cola-givaudan')
    );
    expect(findProductStandard(null)).toBe(findProductStandard(''));
    expect(findProductStandard(undefined)).toBe(findProductStandard(''));
  });

  it.each(['sifon', 'SIFÓN', 'Sifon con acento'])(
    'matches sifon regardless of case/accent: %s',
    (input) => {
      expect(findProductStandard(input).id).toBe('sifon');
    }
  );

  it('matches soda case-insensitively', () => {
    expect(findProductStandard('SODA').id).toBe('soda');
    expect(findProductStandard('soda').id).toBe('soda');
  });

  it('matches manzana', () => {
    expect(findProductStandard('MANZANA').id).toBe('manzana');
  });

  describe('concentrado disambiguation (GIVAUDAN vs IFF)', () => {
    it('cola defaults to givaudan when no iff marker', () => {
      expect(findProductStandard('COLA').id).toBe('cola-givaudan');
    });

    it('cola resolves to IFF via sabor marker', () => {
      expect(findProductStandard('COLA Red. IFF').id).toBe('cola-iff');
    });

    it('cola resolves to IFF via concentrado argument', () => {
      expect(findProductStandard('COLA Red. XQ', 'IFF').id).toBe('cola-iff');
    });

    it('naranja resolves to IFF via concentrado', () => {
      expect(findProductStandard('NARANJA BA', 'iff').id).toBe('naranja-iff');
      expect(findProductStandard('NARANJA BA').id).toBe('naranja-givaudan');
    });

    it('lima limón handles accents and both keywords', () => {
      expect(findProductStandard('LIMA LIMÓN Red. TP').id).toBe(
        'lima-limon-givaudan'
      );
      expect(findProductStandard('LIMA LIMON Red. IFF').id).toBe(
        'lima-limon-iff'
      );
      // single keyword variants
      expect(findProductStandard('lima').id).toBe('lima-limon-givaudan');
      expect(findProductStandard('limón', 'IFF').id).toBe('lima-limon-iff');
    });

    it('pomelo resolves per concentrado', () => {
      expect(findProductStandard('POMELO BA').id).toBe('pomelo-givaudan');
      expect(findProductStandard('POMELO Red. IFF').id).toBe('pomelo-iff');
      expect(findProductStandard('pomelo', 'IFF').id).toBe('pomelo-iff');
    });
  });

  it('falls back to COLA Givaudan for completely unknown sabor', () => {
    expect(findProductStandard('frutilla')).toBe(
      PRODUCT_STANDARDS.find((p) => p.id === 'cola-givaudan')
    );
    expect(findProductStandard('xyz123')).toBe(findProductStandard(''));
  });

  it('is whitespace tolerant on lookup input', () => {
    // normalize() trims the query before matching
    expect(findProductStandard('  soda  ').id).toBe('soda');
  });

  it('returns full standard objects from the catalog (same reference)', () => {
    const result = findProductStandard('manzana');
    expect(result).toBe(PRODUCT_STANDARDS.find((p) => p.id === 'manzana'));
  });
});
