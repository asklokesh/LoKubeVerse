import { useState, useEffect } from 'react';
import api from '../config/api';
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
        const response = await api.get<Cluster[]>('/clusters');
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
      const response = await api.post<Cluster>('/clusters', data);
      setClusters((prev) => [...prev, response.data]);
      setError(null); // Clear any previous errors on success
      return response.data;
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Failed to create cluster');
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteCluster = async (id: string) => {
    try {
      await api.delete(`/clusters/${id}`);
      setClusters((prev) => prev.filter((cluster) => cluster.id !== id));
      setError(null); // Clear any previous errors on success
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