import React, { useState } from 'react';
import axios from 'axios';

export const RollbackDeployment: React.FC = () => {
  const [deploymentName, setDeploymentName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleRollback = async () => {
    try {
      await axios.post('/api/deployments/rollback', { name: deploymentName });
      setDeploymentName('');
      setError(null);
    } catch (err) {
      setError('Failed to rollback deployment');
    }
  };

  return (
    <div>
      <h2>Rollback Deployment</h2>
      <input
        type="text"
        value={deploymentName}
        onChange={(e) => setDeploymentName(e.target.value)}
        placeholder="Enter deployment name"
      />
      <button onClick={handleRollback}>Rollback</button>
      {error && <div>{error}</div>}
    </div>
  );
}; 