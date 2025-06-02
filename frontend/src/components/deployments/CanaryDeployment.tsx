import React, { useState } from 'react';
import axios from 'axios';

export const CanaryDeployment: React.FC = () => {
  const [deploymentName, setDeploymentName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleDeploy = async () => {
    try {
      await axios.post('/api/deployments/canary', { name: deploymentName });
      setDeploymentName('');
      setError(null);
    } catch (err) {
      setError('Failed to deploy canary');
    }
  };

  return (
    <div>
      <h2>Canary Deployment</h2>
      <input
        type="text"
        value={deploymentName}
        onChange={(e) => setDeploymentName(e.target.value)}
        placeholder="Enter deployment name"
      />
      <button onClick={handleDeploy}>Deploy</button>
      {error && <div>{error}</div>}
    </div>
  );
}; 