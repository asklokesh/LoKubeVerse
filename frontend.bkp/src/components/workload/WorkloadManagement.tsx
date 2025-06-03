import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Workload {
  id: string;
  name: string;
  namespace: string;
  type: string;
  status: string;
}

export const WorkloadManagement: React.FC = () => {
  const [workloads, setWorkloads] = useState<Workload[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkloads = async () => {
      try {
        const response = await axios.get('/api/workloads');
        setWorkloads(response.data);
      } catch (err) {
        setError('Failed to fetch workloads');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkloads();
  }, []);

  const handleDeleteWorkload = async (id: string) => {
    try {
      await axios.delete(`/api/workloads/${id}`);
      setWorkloads(workloads.filter(wl => wl.id !== id));
    } catch (err) {
      setError('Failed to delete workload');
    }
  };

  if (loading) return <div>Loading workloads...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Workload Management</h2>
      <ul>
        {workloads.map((workload) => (
          <li key={workload.id}>
            {workload.name} - {workload.namespace} - {workload.type} - {workload.status}
            <button onClick={() => handleDeleteWorkload(workload.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}; 