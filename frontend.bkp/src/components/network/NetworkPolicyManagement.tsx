import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface NetworkPolicy {
  id: string;
  name: string;
  namespace: string;
  rules: string[];
}

export const NetworkPolicyManagement: React.FC = () => {
  const [policies, setPolicies] = useState<NetworkPolicy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const response = await axios.get('/api/network/policies');
        setPolicies(response.data);
      } catch (err) {
        setError('Failed to fetch network policies');
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  const handleDeletePolicy = async (id: string) => {
    try {
      await axios.delete(`/api/network/policies/${id}`);
      setPolicies(policies.filter(policy => policy.id !== id));
    } catch (err) {
      setError('Failed to delete network policy');
    }
  };

  if (loading) return <div>Loading network policies...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Network Policy Management</h2>
      <ul>
        {policies.map((policy) => (
          <li key={policy.id}>
            {policy.name} - {policy.namespace} - {policy.rules.join(', ')}
            <button onClick={() => handleDeletePolicy(policy.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}; 