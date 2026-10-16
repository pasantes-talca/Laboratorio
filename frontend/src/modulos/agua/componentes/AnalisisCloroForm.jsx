import React, { useRef, useState } from 'react';
import { Activity, CheckCircle2, RotateCcw, Save } from 'lucide-react';
import { submitAnalisisCloro } from '../api/aguaApi';

const initialValues = () => ({
  hora: '', tanque_agua_osmosis: '',
  filtro_carbon_a: 'Cumple', filtro_carbon_b: 'Cumple', filtro_carbon_c: 'Cumple',
  contralavado_tanque_a: '', contralavado_tanque_b: '',
  cloro_riser_linea: 'Linea 1', cloro_riser_resultado: '',
  acondicionamiento_rinser: '', responsable: '',
});
const numericFields = ['tanque_agua_osmosis', 'cloro_riser_resultado', 'acondicionamiento_rinser'];
const requiredFields = ['hora', 'tanque_agua_osmosis', 'cloro_riser_resultado', 'responsable'];

function validationMessage(name, value) {
  if (requiredFields.includes(name) && !String(value).trim()) return 'Complete este campo para registrar el análisis.';
  if (value !== '' && numericFields.includes(name) && (!Number.isFinite(Number(value)) || Number(value) < 0)) {
    return 'Ingrese un valor igual o mayor a cero.';
  }
  if (name === 'responsable' && value && value.trim().length < 2) return 'Seleccione un responsable válido.';
  return '';
}

function FormSection({ number, title, description, children }) {
  return <fieldset className="chlorine-section">
    <legend><span className="chlorine-section-number" aria-hidden="true">{number}</span>{title}</legend>
    <p className="chlorine-section-description">{description}</p>
    <div className="chlorine-fields">{children}</div>
  </fieldset>;
}

function Field({ name, label, type = 'number', unit, optional = false, values, errors, onChange, onBlur, children }) {
  const id = `chlorine-${name}`;
  const common = {
    id, name, value: values[name], onChange: (event) => onChange(name, event.target.value),
    onBlur: () => onBlur(name), required: !optional,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${id}-error` : undefined,
    'aria-label': unit ? `${label} (${unit})` : undefined,
  };
  return <div className={`chlorine-field${errors[name] ? ' has-error' : ''}`}>
    <label htmlFor={id}>
      <span>{label}{!optional && <span className="required-star" aria-hidden="true"> *</span>}</span>
      {optional && <span className="chlorine-optional">Opcional</span>}
    </label>
    <div className="chlorine-control">
      {children ? <select {...common}>{children}</select> : <input {...common} type={type}
        {...(type === 'number' ? { min: 0, step: 'any', inputMode: 'decimal' } : {})} />}
      {unit && <span className="chlorine-unit" aria-hidden="true">{unit}</span>}
    </div>
    {errors[name] && <p id={`${id}-error`} className="chlorine-field-error">{errors[name]}</p>}
  </div>;
}

export default function AnalisisCloroForm({ responsables }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const formRef = useRef(null);

  const onChange = (name, value) => {
    setValues((previous) => ({ ...previous, [name]: value }));
    setFeedback(null);
    setErrors((previous) => previous[name] ? { ...previous, [name]: validationMessage(name, value) } : previous);
  };
  const onBlur = (name) => setErrors((previous) => ({ ...previous, [name]: validationMessage(name, values[name]) }));
  const clear = () => {
    setValues(initialValues());
    setErrors({});
    setFeedback(null);
  };
  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    const nextErrors = Object.fromEntries(Object.entries(values).map(([name, value]) => [name, validationMessage(name, value)]));
    setErrors(nextErrors);
    const invalid = Object.keys(nextErrors).find((name) => nextErrors[name]);
    if (invalid) {
      setFeedback({ type: 'error', text: 'Revise los campos señalados antes de registrar el análisis.' });
      formRef.current.elements.namedItem(invalid)?.focus();
      return;
    }
    setSaving(true);
    setFeedback(null);
    const payload = { ...values };
    numericFields.forEach((name) => { payload[name] = values[name] === '' ? null : Number(values[name]); });
    payload.contralavado_tanque_a ||= null;
    payload.contralavado_tanque_b ||= null;
    try {
      await submitAnalisisCloro(payload);
      setValues(initialValues());
      setErrors({});
      setFeedback({ type: 'success', text: 'Análisis registrado. Puede cargar un nuevo control.' });
    } catch (error) {
      setFeedback({ type: 'error', text: error.message || 'No se pudo registrar el análisis. Sus datos se conservan para volver a intentar.' });
    } finally {
      setSaving(false);
    }
  };
  const fieldProps = { values, errors, onChange, onBlur };

  return <form className="chlorine-form" ref={formRef} onSubmit={submit} noValidate aria-labelledby="chlorine-title">
    <header className="chlorine-heading">
      <div className="chlorine-heading-icon" aria-hidden="true"><Activity size={25} /></div>
      <div>
        <span className="chlorine-eyebrow">CONTROL DE AGUA</span>
        <h2 id="chlorine-title">Análisis de cloro</h2>
        <p>Registre las mediciones y las condiciones del tratamiento de agua.</p>
      </div>
    </header>
    <p className="chlorine-required-note">Los campos con <span className="required-star">*</span> son obligatorios.</p>

    <fieldset className="chlorine-editable" disabled={saving}>
      <FormSection number="01" title="Datos del control" description="Identifique el momento del control y registre la medición del tanque.">
        <Field {...fieldProps} name="hora" label="Hora del control" type="time" />
        <Field {...fieldProps} name="tanque_agua_osmosis" label="Tanque de agua de ósmosis" unit="ppm" />
      </FormSection>

      <FormSection number="02" title="Filtros de carbón" description="Verifique el estado de cada filtro.">
        {['a', 'b', 'c'].map((filter) => <Field key={filter} {...fieldProps} name={`filtro_carbon_${filter}`} label={`Filtro de carbón ${filter.toUpperCase()}`}>
          <option value="Cumple">Cumple</option><option value="No Cumple">No cumple</option>
        </Field>)}
      </FormSection>

      <FormSection number="03" title="Contralavados" description="Indique la hora de contralavado de cada tanque, si corresponde.">
        <Field {...fieldProps} name="contralavado_tanque_a" label="Contralavado tanque A" type="time" optional />
        <Field {...fieldProps} name="contralavado_tanque_b" label="Contralavado tanque B" type="time" optional />
      </FormSection>

      <FormSection number="04" title="Rinser" description="Seleccione la línea y registre el resultado de cloro y la presión del rinser.">
        <Field {...fieldProps} name="cloro_riser_linea" label="Cloro Rinser Línea">
          <option value="Linea 1">Línea 1</option><option value="Linea 2">Línea 2</option>
        </Field>
        <Field {...fieldProps} name="cloro_riser_resultado" label="Cloro Rinser Resultado" unit="ppm" />
        <Field {...fieldProps} name="acondicionamiento_rinser" label="Presión del rinser" optional />
      </FormSection>

      <FormSection number="05" title="Responsable" description="Seleccione quién realizó el análisis.">
        <Field {...fieldProps} name="responsable" label="Responsable">
          <option value="">Seleccione responsable…</option>
          {responsables.map((person) => <option key={person.id} value={person.nombre_completo}>{person.nombre_completo}</option>)}
        </Field>
      </FormSection>
    </fieldset>

    <footer className="chlorine-actions">
      <div className="chlorine-feedback" aria-live="polite" aria-atomic="true">
        {feedback ? <p className={`chlorine-message ${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>
          {feedback.type === 'success' && <CheckCircle2 size={18} aria-hidden="true" />}{feedback.text}
        </p> : <span>Verifique las mediciones antes de guardar.</span>}
      </div>
      <div className="chlorine-action-buttons">
        <button type="button" className="btn chlorine-clear" onClick={clear} disabled={saving}><RotateCcw size={16} aria-hidden="true" />Limpiar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}><Save size={17} aria-hidden="true" />{saving ? 'Guardando…' : 'Registrar Análisis'}</button>
      </div>
    </footer>
  </form>;
}
