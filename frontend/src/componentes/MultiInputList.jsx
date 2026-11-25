import React from 'react';
import { Plus, Minus, UserCheck } from 'lucide-react';

export default function MultiInputList({
  items = [''],
  onChange,
  type = 'text',
  options = [],
  placeholder = 'Ingrese un valor...',
  addButtonText = 'Agregar elemento',
  icon: Icon = UserCheck,
  required = false,
  id,
  'aria-invalid': invalid,
  'aria-describedby': describedBy,
}) {
  const handleItemChange = (index, value) => {
    const updated = [...items];
    updated[index] = value;
    onChange(updated);
  };

  const handleAdd = () => {
    onChange([...items, '']);
  };

  const handleRemove = (index) => {
    if (items.length <= 1) return;
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="field-container">
      <div className="multi-resp-container">
        {items.map((val, idx) => (
          <div key={idx} className="multi-resp-row">
            <div className="input-wrapper" style={{ flex: 1 }}>
              {Icon && <Icon className="input-icon" size={18} />}
              {type === 'select' ? (
                <select
                  id={id ? (idx === 0 ? id : `${id}-${idx}`) : undefined}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  aria-label={idx > 0 ? `${placeholder} ${idx + 1}` : undefined}
                  value={val}
                  required={required && idx === 0}
                  onChange={(e) => handleItemChange(idx, e.target.value)}
                >
                  <option value="" disabled>
                    {placeholder}
                  </option>
                  {options.map((opt, oIdx) => (
                    <option key={oIdx} value={opt.value || opt}>
                      {opt.label || opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={id ? (idx === 0 ? id : `${id}-${idx}`) : undefined}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  aria-label={idx > 0 ? `${placeholder} ${idx + 1}` : undefined}
                  type={type}
                  value={val}
                  required={required && idx === 0}
                  placeholder={placeholder}
                  onChange={(e) => handleItemChange(idx, e.target.value)}
                />
              )}
            </div>
            {items.length > 1 && (
              <button
                type="button"
                className="btn-resp-remove"
                title="Quitar fila"
                onClick={() => handleRemove(idx)}
              >
                <Minus size={18} />
              </button>
            )}
          </div>
        ))}
      </div>
      <button type="button" className="btn-resp-add" onClick={handleAdd}>
        <Plus size={16} /> {addButtonText}
      </button>
    </div>
  );
}

MultiInputList.formControl = true;
