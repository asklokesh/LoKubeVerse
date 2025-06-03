import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Quota {
    id: string;
    spec: Record<string, any>;
    namespace_id: string;
    cluster_id: string;
}

export const QuotaDashboard: React.FC<{ clusterId: string; namespaceId: string }> = ({ clusterId, namespaceId }) => {
    const [quotas, setQuotas] = useState<Quota[]>([]);

    useEffect(() => {
        axios.get<Quota[]>(`/api/clusters/${clusterId}/namespaces/${namespaceId}/quotas`).then(res => setQuotas(res.data));
    }, [clusterId, namespaceId]);

    return (
        <ul>
            {quotas.map(q => (
                <li key={q.id}>{JSON.stringify(q.spec)}</li>
            ))}
        </ul>
    );
};
