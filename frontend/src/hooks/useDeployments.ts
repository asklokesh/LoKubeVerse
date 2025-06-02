import { useState, useEffect } from 'react';
import axios from 'axios';

interface Deployment {
  id: string;
  name: string;
  cluster: string;
  namespace: string;
  image: string;
  status: string;
}

export const useDeployments = () => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeployments = async () => {
      try {
        const response = await axios.get<Deployment[]>('/api/deployments');
        setDeployments(response.data);
      } catch (err) {
        setError('Failed to fetch deployments');
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
      setError('Failed to create deployment');
      throw err;
    }
  };

  const deleteDeployment = async (id: string) => {
    try {
      await axios.delete(`/api/deployments/${id}`);
      setDeployments((prev) => prev.filter((deployment) => deployment.id !== id));
    } catch (err) {
      setError('Failed to delete deployment');
      throw err;
    }
  };

  return {
    deployments,
    loading,
    error,
    createDeployment,
    deleteDeployment,
  };
}; 