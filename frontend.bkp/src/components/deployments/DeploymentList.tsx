import React from 'react';
import { useDeployments } from '@/hooks/useDeployments';

export const DeploymentList: React.FC = () => {
  const { deployments, loading, error } = useDeployments();

  if (loading) {
    return <div>Loading deployments...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Deployments</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {deployments.map((deployment) => (
          <div
            key={deployment.id}
            className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-medium">{deployment.name}</h3>
            <p className="text-gray-500">Cluster: {deployment.cluster}</p>
            <p className="text-gray-500">Namespace: {deployment.namespace}</p>
            <p className="text-gray-500">Image: {deployment.image}</p>
            <p className="text-gray-500">Status: {deployment.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}; 