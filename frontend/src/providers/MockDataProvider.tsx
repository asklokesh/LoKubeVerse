import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import axios from 'axios';

// Mock data interfaces
interface ClusterData {
    id: string;
    name: string;
    provider: string;
    region: string;
    status: string;
    version: string;
    nodes: number;
    created: string;
}

interface DeploymentData {
    id: string;
    name: string;
    cluster: string;
    namespace: string;
    image: string;
    status: string;
    replicas: number;
    created: string;
}

interface NamespaceData {
    id: string;
    name: string;
    cluster: string;
    status: string;
}

interface UserData {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface TenantData {
    id: string;
    name: string;
    type: string;
    created: string;
}

interface MockDataContextProps {
    isInitialized: boolean;
}

// Mock data context
const MockDataContext = createContext<MockDataContextProps>({
    isInitialized: false,
});

// Sample mock data
const mockClusters: ClusterData[] = [
    {
        id: 'cluster-1',
        name: 'production-eks',
        provider: 'AWS',
        region: 'us-west-2',
        status: 'Running',
        version: '1.27',
        nodes: 5,
        created: '2023-01-15T10:30:00Z',
    },
    {
        id: 'cluster-2',
        name: 'staging-aks',
        provider: 'Azure',
        region: 'eastus',
        status: 'Running',
        version: '1.26',
        nodes: 3,
        created: '2023-02-20T14:45:00Z',
    },
    {
        id: 'cluster-3',
        name: 'dev-gke',
        provider: 'GCP',
        region: 'us-central1',
        status: 'Running',
        version: '1.28',
        nodes: 2,
        created: '2023-03-10T09:15:00Z',
    },
];

const mockDeployments: DeploymentData[] = [
    {
        id: 'deployment-1',
        name: 'frontend',
        cluster: 'cluster-1',
        namespace: 'default',
        image: 'frontend:latest',
        status: 'Running',
        replicas: 3,
        created: '2023-01-20T08:30:00Z',
    },
    {
        id: 'deployment-2',
        name: 'backend-api',
        cluster: 'cluster-1',
        namespace: 'api',
        image: 'backend:v2',
        status: 'Running',
        replicas: 2,
        created: '2023-01-25T11:45:00Z',
    },
    {
        id: 'deployment-3',
        name: 'database',
        cluster: 'cluster-2',
        namespace: 'db',
        image: 'postgres:15',
        status: 'Running',
        replicas: 1,
        created: '2023-02-22T13:20:00Z',
    },
    {
        id: 'deployment-4',
        name: 'cache',
        cluster: 'cluster-2',
        namespace: 'cache',
        image: 'redis:7',
        status: 'Running',
        replicas: 2,
        created: '2023-02-25T10:10:00Z',
    },
];

const mockNamespaces: NamespaceData[] = [
    { id: 'ns-1', name: 'default', cluster: 'cluster-1', status: 'Active' },
    { id: 'ns-2', name: 'api', cluster: 'cluster-1', status: 'Active' },
    { id: 'ns-3', name: 'db', cluster: 'cluster-2', status: 'Active' },
    { id: 'ns-4', name: 'cache', cluster: 'cluster-2', status: 'Active' },
    { id: 'ns-5', name: 'monitoring', cluster: 'cluster-3', status: 'Active' },
];

const mockUsers: UserData[] = [
    {
        id: 'user-1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
    },
    {
        id: 'user-2',
        email: 'dev@example.com',
        name: 'Developer User',
        role: 'developer',
    },
    {
        id: 'user-3',
        email: 'viewer@example.com',
        name: 'Viewer User',
        role: 'viewer',
    }
];

const mockUser: UserData = mockUsers[0];

const mockTenants: TenantData[] = [
    {
        id: 'tenant-1',
        name: 'Organization A',
        type: 'enterprise',
        created: '2023-01-01T00:00:00Z',
    },
    {
        id: 'tenant-2',
        name: 'Organization B',
        type: 'standard',
        created: '2023-02-15T00:00:00Z',
    },
    {
        id: 'tenant-3',
        name: 'Personal Account',
        type: 'personal',
        created: '2023-03-20T00:00:00Z',
    }
];

interface MockDataProviderProps {
    children: ReactNode;
    initialAuthState?: {
        isAuthenticated: boolean;
    };
}

/*
 * MockDataProvider
 * 
 * This provider intercepts API requests and returns mock data
 * to allow the UI to function without a working backend.
 * 
 * Recent updates:
 * - Added mock tenants data
 * - Added mock users data endpoints
 * - Enhanced the mock data to better represent real-world scenarios
 */
export const MockDataProvider: React.FC<MockDataProviderProps> = ({
    children,
    initialAuthState = { isAuthenticated: false },
}) => {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // Setup axios mock interceptors
        const mockInterceptor = axios.interceptors.request.use((config) => {
            // Let non-api requests pass through
            if (!config.url?.startsWith('/api/')) {
                return config;
            }

            // Simulate network delay
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(config);
                }, 500);
            });
        });

        // Setup response interceptors for mock data
        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const { config } = error;

                if (!config || !config.url?.startsWith('/api/')) {
                    return Promise.reject(error);
                }

                // Handle specific API endpoints
                if (config.url.includes('/api/clusters')) {
                    if (config.method === 'get') {
                        return Promise.resolve({
                            data: mockClusters,
                            status: 200,
                            statusText: 'OK',
                            headers: {},
                            config,
                        });
                    }
                }

                if (config.url.includes('/api/deployments')) {
                    if (config.method === 'get') {
                        return Promise.resolve({
                            data: mockDeployments,
                            status: 200,
                            statusText: 'OK',
                            headers: {},
                            config,
                        });
                    }
                }

                if (config.url.includes('/api/namespaces')) {
                    if (config.method === 'get') {
                        return Promise.resolve({
                            data: mockNamespaces,
                            status: 200,
                            statusText: 'OK',
                            headers: {},
                            config,
                        });
                    }
                }

                if (config.url.includes('/api/users')) {
                    if (config.method === 'get') {
                        return Promise.resolve({
                            data: mockUsers,
                            status: 200,
                            statusText: 'OK',
                            headers: {},
                            config,
                        });
                    }
                }

                if (config.url.includes('/api/tenants')) {
                    if (config.method === 'get') {
                        return Promise.resolve({
                            data: mockTenants,
                            status: 200,
                            statusText: 'OK',
                            headers: {},
                            config,
                        });
                    }
                }

                if (config.url.includes('/api/auth')) {
                    if (config.url.includes('/login') || config.url.includes('/sso')) {
                        return Promise.resolve({
                            data: {
                                access_token: 'mock_token_12345',
                                user: mockUser,
                                url: 'http://localhost:3000/',
                            },
                            status: 200,
                            statusText: 'OK',
                            headers: {},
                            config,
                        });
                    }

                    if (config.url.includes('/session') && initialAuthState.isAuthenticated) {
                        return Promise.resolve({
                            data: { isAuthenticated: true, user: mockUser },
                            status: 200,
                            statusText: 'OK',
                            headers: {},
                            config,
                        });
                    }
                }

                // Default fallback for unhandled endpoints
                console.warn(`Unhandled mock API endpoint: ${config.url}`);
                return Promise.reject(error);
            }
        );

        setIsInitialized(true);

        // Cleanup interceptors on unmount
        return () => {
            axios.interceptors.request.eject(mockInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [initialAuthState.isAuthenticated]);

    return (
        <MockDataContext.Provider value={{ isInitialized }}>
            {children}
        </MockDataContext.Provider>
    );
};

// Hook to check if mock data provider is initialized
export const useMockData = () => useContext(MockDataContext);
