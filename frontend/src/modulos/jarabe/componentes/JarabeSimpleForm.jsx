import FormLayout, { FormSection, FormField } from '../../../componentes/FormLayout';
import React from 'react';
import { Save, RotateCcw, Building, Droplets, User } from 'lucide-react';
import MultiInputList from '../../../componentes/MultiInputList';

export default function JarabeSimpleForm({
  responsables,
  volcadoAuto,
  setVolcadoAuto,
  today,
  simpleForm,
  setSimpleForm,
  handleSimpleSubmit,
}) {
  return (
    <FormLayout title="Jarabe simple" domain="SALA DE JARABE" description="Registre las materias primas y la preparación del jarabe simple." id="simple-form" onSubmit={handleSimpleSubmit} style={{ marginTop: '1.25rem' }}>
      <FormSection number="01" title="Carga y materias primas" description="Identifique el volcado y el azúcar utilizada.">


        <FormField className="field-container">
          <label>
            N° Volcado <span className="required-star">*</span>
            {volcadoAuto !== null && (
              <span style={{ marginLeft: '0.5rem', color: 'var(--color-azul-clinico)', fontSize: '0.78rem' }}>
                (sugerido: {volcadoAuto})
              </span>
            )}
          </label>
          <input
            type="number"
            required
            placeholder={volcadoAuto !== null ? String(volcadoAuto) : 'Ej: 1'}
            value={simpleForm.volcado_numero || (volcadoAuto !== null ? volcadoAuto : '')}
            onChange={(e) => setSimpleForm({ ...simpleForm, volcado_numero: e.target.value })}
          />
        </FormField>

        <FormField className="field-container">
          <label>Cantidad de Bolsas <span className="required-star">*</span></label>
          <input
            type="number"
            required
            placeholder="Ej: 80"
            value={simpleForm.cantidad_bolsas}
            onChange={(e) => setSimpleForm({ ...simpleForm, cantidad_bolsas: e.target.value })}
          />
        </FormField>

        <FormField className="field-container">
          <label>Tipo de Azúcar</label>
          <input
            type="text"
            placeholder="Ej: Común Tipo A, Refinada..."
            value={simpleForm.azucar_tipo}
            onChange={(e) => setSimpleForm({ ...simpleForm, azucar_tipo: e.target.value })}
          />
        </FormField>

        <FormField className="field-container col-span-2">
          <label>Marca(s) de Azúcar <span className="required-star">*</span></label>
          <MultiInputList
            items={simpleForm.marcas}
            onChange={(marcas) => setSimpleForm({ ...simpleForm, marcas })}
            placeholder="Ej: Ledesma, Tabacal..."
            addButtonText="Agregar Marca de azúcar"
            icon={Building}
            required
          />
        </FormField>


</FormSection>
<FormSection number="02" title="Turbidez y auxiliares" description="Complete las mediciones y las cantidades de auxiliares.">
<FormField className="field-container col-span-2">
          <label>Turbidez (NTU)</label>
          <MultiInputList
            items={simpleForm.ntus}
            onChange={(ntus) => setSimpleForm({ ...simpleForm, ntus })}
            placeholder="Ej: 24.5"
            addButtonText="Agregar NTU"
            icon={Droplets}
          />
        </FormField>

        <FormField className="field-container">
          <label>Auxiliar Standard (kg)</label>
          <input
            type="number"
            step="0.01"
            placeholder="Ej: 12.5"
            value={simpleForm.aux_standard}
            onChange={(e) => setSimpleForm({ ...simpleForm, aux_standard: e.target.value })}
          />
        </FormField>

        <FormField className="field-container">
          <label>Auxiliar Hyflo (kg)</label>
          <input
            type="number"
            step="0.01"
            placeholder="Ej: 8.0"
            value={simpleForm.aux_hyflo}
            onChange={(e) => setSimpleForm({ ...simpleForm, aux_hyflo: e.target.value })}
          />
        </FormField>


</FormSection>
<FormSection number="03" title="Pasteurización" description="Indique los horarios y la temperatura del proceso.">
<FormField className="field-container">
          <label>Pasteurizado Desde</label>
          <input
            type="time"
            value={simpleForm.pasteurizado_desde}
            onChange={(e) => setSimpleForm({ ...simpleForm, pasteurizado_desde: e.target.value })}
          />
        </FormField>

        <FormField className="field-container">
          <label>Pasteurizado Hasta</label>
          <input
            type="time"
            value={simpleForm.pasteurizado_hasta}
            onChange={(e) => setSimpleForm({ ...simpleForm, pasteurizado_hasta: e.target.value })}
          />
        </FormField>

        <FormField className="field-container">
          <label>Temp Pasteurizado (°C)</label>
          <input
            type="number"
            step="0.1"
            placeholder="Ej: 85.0"
            value={simpleForm.pasteurizado_temp}
            onChange={(e) => setSimpleForm({ ...simpleForm, pasteurizado_temp: e.target.value })}
          />
        </FormField>


</FormSection>
<FormSection number="04" title="Responsables" description="Seleccione las personas que realizaron la preparación.">
<FormField className="field-container col-span-2">
          <label>Responsables (Sala de Jarabe) <span className="required-star">*</span></label>
          <MultiInputList
            type="select"
            items={simpleForm.responsables}
            options={responsables.map((r) => ({ value: r.nombre_completo, label: r.nombre_completo }))}
            onChange={(responsables) => setSimpleForm({ ...simpleForm, responsables })}
            placeholder="Seleccione responsable..."
            addButtonText="Agregar responsable"
            icon={User}
            required
          />
        </FormField>

</FormSection>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => { setSimpleForm({
            fecha: today,
            hora: '',
            tanque: '',
            volcado_numero: '',
            cantidad_bolsas: '',
            azucar_tipo: '',
            marcas: [''],
            ntus: [''],
            aux_standard: '',
            aux_hyflo: '',
            pasteurizado_desde: '',
            pasteurizado_hasta: '',
            pasteurizado_temp: '',
            responsables: [''],
          }); setVolcadoAuto(null); }}
        >
          <RotateCcw size={16} /> Limpiar
        </button>
        <button type="submit" className="btn btn-primary">
          <Save size={16} /> Registrar Jarabe Simple
        </button>
      </div>
    </FormLayout>
  );
}
