import React, { useState, useEffect } from 'react';
import { X, Settings2, Sparkles } from 'lucide-react';
import { useProduction } from '../context/ProductionContext';
import { useToast } from '../context/ToastContext';
import { getMarcas, getTiposConcentrado, getTamanos } from '../services/api';

export default function ProductionModal() {
  const { production, updateProduction, isModalOpen, closeModal } = useProduction();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({ ...production });
  const [marcas, setMarcas] = useState([]);
  const [concentrados, setConcentrados] = useState([]);
  const [tamanos, setTamanos] = useState([]);
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
      const [m, c, t] = await Promise.all([
        getMarcas(),
        getTiposConcentrado(),
        getTamanos(),
      ]);
      setMarcas(m);
      setConcentrados(c);
      setTamanos(t);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
            <Settings2 size={20} color="#a855f7" />
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
            <label>Sabor / Marca <span className="required-star">*</span></label>
            <select
              value={formData.sabor}
              required
              onChange={(e) => setFormData({ ...formData, sabor: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, tipoConcentrado: e.target.value })}
              >
                <option value="" disabled>Seleccione...</option>
                {concentrados.map((c) => (
                  <option key={c.id} value={c.codigo}>{c.codigo}</option>
                ))}
              </select>
            </div>

            <div className="field-container">
              <label>Tamaño de Envase <span className="required-star">*</span></label>
              <select
                value={formData.tamano}
                required
                onChange={(e) => setFormData({ ...formData, tamano: e.target.value })}
              >
                <option value="" disabled>Seleccione...</option>
                {tamanos.map((t) => (
                  <option key={t.id} value={t.valor}>{t.valor}</option>
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
