import React, { useState, useEffect } from 'react';
import { X, Settings2, Sparkles } from 'lucide-react';
import { useProduction } from '../context/ProductionContext';
import { useToast } from '../context/ToastContext';
import { getMarcas, getTiposConcentrado, getTamanos } from '../services/api';
import { getConcentradosForSabor, getTamanosForSabor } from '../utils/productRules';

export default function ProductionModal() {
  const { production, updateProduction, isModalOpen, closeModal } = useProduction();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({ ...production });
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isModalOpen) {
      setFormData({ ...production });
      loadCatalogs();
    }
  }, [isModalOpen, production]);

  const loadCatalogs = async () => {
    try {
      setLoading(true);
      const m = await getMarcas();
      setMarcas(m);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const availableConcentrados = getConcentradosForSabor(formData.sabor);
  const availableTamanos = getTamanosForSabor(formData.sabor);

  const handleSaborChange = (newSabor) => {
    const validConc = getConcentradosForSabor(newSabor);
    const validTam = getTamanosForSabor(newSabor);

    const nextConc = validConc.includes(formData.tipoConcentrado)
      ? formData.tipoConcentrado
      : (validConc[0] || '');

    const nextTam = validTam.includes(formData.tamano)
      ? formData.tamano
      : (validTam[0] || '');

    setFormData((prev) => ({
      ...prev,
      sabor: newSabor,
      tipoConcentrado: nextConc,
      tamano: nextTam,
    }));
  };

  if (!isModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProduction(formData);
    showToast('Producción asignada correctamente', 'success');
    closeModal();
  };

  return (
    <div className="modal-backdrop" onClick={closeModal}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <Settings2 size={20} color="#0077B6" />
            Asignar Producción en Línea
          </h3>
          <button type="button" className="btn-close-modal" onClick={closeModal}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div className="field-container">
            <label>Línea de Producción</label>
            <select
              value={formData.linea}
              onChange={(e) => setFormData({ ...formData, linea: e.target.value })}
            >
              <option value="linea1">Línea 1 (12 cabezales)</option>
              <option value="linea2">Línea 2 (14 cabezales)</option>
            </select>
          </div>

          <div className="field-container">
            <label>Turno <span className="required-star">*</span></label>
            <select
              value={formData.turno}
              required
              onChange={(e) => setFormData({ ...formData, turno: e.target.value })}
            >
              <option value="Mañana">Mañana</option>
              <option value="Tarde">Tarde</option>
              <option value="Noche">Noche</option>
            </select>
          </div>

          <div className="field-container">
            <label>Sabor / Marca <span className="required-star">*</span></label>
            <select
              value={formData.sabor}
              required
              onChange={(e) => handleSaborChange(e.target.value)}
            >
              <option value="" disabled>Seleccione sabor...</option>
              {marcas.map((m) => (
                <option key={m.id} value={m.nombre}>{m.nombre}</option>
              ))}
            </select>
          </div>

          <div className="form-grid-2">
            <div className="field-container">
              <label>Tipo de Concentrado <span className="required-star">*</span></label>
              <select
                value={formData.tipoConcentrado}
                required
                disabled={!formData.sabor}
                onChange={(e) => setFormData({ ...formData, tipoConcentrado: e.target.value })}
              >
                <option value="" disabled>Seleccione...</option>
                {availableConcentrados.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="field-container">
              <label>Tamaño de Envase <span className="required-star">*</span></label>
              <select
                value={formData.tamano}
                required
                disabled={!formData.sabor}
                onChange={(e) => setFormData({ ...formData, tamano: e.target.value })}
              >
                <option value="" disabled>Seleccione...</option>
                {availableTamanos.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>


          <div className="form-actions" style={{ marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <Sparkles size={16} />
              Guardar Configuración
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
