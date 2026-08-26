import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MultiInputList from './MultiInputList';

// Controlled harness: mirrors real usage where a parent owns items state
function Harness({ initial = [''], ...props }) {
  const [items, setItems] = useState(initial);
  return (
    <div>
      <div data-testid="count">{items.length}</div>
      <MultiInputList items={items} onChange={setItems} {...props} />
    </div>
  );
}

describe('MultiInputList', () => {
  describe('controlled value sync (list <-> onChange)', () => {
    it('renders one input per item with its value', () => {
      render(<MultiInputList items={['Ana', 'Beto']} onChange={() => {}} />);

      expect(screen.getByDisplayValue('Ana')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Beto')).toBeInTheDocument();
    });

    it('typing in an input reports the updated array via onChange', () => {
      const onChange = vi.fn();
      render(<MultiInputList items={['Ana', 'Beto']} onChange={onChange} />);

      fireEvent.change(screen.getByDisplayValue('Beto'), {
        target: { value: 'Roberto' },
      });

      expect(onChange).toHaveBeenCalledWith(['Ana', 'Roberto']);
    });

    it('keeps parent state in sync across add/type cycles', () => {
      render(<Harness />);

      // default single empty input
      expect(screen.getByTestId('count')).toHaveTextContent('1');

      fireEvent.click(
        screen.getByRole('button', { name: /Agregar elemento/ })
      );
      expect(screen.getByTestId('count')).toHaveTextContent('2');

      fireEvent.change(screen.getAllByRole('textbox')[1], {
        target: { value: 'nuevo' },
      });
      // value round-trips through parent state
      expect(screen.getByDisplayValue('nuevo')).toBeInTheDocument();
    });
  });

  describe('initial values rendering', () => {
    it('renders a single empty input by default when no items prop given', () => {
      render(<MultiInputList onChange={() => {}} />);
      const input = screen.getByPlaceholderText('Ingrese un valor...');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('');
    });
  });

  describe('add behavior', () => {
    it('appends an empty item via onChange when add is clicked', () => {
      const onChange = vi.fn();
      render(<MultiInputList items={['x']} onChange={onChange} />);

      fireEvent.click(screen.getByRole('button', { name: /Agregar elemento/ }));

      expect(onChange).toHaveBeenCalledWith(['x', '']);
    });

    it('uses the custom addButtonText label', () => {
      render(<MultiInputList items={['']} onChange={() => {}} addButtonText="Otro responsable" />);
      expect(
        screen.getByRole('button', { name: 'Otro responsable' })
      ).toBeInTheDocument();
    });
  });

  describe('remove behavior', () => {
    it('removes the correct row via onChange', () => {
      const onChange = vi.fn();
      render(<MultiInputList items={['a', 'b', 'c']} onChange={onChange} />);

      const removeButtons = screen.getAllByTitle('Quitar fila');
      fireEvent.click(removeButtons[1]); // remove 'b'

      expect(onChange).toHaveBeenCalledWith(['a', 'c']);
    });

    it('hides remove buttons when there is only one row', () => {
      render(<MultiInputList items={['única']} onChange={() => {}} />);
      expect(screen.queryByTitle('Quitar fila')).not.toBeInTheDocument();
    });

    it('shows one remove button per row once multiple rows exist', () => {
      render(<Harness initial={['a', 'b']} />);
      expect(screen.getAllByTitle('Quitar fila')).toHaveLength(2);
    });
  });

  describe('select variant', () => {
    it('renders selects with options and reports selection changes', () => {
      const onChange = vi.fn();
      render(
        <MultiInputList
          type="select"
          items={['']}
          options={[
            { value: 't1', label: 'Tanque 1' },
            { value: 't2', label: 'Tanque 2' },
          ]}
          placeholder="Elegí tanque"
          onChange={onChange}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('');
      expect(screen.getByRole('option', { name: 'Tanque 1' })).toBeInTheDocument();

      fireEvent.change(select, { target: { value: 't2' } });
      expect(onChange).toHaveBeenCalledWith(['t2']);
    });
  });

  it('marks only the first row required when required=true', () => {
    render(<MultiInputList items={['', '']} onChange={() => {}} required />);

    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toBeRequired();
    expect(inputs[1]).not.toBeRequired();
  });
});
