import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Workload {
    id: string;
    name: string;
    status: string;
    namespace_id: string;
    cluster_id: string;
}

export const WorkloadDashboard: React.FC<{ clusterId: string; namespaceId: string }> = ({ clusterId, namespaceId }) => {
    const [workloads, setWorkloads] = useState<Workload[]>([]);

    useEffect(() => {
        axios.get(`/api/clusters/${clusterId}/namespaces/${namespaceId}/workloads`).then(res => setWorkloads(res.data));
    }, [clusterId, namespaceId]);

    return (
        <ul>
            {workloads.map(wl => (
                <li key={wl.id}>{wl.name} - {wl.status}</li>
            ))}
        </ul>
    );
};
