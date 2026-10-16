import FormLayout, { FormField } from './FormLayout';
import React, { useEffect, useState } from 'react';
import { Settings2, X } from 'lucide-react';
import { useProduction } from '../context/ProductionContext';
import { useToast } from '../context/ToastContext';
import { getMarcas } from '../services/api';
import { getConcentradosForSabor, getTamanosForSabor } from '../utils/productRules';

export default function ProductionModal() {
  const { production, saveProduction, isModalOpen, closeModal } = useProduction();
  const { showToast } = useToast();
  const [formData, setFormData] = useState(null);
  const [editingLine, setEditingLine] = useState('linea1');
  const [baseVersion, setBaseVersion] = useState(0);
  const [marcas, setMarcas] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isModalOpen) return;
    setEditingLine(production.linea);
    setBaseVersion(production.version);
    setFormData({
      turno: production.turno,
      sabor: production.sabor,
      tipoConcentrado: production.tipoConcentrado,
      tamano: production.tamano,
    });
    getMarcas().then(setMarcas).catch(() => setMarcas([]));
  }, [isModalOpen]);

  if (!isModalOpen || !formData) return null;

  const availableConcentrados = getConcentradosForSabor(formData.sabor);
  const availableTamanos = getTamanosForSabor(formData.sabor);

  const handleSaborChange = (sabor) => {
    const concentrates = getConcentradosForSabor(sabor);
    const sizes = getTamanosForSabor(sabor);
    setFormData((previous) => ({
      ...previous,
      sabor,
      tipoConcentrado: concentrates.includes(previous.tipoConcentrado) ? previous.tipoConcentrado : (concentrates[0] || ''),
      tamano: sizes.includes(previous.tamano) ? previous.tamano : (sizes[0] || ''),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await saveProduction(editingLine, formData, baseVersion);
      showToast(`Producción de ${editingLine === 'linea2' ? 'Línea 2' : 'Línea 1'} actualizada`, 'success');
      closeModal();
    } catch (err) {
      showToast(err.message, 'error');
      if (err.status === 409) closeModal();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeModal}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="production-dialog-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3 id="production-dialog-title"><Settings2 size={20} color="#0077B6" /> Cambiar producción</h3>
          <button type="button" className="btn-close-modal" aria-label="Cerrar" onClick={closeModal}><X size={20} /></button>
        </div>
        <p className="sidebar-hint">Configurando {editingLine === 'linea2' ? 'Línea 2' : 'Línea 1'}. Los cambios se aplican al guardar.</p>
        <FormLayout title="Cambiar producción" compact onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <FormField className="field-container">
            <label htmlFor="production-turno">Turno <span className="required-star">*</span></label>
            <select id="production-turno" required value={formData.turno} onChange={(event) => setFormData({ ...formData, turno: event.target.value })}>
              <option value="Mañana">Mañana</option>
              <option value="Tarde">Tarde</option>
              <option value="Noche">Noche</option>
            </select>
          </FormField>
          <FormField className="field-container">
            <label htmlFor="production-sabor">Sabor / Marca <span className="required-star">*</span></label>
            <select id="production-sabor" required value={formData.sabor} onChange={(event) => handleSaborChange(event.target.value)}>
              <option value="" disabled>Seleccione sabor...</option>
              {marcas.map((marca) => <option key={marca.id} value={marca.nombre}>{marca.nombre}</option>)}
            </select>
          </FormField>
          <div className="form-grid-2">
            <FormField className="field-container">
              <label htmlFor="production-concentrado">Concentrado <span className="required-star">*</span></label>
              <select id="production-concentrado" required disabled={!formData.sabor} value={formData.tipoConcentrado} onChange={(event) => setFormData({ ...formData, tipoConcentrado: event.target.value })}>
                <option value="" disabled>Seleccione...</option>
                {availableConcentrados.map((concentrado) => <option key={concentrado} value={concentrado}>{concentrado}</option>)}
              </select>
            </FormField>
            <FormField className="field-container">
              <label htmlFor="production-tamano">Tamaño <span className="required-star">*</span></label>
              <select id="production-tamano" required disabled={!formData.sabor} value={formData.tamano} onChange={(event) => setFormData({ ...formData, tamano: event.target.value })}>
                <option value="" disabled>Seleccione...</option>
                {availableTamanos.map((tamano) => <option key={tamano} value={tamano}>{tamano}</option>)}
              </select>
            </FormField>
          </div>
          <div className="form-actions" style={{ marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar cambio'}</button>
          </div>
        </FormLayout>
      </div>
    </div>
  );
}
