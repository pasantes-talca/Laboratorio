import React, { Children, cloneElement, isValidElement, useId, useRef, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';

export function FormSection({ number, title, description, children, grid = true }) {
  return <fieldset className="lab-section">
    <legend><span className="lab-section-number" aria-hidden="true">{number}</span>{title}</legend>
    {description && <p className="lab-section-description">{description}</p>}
    <div className={grid ? 'form-grid' : 'lab-section-content'}>{children}</div>
  </fieldset>;
}

function fieldMessage(control) {
  if (control.validity.valueMissing) return 'Complete este campo.';
  if (control.validity.rangeUnderflow) return `Ingrese un valor igual o mayor a ${control.min}.`;
  if (control.validity.rangeOverflow) return `Ingrese un valor igual o menor a ${control.max}.`;
  if (control.validity.badInput || control.validity.stepMismatch) return 'Revise el valor ingresado.';
  return control.validationMessage || '';
}

export function FormField({ children, className = 'field-container', ...rest }) {
  const generatedId = useId();
  const [error, setError] = useState('');
  let firstControl;
  const find = (nodes) => Children.forEach(nodes, (node) => {
    if (!isValidElement(node) || firstControl) return;
    if (['input', 'select', 'textarea'].includes(node.type) || node.type?.formControl) firstControl = node;
    else find(node.props.children);
  });
  find(children);
  const id = firstControl?.props.id || `field-${generatedId}`;
  const optional = firstControl && !firstControl.props.required && !firstControl.props.readOnly;
  let bound = false;
  let labelBound = false;
  const bind = (nodes) => Children.map(nodes, (node) => {
    if (!isValidElement(node)) return node;
    if (node.type === 'label' && firstControl && !labelBound) {
      labelBound = true;
      return cloneElement(node, { htmlFor: node.props.htmlFor || id }, <><span>{node.props.children}</span>{optional && <span className="lab-optional">Opcional</span>}</>);
    }
    if (!bound && node === firstControl) {
      bound = true;
      return cloneElement(node, { id, 'aria-invalid': Boolean(error), 'aria-describedby': error ? `${id}-error` : node.props['aria-describedby'] });
    }
    return node.props.children ? cloneElement(node, {}, bind(node.props.children)) : node;
  });
  const check = (event) => {
    if (event.target.validity) setError(fieldMessage(event.target));
  };
  return <div {...rest} className={`${className}${error ? ' lab-field-invalid' : ''}`}
    onBlur={check} onInvalid={check} onChange={(event) => { if (error) check(event); }}>
    {bind(children)}
    {error && <p id={`${id}-error`} className="lab-field-error">{error}</p>}
  </div>;
}

export default function FormLayout({ title, domain, description, children, onSubmit, className = '', compact = false, ...props }) {
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);
  const formRef = useRef(null);
  const titleId = useId();
  return <form {...props} ref={formRef} className={`lab-form ${className}`} aria-labelledby={compact ? undefined : titleId} aria-label={compact ? title : undefined}
    aria-busy={pending} onSubmit={async (event) => {
      event.preventDefault();
      if (inFlight.current) return;
      if (!event.currentTarget.reportValidity()) return;
      inFlight.current = true;
      setPending(true);
      try { await onSubmit?.(event); }
      finally { inFlight.current = false; setPending(false); }
    }}>
    {title && !compact && <header className="lab-heading">
      <div className="lab-heading-icon" aria-hidden="true"><ClipboardCheck size={25} /></div>
      <div><span className="lab-eyebrow">{domain}</span><h2 id={titleId}>{title}</h2><p>{description}</p></div>
    </header>}
    <p className="lab-required-note">Los campos con <span className="required-star">*</span> son obligatorios.</p>
    <fieldset className="lab-editable" disabled={pending}>{children}</fieldset>
    {pending && <span className="lab-save-status" role="status">Guardando registro…</span>}
  </form>;
}
