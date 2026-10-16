import React from 'react';
import { FileSpreadsheet, Save, RotateCcw, Upload, User } from 'lucide-react';
import MultiInputList from '../../../componentes/MultiInputList';

export default function ParteJarabeForm({
  responsables,
  sabores,
  tanquesCatalog,
  today,
  parteForm,
  setParteForm,
  parsingExcel,
  handleExcelUpload,
  handleParteSubmit,
}) {
  return (
    <form onSubmit={handleParteSubmit} style={{ marginTop: '1.25rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(47, 133, 90, 0.08)',
          border: '1px solid rgba(47, 133, 90, 0.25)',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-exito)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileSpreadsheet size={18} />
            Importar Parte desde Excel / HTML
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Cargue el reporte generado por sala de jarabe para autocompletar las cantidades.
          </div>
        </div>
        <label className="btn btn-success" style={{ cursor: 'pointer' }}>
          <Upload size={16} />
          {parsingExcel ? 'Procesando...' : 'Cargar Reporte Excel'}
          <input
            type="file"
                  accept=".xls,.html,.htm"
            style={{ display: 'none' }}
            onChange={handleExcelUpload}
            disabled={parsingExcel}
          />
        </label>
      </div>
    
      <div className="form-grid">
        <div className="field-container">
          <label>Fecha <span className="required-star">*</span></label>
          <input
            type="date"
            required
            value={parteForm.fecha}
            onChange={(e) => setParteForm({ ...parteForm, fecha: e.target.value })}
          />
        </div>
    
        <div className="field-container">
          <label>Turno <span className="required-star">*</span></label>
          <select
            value={parteForm.turno}
            onChange={(e) => setParteForm({ ...parteForm, turno: e.target.value })}
          >
            <option value="Mañana">Mañana</option>
            <option value="Tarde">Tarde</option>
            <option value="Noche">Noche</option>
          </select>
        </div>
    
        <div className="field-container">
          <label>Tanque <span className="required-star">*</span></label>
          <select
            required
            value={parteForm.tanque}
            onChange={(e) => setParteForm({ ...parteForm, tanque: e.target.value })}
          >
            <option value="" disabled>Seleccione tanque...</option>
            {tanquesCatalog.map((t) => (
              <option key={t.id} value={t.numero}>{t.numero === 'N/A' ? 'N/A' : `Tanque ${t.numero}`}</option>
            ))}
          </select>
        </div>
    
        <div className="field-container">
          <label>N° Carga Trilay <span className="required-star">*</span></label>
          <input
            type="text"
            required
            placeholder="Ej: TR-4521"
            value={parteForm.numero_carga_trilay}
            onChange={(e) => setParteForm({ ...parteForm, numero_carga_trilay: e.target.value })}
          />
        </div>
    
        <div className="field-container col-span-2">
          <label>Sabor / Marca</label>
          <select
            value={parteForm.sabor}
            onChange={(e) => setParteForm({ ...parteForm, sabor: e.target.value })}
          >
            <option value="">Seleccione sabor (opcional)...</option>
            {sabores.map((s) => (
              <option key={s.id} value={s.nombre}>{s.nombre}</option>
            ))}
          </select>
        </div>
    
        <div className="field-container col-span-2">
          <label>Responsables (Sala de Jarabe) <span className="required-star">*</span></label>
          <MultiInputList
            type="select"
            items={parteForm.responsables}
            options={responsables.map((r) => ({ value: r.nombre_completo, label: r.nombre_completo }))}
            onChange={(responsables) => setParteForm({ ...parteForm, responsables })}
            placeholder="Seleccione responsable..."
            addButtonText="Agregar responsable"
            icon={User}
            required
          />
        </div>
      </div>
    
      <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem' }}>
        <h4 style={{ fontSize: '1rem', color: 'var(--color-azul-marino)', marginBottom: '1rem', fontWeight: 600 }}>
          Dosificación de Materias Primas e Insumos (kg)
        </h4>
        <div className="form-grid">
          <div className="field-container">
            <label>Azúcar (kg)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={parteForm.azucar}
              onChange={(e) => setParteForm({ ...parteForm, azucar: e.target.value })}
            />
          </div>
    
          <div className="field-container">
            <label>Sucralosa (kg)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={parteForm.sucralosa}
              onChange={(e) => setParteForm({ ...parteForm, sucralosa: e.target.value })}
            />
          </div>
    
          <div className="field-container">
            <label>Reforzado Cítrico (kg)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={parteForm.reforzado_citrico}
              onChange={(e) => setParteForm({ ...parteForm, reforzado_citrico: e.target.value })}
            />
          </div>
    
          <div className="field-container">
            <label>Acesulfame K (kg)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={parteForm.acesulfame_k}
              onChange={(e) => setParteForm({ ...parteForm, acesulfame_k: e.target.value })}
            />
          </div>
    
          <div className="field-container">
            <label>Benzoato de Sodio (kg)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={parteForm.benzoato_sodio}
              onChange={(e) => setParteForm({ ...parteForm, benzoato_sodio: e.target.value })}
            />
          </div>
    
          <div className="field-container">
            <label>Sorbato de Potasio (kg)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={parteForm.sorbato_potasio}
              onChange={(e) => setParteForm({ ...parteForm, sorbato_potasio: e.target.value })}
            />
          </div>
    
          <div className="field-container">
            <label>Citrato de Sodio (kg)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={parteForm.citrato_sodio}
              onChange={(e) => setParteForm({ ...parteForm, citrato_sodio: e.target.value })}
            />
          </div>
    
          <div className="field-container">
            <label>Ácido Cítrico (kg)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={parteForm.acido_citrico}
              onChange={(e) => setParteForm({ ...parteForm, acido_citrico: e.target.value })}
            />
          </div>
    
          <div className="field-container">
            <label>Ácido Fosfórico (kg)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={parteForm.acido_fosforico}
              onChange={(e) => setParteForm({ ...parteForm, acido_fosforico: e.target.value })}
            />
          </div>
    
          <div className="field-container">
            <label>Ácido Ascórbico (kg)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={parteForm.acido_ascorbico}
              onChange={(e) => setParteForm({ ...parteForm, acido_ascorbico: e.target.value })}
            />
          </div>
    
          <div className="field-container">
            <label>Cafeína (kg)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={parteForm.cafeina}
              onChange={(e) => setParteForm({ ...parteForm, cafeina: e.target.value })}
            />
          </div>
    
          <div className="field-container">
            <label>Colorante Caramelo (kg)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={parteForm.colorante_caramelo}
              onChange={(e) => setParteForm({ ...parteForm, colorante_caramelo: e.target.value })}
            />
          </div>
        </div>
      </div>
    
      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setParteForm({
            fecha: today,
            turno: 'Mañana',
            tanque: '',
            sabor: '',
            numero_carga_trilay: '',
            responsables: [''],
            azucar: '',
            sucralosa: '',
            reforzado_citrico: '',
            acesulfame_k: '',
            benzoato_sodio: '',
            sorbato_potasio: '',
            citrato_sodio: '',
            acido_citrico: '',
            acido_fosforico: '',
            acido_ascorbico: '',
            cafeina: '',
            colorante_caramelo: '',
          })}
        >
          <RotateCcw size={16} /> Limpiar
        </button>
        <button type="submit" className="btn btn-primary">
          <Save size={16} /> Registrar Parte de Jarabe
        </button>
      </div>
    </form>
  );
}
