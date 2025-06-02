import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import Home from '@/app/page';
import { useClusters } from '@/hooks/useClusters';
import { useDeployments } from '@/hooks/useDeployments';

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Mock hooks
jest.mock('@/hooks/useClusters', () => ({
    useClusters: jest.fn(),
}));

jest.mock('@/hooks/useDeployments', () => ({
    useDeployments: jest.fn(),
}));

// Mock Sidebar component
jest.mock('@/components/layout/Sidebar', () => {
    return function MockSidebar() {
        return <div data-testid="sidebar">Sidebar</div>;
    };
});

describe('Home Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    });

    it('renders loading state when data is loading', () => {
        (useClusters as jest.Mock).mockReturnValue({
            clusters: [],
            loading: true,
        });
        (useDeployments as jest.Mock).mockReturnValue({
            deployments: [],
            loading: true,
        });

        render(<Home />);

        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
        // Should show loading skeleton
        expect(screen.getByRole('main')).toContainHTML('animate-pulse');
    });

    it('renders dashboard with cluster and deployment stats', async () => {
        const mockClusters = [
            { id: '1', name: 'cluster-1', provider: 'aws', region: 'us-west-2', status: 'active', nodes: 3 },
            { id: '2', name: 'cluster-2', provider: 'gcp', region: 'us-central1', status: 'active', nodes: 5 },
        ];
        const mockDeployments = [
            { id: '1', name: 'app-1', cluster: 'cluster-1', namespace: 'default', status: 'running' },
            { id: '2', name: 'app-2', cluster: 'cluster-2', namespace: 'production', status: 'running' },
        ];

        (useClusters as jest.Mock).mockReturnValue({
            clusters: mockClusters,
            loading: false,
        });
        (useDeployments as jest.Mock).mockReturnValue({
            deployments: mockDeployments,
            loading: false,
        });

        render(<Home />);

        await waitFor(() => {
            expect(screen.getByText('2')).toBeInTheDocument(); // Total clusters
            expect(screen.getByText('2')).toBeInTheDocument(); // Active deployments
        });

        expect(screen.getByText(/total clusters/i)).toBeInTheDocument();
        expect(screen.getByText(/active deployments/i)).toBeInTheDocument();
        expect(screen.getByText(/resource usage/i)).toBeInTheDocument();
    });

    it('calculates resource usage correctly', async () => {
        const mockClusters = [
            { id: '1', name: 'cluster-1', provider: 'aws', region: 'us-west-2', status: 'active', nodes: 2 },
        ];
        const mockDeployments = [
            { id: '1', name: 'app-1', cluster: 'cluster-1', namespace: 'default', status: 'running' },
            { id: '2', name: 'app-2', cluster: 'cluster-1', namespace: 'default', status: 'running' },
        ];

        (useClusters as jest.Mock).mockReturnValue({
            clusters: mockClusters,
            loading: false,
        });
        (useDeployments as jest.Mock).mockReturnValue({
            deployments: mockDeployments,
            loading: false,
        });

        render(<Home />);

        await waitFor(() => {
            // Resource usage should be calculated as (deployments / (nodes * 5)) * 100
            // (2 / (2 * 5)) * 100 = 20%
            expect(screen.getByText('20%')).toBeInTheDocument();
        });
    });

    it('renders sidebar navigation', () => {
        (useClusters as jest.Mock).mockReturnValue({
            clusters: [],
            loading: false,
        });
        (useDeployments as jest.Mock).mockReturnValue({
            deployments: [],
            loading: false,
        });

        render(<Home />);

        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('displays proper page title', () => {
        (useClusters as jest.Mock).mockReturnValue({
            clusters: [],
            loading: false,
        });
        (useDeployments as jest.Mock).mockReturnValue({
            deployments: [],
            loading: false,
        });

        render(<Home />);

        expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    });

    it('handles empty data state gracefully', () => {
        (useClusters as jest.Mock).mockReturnValue({
            clusters: [],
            loading: false,
        });
        (useDeployments as jest.Mock).mockReturnValue({
            deployments: [],
            loading: false,
        });

        render(<Home />);

        expect(screen.getByText('0')).toBeInTheDocument(); // Zero clusters
        expect(screen.getByText('0%')).toBeInTheDocument(); // Zero resource usage
    });

    it('caps resource usage at 100%', async () => {
        const mockClusters = [
            { id: '1', name: 'cluster-1', provider: 'aws', region: 'us-west-2', status: 'active', nodes: 1 },
        ];
        const mockDeployments = Array.from({ length: 10 }, (_, i) => ({
            id: `${i + 1}`,
            name: `app-${i + 1}`,
            cluster: 'cluster-1',
            namespace: 'default',
            status: 'running',
        }));

        (useClusters as jest.Mock).mockReturnValue({
            clusters: mockClusters,
            loading: false,
        });
        (useDeployments as jest.Mock).mockReturnValue({
            deployments: mockDeployments,
            loading: false,
        });

        render(<Home />);

        await waitFor(() => {
            // Should cap at 100% even with high deployment count
            expect(screen.getByText('100%')).toBeInTheDocument();
        });
    });
});
