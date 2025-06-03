import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface RBAC {
    id: string;
    rules: Record<string, any>;
    cluster_id: string;
}

export const RBACDashboard: React.FC<{ clusterId: string }> = ({ clusterId }) => {
    const [rbacRules, setRbacRules] = useState<RBAC[]>([]);

    useEffect(() => {
        axios.get<RBAC[]>(`/api/clusters/${clusterId}/rbac`).then(res => setRbacRules(res.data));
    }, [clusterId]);

    return (
        <ul>
            {rbacRules.map(rbac => (
                <li key={rbac.id}>{JSON.stringify(rbac.rules)}</li>
            ))}
        </ul>
    );
};
