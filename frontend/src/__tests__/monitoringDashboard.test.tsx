import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MonitoringDashboard } from '@/components/monitoring/MonitoringDashboard';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('MonitoringDashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders monitoring metrics', async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: [
                { id: '1', metric: 'cpu', value: 0.5, cluster_id: 'c1' },
                { id: '2', metric: 'memory', value: 0.7, cluster_id: 'c1' },
            ]
        });
        render(<MonitoringDashboard clusterId="c1" />);
        await waitFor(() => {
            expect(screen.getByText(/cpu/)).toBeInTheDocument();
            expect(screen.getByText(/memory/)).toBeInTheDocument();
        });
    });
});
