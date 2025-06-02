import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Metric {
    id: string;
    metric: string;
    value: number;
    cluster_id: string;
}

export const MonitoringDashboard: React.FC<{ clusterId: string }> = ({ clusterId }) => {
    const [metrics, setMetrics] = useState<Metric[]>([]);

    useEffect(() => {
        axios.get(`/api/clusters/${clusterId}/metrics`).then(res => setMetrics(res.data));
    }, [clusterId]);

    return (
        <ul>
            {metrics.map(m => (
                <li key={m.id}>{m.metric}: {m.value}</li>
            ))}
        </ul>
    );
};
