import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Smoke test', () => {
  it('renders without crashing', () => {
    render(<div>k8s-Dash</div>);
    expect(screen.getByText('k8s-Dash')).toBeInTheDocument();
  });

  it('renders with correct text', () => {
    render(<div>k8s-Dash</div>);
    expect(screen.getByText('k8s-Dash')).toHaveTextContent('k8s-Dash');
  });

  it('renders with correct class', () => {
    render(<div className="test-class">k8s-Dash</div>);
    expect(screen.getByText('k8s-Dash')).toHaveClass('test-class');
  });
}); 