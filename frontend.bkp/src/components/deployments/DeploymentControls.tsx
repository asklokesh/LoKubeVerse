import React from 'react';
import axios from 'axios';

export const DeploymentControls: React.FC<{ deploymentId: string }> = ({ deploymentId }) => {
    const handleBlueGreen = () => axios.post(`/api/deployments/${deploymentId}/bluegreen`);
    const handleCanary = () => axios.post(`/api/deployments/${deploymentId}/canary`);
    const handleRollback = () => axios.post(`/api/deployments/${deploymentId}/rollback`);

    return (
        <div>
            <button onClick={handleBlueGreen}>Blue-Green</button>
            <button onClick={handleCanary}>Canary</button>
            <button onClick={handleRollback}>Rollback</button>
        </div>
    );
};
