import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Cluster {
  id: string;
  name: string;
  provider: string;
  region: string;
  status: string;
}

export const MultiClusterView: React.FC = () => {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const response = await axios.get('/api/clusters');
        setClusters(response.data);
      } catch (err) {
        setError('Failed to fetch clusters');
      } finally {
        setLoading(false);
      }
    };

    fetchClusters();
  }, []);

  if (loading) return <div>Loading clusters...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Multi-Cluster View</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Provider</th>
            <th>Region</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {clusters.map((cluster) => (
            <tr key={cluster.id}>
              <td>{cluster.name}</td>
              <td>{cluster.provider}</td>
              <td>{cluster.region}</td>
              <td>{cluster.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 