import { useState, useEffect } from 'react';
import axios from 'axios';
import { useErrorHandler } from './useErrorHandler';

export interface Cluster {
  id: string;
  name: string;
  provider: string;
  region: string;
  status: string;
  version?: string;
  nodes?: number;
  created?: string;
}

export const useClusters = () => {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getErrorMessage } = useErrorHandler();

  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const response = await axios.get<Cluster[]>('/api/clusters');
        setClusters(response.data);
      } catch (err) {
        console.error('Error fetching clusters:', err);
        setError(getErrorMessage(err, 'Failed to fetch clusters'));
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
      const errorMessage = getErrorMessage(err, 'Failed to create cluster');
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteCluster = async (id: string) => {
    try {
      await axios.delete(`/api/clusters/${id}`);
      setClusters((prev) => prev.filter((cluster) => cluster.id !== id));
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Failed to delete cluster');
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    clusters,
    loading,
    error,
    createCluster,
    deleteCluster,
    clearError
  };
}; 