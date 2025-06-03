import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface NetworkPolicy {
    id: string;
    spec: Record<string, any>;
    namespace_id: string;
    cluster_id: string;
}

export const NetworkPolicyDashboard: React.FC<{ clusterId: string; namespaceId: string }> = ({ clusterId, namespaceId }) => {
    const [policies, setPolicies] = useState<NetworkPolicy[]>([]);

    useEffect(() => {
        axios.get<NetworkPolicy[]>(`/api/clusters/${clusterId}/namespaces/${namespaceId}/networkpolicies`).then(res => setPolicies(res.data));
    }, [clusterId, namespaceId]);

    return (
        <ul>
            {policies.map(p => (
                <li key={p.id}>{JSON.stringify(p.spec)}</li>
            ))}
        </ul>
    );
};
