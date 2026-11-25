import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import ParteJarabeForm from './ParteJarabeForm';

it('shows an imported flavor even when it is missing from the catalog', () => {
  const setParteForm = vi.fn();
  const state = { fecha: '2026-10-23', turno: 'Mañana', tanque: '1', numero_carga_trilay: '123', sabor: 'POMELO ESPECIAL TRILAY', responsables: ['Ana'] };
  render(<ParteJarabeForm responsables={[]} sabores={[{ id: 1, nombre: 'Naranja' }]} tanquesCatalog={[]} parteForm={state} setParteForm={setParteForm} handleParteSubmit={vi.fn()} handleExcelUpload={vi.fn()} />);
  expect(screen.getByLabelText(/^Sabor/)).toHaveValue('POMELO ESPECIAL TRILAY');
  expect(screen.getByRole('option', { name: 'POMELO ESPECIAL TRILAY' }).selected).toBe(true);
  fireEvent.change(screen.getByLabelText(/^Sabor/), { target: { value: 'Naranja' } });
  expect(setParteForm).toHaveBeenCalledWith({ ...state, sabor: 'Naranja' });
});
