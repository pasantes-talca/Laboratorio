import React from 'react';
import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ControlChart from './ControlChart';

const sampleData = [
  { label: '08:00', valor: 4.2 },
  { label: '12:00', valor: 4.5 },
  { label: '16:00', valor: null },
];

describe('ControlChart (smoke)', () => {
  it('separates flavor paths and evaluates equal values against their own limits', () => {
    render(<ControlChart byProduct unit="Vol" data={[
      { label: '08:00', valor: 4.3, limiteMin: 4, limiteMax: 4.7, series: { key: 'cola', label: 'Cola', color: '#0077B6' } },
      { label: '09:00', valor: 4.3, limiteMin: 3, limiteMax: 3.5, series: { key: 'naranja', label: 'Naranja', color: '#CA650B' } },
    ]} />);
    const groups = document.querySelectorAll('[data-product-series]');
    expect(groups).toHaveLength(2);
    for (const group of groups) expect(group.querySelector('path[stroke-width="2.4"]').getAttribute('d')).not.toContain('L');
    expect(document.querySelector('[data-product="cola"]')).toHaveAttribute('data-out-of-spec', 'false');
    expect(document.querySelector('[data-product="naranja"]')).toHaveAttribute('data-out-of-spec', 'true');
    fireEvent.focus(document.querySelector('[data-product="naranja"]'));
    expect(document.querySelector('.chart-tooltip-popup')).toHaveTextContent('Naranja');
    expect(document.querySelector('.chart-tooltip-popup')).toHaveTextContent('3 - 3.5');
  });
  it('shows an explicit empty state when there are only specification limits', () => {
    render(<ControlChart data={[]} staticLimits={{ min: 4, max: 5, objetivo: 4.5 }} />);
    expect(screen.getByText('Sin mediciones')).toBeInTheDocument();
    expect(document.querySelector('svg')).toBeNull();
  });
  it('renders title and SVG chart for time series data', () => {
    render(
      <ControlChart
        type="time"
        title="Carbonatación"
        data={sampleData}
        staticLimits={{ min: 4.0, max: 4.7, objetivo: 4.2 }}
        yAxisLabel="CAB"
        unit="v/v"
      />
    );

    expect(screen.getByText('Carbonatación')).toBeInTheDocument();
    expect(document.querySelector('svg.control-chart-svg')).not.toBeNull();
    expect(document.querySelector('.control-chart-svg-wrapper')).not.toBeNull();
  });

  it('renders N/A box when notApplicable=true and skips the SVG chart', () => {
    render(
      <ControlChart
        type="time"
        title="Torque corto"
        data={sampleData}
        notApplicable
        notApplicableMessage="No aplica para este producto"
      />
    );

    expect(screen.getByText('N/A')).toBeInTheDocument();
    expect(screen.getByText('No aplica para este producto')).toBeInTheDocument();
    expect(document.querySelector('.control-chart-svg')).toBeNull();
  });
});
