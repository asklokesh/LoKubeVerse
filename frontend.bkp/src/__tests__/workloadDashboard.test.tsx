import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WorkloadDashboard } from '@/components/workloads/WorkloadDashboard';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WorkloadDashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders workloads', async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: [
                { id: '1', name: 'nginx', status: 'Running', namespace_id: 'n1', cluster_id: 'c1' },
                { id: '2', name: 'api', status: 'Pending', namespace_id: 'n1', cluster_id: 'c1' },
            ]
        });
        render(<WorkloadDashboard clusterId="c1" namespaceId="n1" />);
        await waitFor(() => {
            expect(screen.getByText(/nginx/)).toBeInTheDocument();
            expect(screen.getByText(/api/)).toBeInTheDocument();
        });
    });
});
