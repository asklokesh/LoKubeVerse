import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Cost {
    id: string;
    amount: number;
    currency: string;
    period: string;
    cluster_id: string;
}

export const CostDashboard: React.FC<{ clusterId: string }> = ({ clusterId }) => {
    const [costs, setCosts] = useState<Cost[]>([]);

    useEffect(() => {
        axios.get<Cost[]>(`/api/clusters/${clusterId}/costs`).then(res => setCosts(res.data));
    }, [clusterId]);

    return (
        <ul>
            {costs.map(cost => (
                <li key={cost.id}>{cost.amount} {cost.currency} ({cost.period})</li>
            ))}
        </ul>
    );
};
