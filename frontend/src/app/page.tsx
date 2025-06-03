import React, { useState, useEffect } from 'react';
import { fetchTenants, fetchClusters } from '../services/api';

interface Tenant {
    id: string;
    name: string;
}

interface Cluster {
    id: string;
    name: string;
}

const Page = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [clusters, setClusters] = useState<Cluster[]>([]);

    useEffect(() => {
        const loadTenants = async () => {
            try {
                const tenants = await fetchTenants();
                setTenants(tenants);
            } catch (error) {
                console.error('Failed to load tenants:', error);
            }
        };

        const loadClusters = async () => {
            try {
                const clusters = await fetchClusters();
                setClusters(clusters);
            } catch (error) {
                console.error('Failed to load clusters:', error);
            }
        };

        loadTenants();
        loadClusters();
    }, []);

    return (
        <div>
            <h1>Tenants</h1>
            <ul>
                {tenants.map((tenant) => (
                    <li key={tenant.id}>{tenant.name}</li>
                ))}
            </ul>

            <h1>Clusters</h1>
            <ul>
                {clusters.map((cluster) => (
                    <li key={cluster.id}>{cluster.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default Page;