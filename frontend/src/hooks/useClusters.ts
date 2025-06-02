import { useState, useEffect } from 'react';
import axios from 'axios';

interface Cluster {
  id: string;
  name: string;
  provider: string;
  region: string;
  status: string;
}

export const useClusters = () => {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const response = await axios.get<Cluster[]>('/api/clusters');
        setClusters(response.data);
      } catch (err) {
        setError('Failed to fetch clusters');
      } finally {
        setLoading(false);
      }
    };

    fetchClusters();
  }, []);

  const createCluster = async (data: Omit<Cluster, 'id' | 'status'>) => {
    try {
      const response = await axios.post<Cluster>('/api/clusters', data);
      setClusters((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError('Failed to create cluster');
      throw err;
    }
  };

  const deleteCluster = async (id: string) => {
    try {
      await axios.delete(`/api/clusters/${id}`);
      setClusters((prev) => prev.filter((cluster) => cluster.id !== id));
    } catch (err) {
      setError('Failed to delete cluster');
      throw err;
    }
  };

  return {
    clusters,
    loading,
    error,
    createCluster,
    deleteCluster,
  };
}; 