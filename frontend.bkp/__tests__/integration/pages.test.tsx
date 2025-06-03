import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MockDataProvider } from '../../src/providers/MockDataProvider';
import ClusterPageWrapper from '../../app/clusters/page';

// Mock the ErrorBoundary component
jest.mock('../../src/components/common/ErrorBoundary', () => ({
    ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>
}));

// Mock the Sidebar component since it's not relevant for this test
jest.mock('../../src/components/layout/Sidebar', () => ({
    __esModule: true,
    default: () => <div data-testid="sidebar">Sidebar</div>,
}));

// Mock other components that might be complex to render
jest.mock('../../src/components/multicluster/MultiClusterView', () => ({
    MultiClusterView: () => <div data-testid="multi-cluster-view">Multi Cluster View</div>
}));

jest.mock('../../src/components/cost/CostDashboard', () => ({
    CostDashboard: () => <div data-testid="cost-dashboard">Cost Dashboard</div>
}));

jest.mock('../../src/components/monitoring/AdvancedMonitoring', () => ({
    AdvancedMonitoring: () => <div data-testid="advanced-monitoring">Advanced Monitoring</div>
}));

// Mock the useClusters hook
jest.mock('../../src/hooks/useClusters', () => ({
    useClusters: () => ({
        clusters: [
            {
                id: 'cluster-1',
                name: 'production-eks',
                provider: 'AWS',
                region: 'us-west-2',
                status: 'Running',
            },
            {
                id: 'cluster-2',
                name: 'staging-aks',
                provider: 'Azure',
                region: 'eastus',
                status: 'Running',
            },
        ],
        loading: false,
        error: null,
    }),
}));

describe('Integration Tests', () => {
    test('Clusters page renders with mock data and no errors', async () => {
        render(
            <MockDataProvider>
                <ClusterPageWrapper />
            </MockDataProvider>
        );

        // Verify the page renders
        expect(screen.getByTestId('error-boundary')).toBeInTheDocument();

        // Wait for the clusters to load
        await waitFor(() => {
            expect(screen.getByText('production-eks')).toBeInTheDocument();
            expect(screen.getByText('staging-aks')).toBeInTheDocument();
            expect(screen.getByText('AWS')).toBeInTheDocument();
            expect(screen.getByText('Azure')).toBeInTheDocument();
        });
    });
});
