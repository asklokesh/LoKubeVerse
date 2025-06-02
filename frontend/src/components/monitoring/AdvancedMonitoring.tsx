import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface MonitoringData {
  id: string;
  metric: string;
  value: number;
  timestamp: string;
}

export const AdvancedMonitoring: React.FC = () => {
  const [data, setData] = useState<MonitoringData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/monitoring');
        setData(response.data);
      } catch (err) {
        setError('Failed to fetch monitoring data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading monitoring data...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Advanced Monitoring</h2>
      <table>
        <thead>
          <tr>
            <th>Metric</th>
            <th>Value</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.metric}</td>
              <td>{item.value}</td>
              <td>{item.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 