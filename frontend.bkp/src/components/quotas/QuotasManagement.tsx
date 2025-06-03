import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Quota {
  id: string;
  namespace: string;
  resource: string;
  limit: number;
}

export const QuotasManagement: React.FC = () => {
  const [quotas, setQuotas] = useState<Quota[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuotas = async () => {
      try {
        const response = await axios.get('/api/quotas');
        setQuotas(response.data);
      } catch (err) {
        setError('Failed to fetch quotas');
      } finally {
        setLoading(false);
      }
    };

    fetchQuotas();
  }, []);

  const handleDeleteQuota = async (id: string) => {
    try {
      await axios.delete(`/api/quotas/${id}`);
      setQuotas(quotas.filter(quota => quota.id !== id));
    } catch (err) {
      setError('Failed to delete quota');
    }
  };

  if (loading) return <div>Loading quotas...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Quotas Management</h2>
      <ul>
        {quotas.map((quota) => (
          <li key={quota.id}>
            {quota.namespace} - {quota.resource} - {quota.limit}
            <button onClick={() => handleDeleteQuota(quota.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}; 