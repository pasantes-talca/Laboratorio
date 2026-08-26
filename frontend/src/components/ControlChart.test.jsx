import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ControlChart from './ControlChart';

const sampleData = [
  { label: '08:00', valor: 4.2 },
  { label: '12:00', valor: 4.5 },
  { label: '16:00', valor: null },
];

describe('ControlChart (smoke)', () => {
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
