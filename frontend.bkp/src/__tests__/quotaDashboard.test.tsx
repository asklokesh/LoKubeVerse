import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QuotaDashboard } from '@/components/quotas/QuotaDashboard';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('QuotaDashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders quotas', async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: [
                { id: '1', spec: { cpu: '2', memory: '4Gi' }, namespace_id: 'n1', cluster_id: 'c1' },
                { id: '2', spec: { cpu: '1', memory: '2Gi' }, namespace_id: 'n1', cluster_id: 'c1' },
            ]
        });
        render(<QuotaDashboard clusterId="c1" namespaceId="n1" />);
        await waitFor(() => {
            expect(screen.getByText(/4Gi/)).toBeInTheDocument();
            expect(screen.getByText(/2Gi/)).toBeInTheDocument();
        });
    });
});
