import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Tenant {
  id: string;
  name: string;
}

export const TenantSwitcher: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenant, setCurrentTenant] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await axios.get('/api/tenants');
        setTenants(response.data);
        setCurrentTenant(response.data[0]?.id || '');
      } catch (err) {
        setError('Failed to fetch tenants');
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const handleTenantChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentTenant(event.target.value);
  };

  if (loading) return <div>Loading tenants...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <label htmlFor="tenant-select">Select Tenant:</label>
      <select
        id="tenant-select"
        value={currentTenant}
        onChange={handleTenantChange}
      >
        {tenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.name}
          </option>
        ))}
      </select>
    </div>
  );
}; 