import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TenantSwitcher } from '@/components/auth/TenantSwitcher';

describe('TenantSwitcher', () => {
  const tenants = [
    { id: '1', name: 'Tenant A' },
    { id: '2', name: 'Tenant B' },
  ];
  const onSwitch = jest.fn();

  it('renders tenant options', () => {
    render(<TenantSwitcher tenants={tenants} currentTenantId="1" onSwitch={onSwitch} />);
    expect(screen.getByText('Tenant A')).toBeInTheDocument();
    expect(screen.getByText('Tenant B')).toBeInTheDocument();
  });

  it('calls onSwitch when a different tenant is selected', () => {
    render(<TenantSwitcher tenants={tenants} currentTenantId="1" onSwitch={onSwitch} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } });
    expect(onSwitch).toHaveBeenCalledWith('2');
  });
});
