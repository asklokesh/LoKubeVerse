import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NamespaceDashboard } from '@/components/namespaces/NamespaceDashboard';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('NamespaceDashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders namespaces', async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: [
                { id: '1', name: 'default', cluster_id: 'c1', created_at: '2024-01-01T00:00:00Z' },
                { id: '2', name: 'dev', cluster_id: 'c1', created_at: '2024-01-02T00:00:00Z' },
            ]
        });
        render(<NamespaceDashboard clusterId="c1" />);
        await waitFor(() => {
            expect(screen.getByText(/default/)).toBeInTheDocument();
            expect(screen.getByText(/dev/)).toBeInTheDocument();
        });
    });
});
