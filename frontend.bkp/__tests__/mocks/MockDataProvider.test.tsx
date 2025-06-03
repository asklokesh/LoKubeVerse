import { render, screen, waitFor } from '@testing-library/react';
import { MockDataProvider } from '@/providers/MockDataProvider';
import { useClusters } from '@/hooks/useClusters';
import { useDeployments } from '@/hooks/useDeployments';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

// Mock axios to avoid actual API calls
import axios from 'axios';
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => {
    // Set up default mocks for the tests
    mockedAxios.get.mockImplementation((url: string) => {
        if (url === '/api/clusters') {
            return Promise.resolve({
                data: [{ id: 'cluster-1', name: 'test-cluster' }],
                status: 200,
            });
        } else if (url === '/api/deployments') {
            return Promise.resolve({
                data: [{ id: 'deployment-1', name: 'test-deployment' }],
                status: 200,
            });
        } else if (url === '/api/auth/session') {
            return Promise.resolve({
                data: { isAuthenticated: true, user: { id: 'user-1', name: 'Test User' } },
                status: 200,
            });
        }
        return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });
});

describe('MockDataProvider', () => {
    // Test component that consumes the mock data
    const TestComponent = () => {
        const { clusters, loading: clustersLoading } = useClusters();
        const { deployments, loading: deploymentsLoading } = useDeployments();
        const { user } = useAuth();
        const [ready, setReady] = useState(false);

        useEffect(() => {
            if (!clustersLoading && !deploymentsLoading) {
                setReady(true);
            }
        }, [clustersLoading, deploymentsLoading]);

        return (
            <div>
                {ready ? (
                    <>
                        <div data-testid="clusters-count">{clusters.length}</div>
                        <div data-testid="deployments-count">{deployments.length}</div>
                        <div data-testid="auth-status">{user ? 'Logged in' : 'Not logged in'}</div>
                    </>
                ) : (
                    <div>Loading...</div>
                )}
            </div>
        );
    };

    it('provides mock clusters data', async () => {
        render(
            <MockDataProvider>
                <TestComponent />
            </MockDataProvider>
        );

        expect(screen.getByText('Loading...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByTestId('clusters-count')).toBeInTheDocument();
        });

        const clustersCount = screen.getByTestId('clusters-count');
        expect(clustersCount.textContent).not.toBe('0');
    });

    it('provides mock deployments data', async () => {
        render(
            <MockDataProvider>
                <TestComponent />
            </MockDataProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('deployments-count')).toBeInTheDocument();
        });

        const deploymentsCount = screen.getByTestId('deployments-count');
        expect(deploymentsCount.textContent).not.toBe('0');
    });

    it('provides a mock authenticated user', async () => {
        render(
            <MockDataProvider initialAuthState={{ isAuthenticated: true }}>
                <TestComponent />
            </MockDataProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('auth-status')).toBeInTheDocument();
        });

        const authStatus = screen.getByTestId('auth-status');
        expect(authStatus.textContent).toBe('Logged in');
    });
});
