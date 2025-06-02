import React, { useState } from 'react';
import { useClusters } from '@/hooks/useClusters';

export const CreateClusterForm: React.FC = () => {
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('');
  const [region, setRegion] = useState('');
  const [error, setError] = useState('');
  const { createCluster } = useClusters();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCluster({ name, provider, region });
      setName('');
      setProvider('');
      setRegion('');
    } catch (err) {
      setError('Failed to create cluster');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>
      <div>
        <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
          Provider
        </label>
        <select
          id="provider"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Select provider</option>
          <option value="aws">AWS</option>
          <option value="azure">Azure</option>
          <option value="gcp">GCP</option>
        </select>
      </div>
      <div>
        <label htmlFor="region" className="block text-sm font-medium text-gray-700">
          Region
        </label>
        <input
          type="text"
          id="region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Create Cluster
      </button>
    </form>
  );
}; 