import React from 'react';
import { useClusters } from '@/hooks/useClusters';

export const ClusterList: React.FC = () => {
  const { clusters, loading, error } = useClusters();

  if (loading) {
    return <div>Loading clusters...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Clusters</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clusters.map((cluster) => (
          <div
            key={cluster.id}
            className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-medium">{cluster.name}</h3>
            <p className="text-gray-500">Provider: {cluster.provider}</p>
            <p className="text-gray-500">Region: {cluster.region}</p>
            <p className="text-gray-500">Status: {cluster.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}; 