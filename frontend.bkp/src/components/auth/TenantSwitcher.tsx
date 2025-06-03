import React from 'react';

export interface Tenant {
  id: string;
  name: string;
}

interface TenantSwitcherProps {
  tenants: Tenant[];
  currentTenantId: string;
  onSwitch: (tenantId: string) => void;
}

export const TenantSwitcher: React.FC<TenantSwitcherProps> = ({ tenants, currentTenantId, onSwitch }) => {
  return (
    <select
      aria-label="Tenant Switcher"
      value={currentTenantId}
      onChange={e => onSwitch(e.target.value)}
      role="combobox"
    >
      {tenants.map(tenant => (
        <option key={tenant.id} value={tenant.id}>
          {tenant.name}
        </option>
      ))}
    </select>
  );
};
