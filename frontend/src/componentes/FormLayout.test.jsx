import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import FormLayout, { FormField, FormSection } from './FormLayout';

it('associates labels and shows the field validation message on blur', () => {
  render(<FormLayout title="Control de prueba" onSubmit={vi.fn()}>
    <FormSection number="01" title="Mediciones">
      <FormField><label>Resultado</label><input type="number" min="0" required /></FormField>
    </FormSection>
    <div className="form-actions"><button type="submit">Guardar</button></div>
  </FormLayout>);
  const input = screen.getByLabelText('Resultado');
  fireEvent.blur(input);
  expect(screen.getByText('Complete este campo.')).toBeInTheDocument();
  expect(input).toHaveAttribute('aria-invalid', 'true');
  fireEvent.change(input, { target: { value: '0' } });
  expect(input).toHaveAttribute('aria-invalid', 'false');
});

it('blocks duplicate submissions while saving and enables controls afterward', async () => {
  let finish;
  const save = vi.fn(() => new Promise((resolve) => { finish = resolve; }));
  render(<FormLayout title="Registro" onSubmit={save}>
    <FormField><label>Dato</label><input defaultValue="Completo" required /></FormField>
    <div className="form-actions"><button type="submit">Guardar</button></div>
  </FormLayout>);
  const form = screen.getByRole('form', { name: 'Registro' });
  fireEvent.submit(form);
  fireEvent.submit(form);
  expect(save).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled();
  await act(async () => finish());
  await waitFor(() => expect(screen.getByRole('button', { name: 'Guardar' })).toBeEnabled());
});
