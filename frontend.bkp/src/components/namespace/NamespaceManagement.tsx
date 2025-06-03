import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Namespace {
  id: string;
  name: string;
  cluster: string;
  status: string;
}

export const NamespaceManagement: React.FC = () => {
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNamespaces = async () => {
      try {
        const response = await axios.get('/api/namespaces');
        setNamespaces(response.data);
      } catch (err) {
        setError('Failed to fetch namespaces');
      } finally {
        setLoading(false);
      }
    };

    fetchNamespaces();
  }, []);

  const handleDeleteNamespace = async (id: string) => {
    try {
      await axios.delete(`/api/namespaces/${id}`);
      setNamespaces(namespaces.filter(ns => ns.id !== id));
    } catch (err) {
      setError('Failed to delete namespace');
    }
  };

  if (loading) return <div>Loading namespaces...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Namespace Management</h2>
      <ul>
        {namespaces.map((namespace) => (
          <li key={namespace.id}>
            {namespace.name} - {namespace.cluster} - {namespace.status}
            <button onClick={() => handleDeleteNamespace(namespace.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}; 