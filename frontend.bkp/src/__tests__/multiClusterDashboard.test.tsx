import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MultiClusterDashboard } from '@/components/clusters/MultiClusterDashboard';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('MultiClusterDashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders clusters', async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: [
                { id: '1', name: 'cluster-a', provider: 'aws' },
                { id: '2', name: 'cluster-b', provider: 'gcp' },
            ]
        });
        render(<MultiClusterDashboard />);
        await waitFor(() => {
            expect(screen.getByText(/cluster-a/)).toBeInTheDocument();
            expect(screen.getByText(/cluster-b/)).toBeInTheDocument();
        });
    });
});
