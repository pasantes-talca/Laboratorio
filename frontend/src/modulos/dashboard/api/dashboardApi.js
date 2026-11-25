export { getControlesBebida, getControlesJarabe, getControlesTorque } from '../../../services/api';

// Read every page before applying historical filters; never treat the first
// page as the complete dataset. A failing page rejects the entire source.
export async function loadAllPages(getPage, pageSize = 500) {
  const records = new Map();
  for (let offset = 0; ; offset += pageSize) {
    const page = await getPage({ limit: pageSize, offset });
    if (!Array.isArray(page)) throw new Error('Respuesta de controles inválida');
    const previousSize = records.size;
    page.forEach((record) => records.set(record.id, record));
    if (page.length < pageSize) return [...records.values()];
    if (records.size === previousSize) throw new Error('El historial no avanza entre páginas');
  }
}
