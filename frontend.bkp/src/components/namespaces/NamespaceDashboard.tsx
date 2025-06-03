import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Namespace {
    id: string;
    name: string;
    cluster_id: string;
    created_at: string;
}

export const NamespaceDashboard: React.FC<{ clusterId: string }> = ({ clusterId }) => {
    const [namespaces, setNamespaces] = useState<Namespace[]>([]);

    useEffect(() => {
        axios.get<Namespace[]>(`/api/clusters/${clusterId}/namespaces`).then(res => setNamespaces(res.data));
    }, [clusterId]);

    return (
        <ul>
            {namespaces.map(ns => (
                <li key={ns.id}>{ns.name}</li>
            ))}
        </ul>
    );
};
