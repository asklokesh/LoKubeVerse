import React, { useState, useEffect } from 'react';
import { useDeployments } from '@/hooks/useDeployments'; // Assuming deployments hook has namespace info or similar

interface Namespace {
  id: string;
  name: string;
  // Add other relevant namespace properties
}

const NamespaceList: React.FC = () => {
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Fetch namespaces from backend API
    const fetchNamespaces = async () => {
      try {
        // Replace with actual API call using your API client
        // const response = await api.get<Namespace[]>('/api/namespaces');
        // setNamespaces(response.data);
        setNamespaces([ // Placeholder data
            { id: 'ns-1', name: 'default' },
            { id: 'ns-2', name: 'kube-system' },
            { id: 'ns-3', name: 'my-app-ns' },
        ])
      } catch (err) {
        setError('Failed to fetch namespaces');
      } finally {
        setLoading(false);
      }
    };

    fetchNamespaces();
  }, []);

  if (loading) {
    return <div>Loading namespaces...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Namespaces</h2>
      {namespaces.length > 0 ? (
        <ul className="divide-y divide-gray-200 bg-white shadow-md rounded-lg">
          {namespaces.map((ns) => (
            <li key={ns.id} className="p-4 flex items-center justify-between">
              <div className="text-sm font-medium text-gray-900">{ns.name}</div>
              {/* TODO: Add actions like view details, delete, etc. */}
              <div>
                <button className="text-primary-600 hover:text-primary-900 text-sm">Manage</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No namespaces found.</p>
      )}
    </div>
  );
};

export default NamespaceList; 