import { PREVIEW_CATALOG } from './previewCatalog';

export const previewCatalogue = PREVIEW_CATALOG;
export function createExamples() {
  return Object.fromEntries(PREVIEW_CATALOG.map(form => [form.id, Array.from({ length: 3 }, (_, i) => {
    const values = Object.fromEntries(form.fields.map(field => {
      let value = field.options?.[0] ?? (field.type === 'number' ? 1.2 : field.type === 'integer' ? 1 : field.type === 'boolean' ? true : field.type === 'date' ? '2026-10-20' : field.type === 'time' ? '08:30:00' : field.type === 'datetime' ? '2026-10-20T08:30:00-03:00' : field.type === 'list' ? ['Operador de ejemplo'] : 'Ejemplo');
      if (field.key === 'id') value = 103 - i;
      if (field.key === 'responsable') value = 'Operador de ejemplo';
      return [field.key, value];
    }));
    return { id: values.id, values, created_by: 'operador.ejemplo', created_at: '2026-10-20T08:30:00-03:00', version: 1, history: [] };
  })]));
}
