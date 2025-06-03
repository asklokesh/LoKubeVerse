import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NetworkPolicyDashboard } from '@/components/network/NetworkPolicyDashboard';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('NetworkPolicyDashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders network policies', async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: [
                { id: '1', spec: { policy: 'allow-all' }, namespace_id: 'n1', cluster_id: 'c1' },
                { id: '2', spec: { policy: 'deny-all' }, namespace_id: 'n1', cluster_id: 'c1' },
            ]
        });
        render(<NetworkPolicyDashboard clusterId="c1" namespaceId="n1" />);
        await waitFor(() => {
            expect(screen.getByText(/allow-all/)).toBeInTheDocument();
            expect(screen.getByText(/deny-all/)).toBeInTheDocument();
        });
    });
});
