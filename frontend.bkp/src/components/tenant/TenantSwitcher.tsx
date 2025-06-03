import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useErrorHandler } from '../../../../frontend/src/hooks/useErrorHandler';

interface Tenant {
    id: string;
    name: string;
}

export const TenantSwitcher = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [currentTenant, setCurrentTenant] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { getErrorMessage } = useErrorHandler();

    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const response = await axios.get<Tenant[]>('/api/tenants');
                setTenants(response.data);
                setCurrentTenant(response.data[0]?.id || '');
                setError(null);
            } catch (err) {
                setError(getErrorMessage(err, 'Failed to fetch tenants'));
            } finally {
                setLoading(false);
            }
        };

        fetchTenants();
    }, [getErrorMessage]);

    const handleTenantChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedTenant = event.target.value;
        setCurrentTenant(selectedTenant);
        try {
            await axios.post('/api/tenants/switch', { tenantId: selectedTenant });
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to switch tenant'));
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="flex items-center space-x-2">
            <label htmlFor="tenant-select" className="text-sm font-medium text-gray-700">
                Select Organization:
            </label>
            <select
                id="tenant-select"
                value={currentTenant}
                onChange={handleTenantChange}
                className="appearance-none block pl-3 pr-10 py-1.5 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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