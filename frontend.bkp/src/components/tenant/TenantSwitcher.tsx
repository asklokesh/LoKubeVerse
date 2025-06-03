import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface Tenant {
  id: string;
  name: string;
}

/*
 * TenantSwitcher
 * 
 * This component allows users to switch between different tenants (organizations)
 * in a multi-tenant application.
 * 
 * Recent updates:
 * - Fixed syntax issues in useEffect
 * - Improved error handling with useErrorHandler hook
 * - Enhanced UI with better loading and error states
 * - Added support for fetching tenants from the mock API
 */

export const TenantSwitcher: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([
    { id: 'tenant-1', name: 'Organization A' },
    { id: 'tenant-2', name: 'Organization B' },
    { id: 'tenant-3', name: 'Personal Account' }
  ]);
  const [currentTenant, setCurrentTenant] = useState<string>('tenant-1');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { getErrorMessage } = useErrorHandler();

  useEffect(() => {
    // This is using pre-defined mock data
    // In production, this would make an API call to fetch tenants

    const fetchTenants = async () => {
      setLoading(true);
      try {
        // We're using the mock data provider instead of a real API call
        const response = await axios.get('/api/tenants');
        // If we get a response from the mock provider, use it
        // Otherwise fallback to the hardcoded mock data
        if (response?.data?.length) {
          setTenants(response.data);
          setCurrentTenant(response.data[0]?.id || '');
        }
        setError(null);
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to fetch tenants'));
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [getErrorMessage]);

  const handleTenantChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentTenant(event.target.value);
  };

  if (loading) {
    return (
      <div className="inline-flex items-center px-3 py-1.5 text-sm text-gray-500">
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="inline-flex items-center px-3 py-1.5 text-sm text-red-600">
        <svg className="h-4 w-4 mr-1.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        {error}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="tenant-select" className="text-sm font-medium text-gray-700 sr-only">
        Select Organization:
      </label>
      <div className="relative">
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
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
};