import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface CostData {
  id: string;
  cluster: string;
  cost: number;
  period: string;
}

export const CostDashboard: React.FC = () => {
  const [costs, setCosts] = useState<CostData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCosts = async () => {
      try {
        const response = await axios.get('/api/costs');
        setCosts(response.data);
      } catch (err) {
        setError('Failed to fetch cost data');
      } finally {
        setLoading(false);
      }
    };

    fetchCosts();
  }, []);

  if (loading) return <div>Loading cost data...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Cost Dashboard</h2>
      <table>
        <thead>
          <tr>
            <th>Cluster</th>
            <th>Cost</th>
            <th>Period</th>
          </tr>
        </thead>
        <tbody>
          {costs.map((cost) => (
            <tr key={cost.id}>
              <td>{cost.cluster}</td>
              <td>${cost.cost}</td>
              <td>{cost.period}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 