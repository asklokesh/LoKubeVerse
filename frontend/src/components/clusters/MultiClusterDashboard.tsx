import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Cluster {
    id: string;
    name: string;
    provider: string;
}

export const MultiClusterDashboard: React.FC = () => {
    const [clusters, setClusters] = useState<Cluster[]>([]);

    useEffect(() => {
        axios.get('/api/clusters').then(res => setClusters(res.data));
    }, []);

    return (
        <ul>
            {clusters.map(c => (
                <li key={c.id}>{c.name} ({c.provider})</li>
            ))}
        </ul>
    );
};
