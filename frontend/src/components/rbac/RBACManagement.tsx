import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface RBACRule {
  id: string;
  role: string;
  resource: string;
  action: string;
}

export const RBACManagement: React.FC = () => {
  const [rules, setRules] = useState<RBACRule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await axios.get('/api/rbac/rules');
        setRules(response.data);
      } catch (err) {
        setError('Failed to fetch RBAC rules');
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, []);

  const handleDeleteRule = async (id: string) => {
    try {
      await axios.delete(`/api/rbac/rules/${id}`);
      setRules(rules.filter(rule => rule.id !== id));
    } catch (err) {
      setError('Failed to delete RBAC rule');
    }
  };

  if (loading) return <div>Loading RBAC rules...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>RBAC Management</h2>
      <ul>
        {rules.map((rule) => (
          <li key={rule.id}>
            {rule.role} - {rule.resource} - {rule.action}
            <button onClick={() => handleDeleteRule(rule.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}; 