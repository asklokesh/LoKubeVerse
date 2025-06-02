import React, { useState } from 'react';
import axios from 'axios';

export const BlueGreenDeployment: React.FC = () => {
  const [deploymentName, setDeploymentName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleDeploy = async () => {
    try {
      await axios.post('/api/deployments/blue-green', { name: deploymentName });
      setDeploymentName('');
      setError(null);
    } catch (err) {
      setError('Failed to deploy blue/green');
    }
  };

  return (
    <div>
      <h2>Blue/Green Deployment</h2>
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