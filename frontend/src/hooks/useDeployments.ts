import { useState, useEffect } from 'react';
import axios from 'axios';
import { useErrorHandler } from './useErrorHandler';

export interface Deployment {
  id: string;
  name: string;
  cluster: string;
  namespace: string;
  image: string;
  status: string;
  replicas?: number;
  created?: string;
}

export const useDeployments = () => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getErrorMessage } = useErrorHandler();

  useEffect(() => {
    const fetchDeployments = async () => {
      try {
        const response = await axios.get<Deployment[]>('/api/deployments');
        setDeployments(response.data);
      } catch (err) {
        console.error('Error fetching deployments:', err);
        setError(getErrorMessage(err, 'Failed to fetch deployments'));
      } finally {
        setLoading(false);
      }
    };

    fetchDeployments();
  }, []);

  const createDeployment = async (data: Omit<Deployment, 'id' | 'status'>) => {
    try {
      const response = await axios.post<Deployment>('/api/deployments', data);
      setDeployments((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Failed to create deployment');
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteDeployment = async (id: string) => {
    try {
      await axios.delete(`/api/deployments/${id}`);
      setDeployments((prev) => prev.filter((deployment) => deployment.id !== id));
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Failed to delete deployment');
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    deployments,
    loading,
    error,
    createDeployment,
    deleteDeployment,
    clearError
  };
}; 