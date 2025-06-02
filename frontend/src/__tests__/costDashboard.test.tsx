import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CostDashboard } from '@/components/costs/CostDashboard';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CostDashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders costs', async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: [
                { id: '1', amount: 10, currency: 'USD', period: '2024-01', cluster_id: 'c1' },
                { id: '2', amount: 5, currency: 'USD', period: '2024-01', cluster_id: 'c1' },
            ]
        });
        render(<CostDashboard clusterId="c1" />);
        await waitFor(() => {
            expect(screen.getByText(/10/)).toBeInTheDocument();
            expect(screen.getByText(/5/)).toBeInTheDocument();
        });
    });
});
