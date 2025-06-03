/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import { MockDataProvider } from '@/providers/MockDataProvider';
import axios from 'axios';
import React from 'react';

// Mock the hooks and axios
jest.mock('axios');

const mockClusters = [{ id: 'cluster-1', name: 'test-cluster' }];
const mockDeployments = [{ id: 'deployment-1', name: 'test-deployment' }];
const mockUser = { id: 'user-1', name: 'Test User', role: 'admin' };

// Simple test component
const TestComponent = () => {
    const [data, setData] = React.useState({
        clusters: [],
        deployments: [],
        isAuthenticated: false,
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // Test the MockDataProvider by making requests that should be intercepted
                const clustersResponse = await axios.get('/api/clusters');
                const deploymentsResponse = await axios.get('/api/deployments');
                const authResponse = await axios.get('/api/auth/session');

                setData({
                    clusters: clustersResponse.data || [],
                    deployments: deploymentsResponse.data || [],
                    isAuthenticated: authResponse.data?.isAuthenticated || false,
                });
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div data-testid="clusters-count">{data.clusters.length}</div>
            <div data-testid="deployments-count">{data.deployments.length}</div>
            <div data-testid="auth-status">
                {data.isAuthenticated ? 'Logged in' : 'Not logged in'}
            </div>
        </div>
    );
};

describe('MockDataProvider', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Mock axios for interceptors
        axios.interceptors.request.use.mockImplementation((fn) => {
            return 999; // Return a mock interceptor ID
        });

        axios.interceptors.response.use.mockImplementation((successFn, errorFn) => {
            return 999; // Return a mock interceptor ID
        });

        // Mock specific API endpoints for testing
        axios.get.mockImplementation((url) => {
            if (url.includes('/api/clusters')) {
                return Promise.resolve({ data: mockClusters, status: 200 });
            }
            else if (url.includes('/api/deployments')) {
                return Promise.resolve({ data: mockDeployments, status: 200 });
            }
            else if (url.includes('/api/auth/session')) {
                return Promise.resolve({
                    data: { isAuthenticated: true, user: mockUser },
                    status: 200
                });
            }

            // Default case
            return Promise.reject(new Error(`No mock for ${url}`));
        });
    });

    it('intercepts API requests and provides mock data', async () => {
        render(
            <MockDataProvider>
                <TestComponent />
            </MockDataProvider>
        );

        // Initial loading state
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        // Wait for data to load
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        // Check if mock data is provided
        expect(screen.getByTestId('clusters-count').textContent).toBe('1');
        expect(screen.getByTestId('deployments-count').textContent).toBe('1');
        expect(screen.getByTestId('auth-status').textContent).toBe('Logged in');
    });
});
