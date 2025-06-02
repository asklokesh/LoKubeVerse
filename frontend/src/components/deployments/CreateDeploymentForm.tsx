import React, { useState } from 'react';
import { useDeployments } from '@/hooks/useDeployments';
import { useClusters } from '@/hooks/useClusters';

export const CreateDeploymentForm: React.FC = () => {
  const [name, setName] = useState('');
  const [cluster, setCluster] = useState('');
  const [namespace, setNamespace] = useState('');
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  const { createDeployment } = useDeployments();
  const { clusters } = useClusters();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDeployment({ name, cluster, namespace, image });
      setName('');
      setCluster('');
      setNamespace('');
      setImage('');
    } catch (err) {
      setError('Failed to create deployment');
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
        <label htmlFor="cluster" className="block text-sm font-medium text-gray-700">
          Cluster
        </label>
        <select
          id="cluster"
          value={cluster}
          onChange={(e) => setCluster(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Select cluster</option>
          {clusters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="namespace" className="block text-sm font-medium text-gray-700">
          Namespace
        </label>
        <input
          type="text"
          id="namespace"
          value={namespace}
          onChange={(e) => setNamespace(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
          Image
        </label>
        <input
          type="text"
          id="image"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Create Deployment
      </button>
    </form>
  );
}; 