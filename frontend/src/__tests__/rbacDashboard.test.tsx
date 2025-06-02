import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RBACDashboard } from '@/components/rbac/RBACDashboard';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('RBACDashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders RBAC rules', async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: [
                { id: '1', rules: { role: 'admin' }, cluster_id: 'c1' },
                { id: '2', rules: { role: 'viewer' }, cluster_id: 'c1' },
            ]
        });
        render(<RBACDashboard clusterId="c1" />);
        await waitFor(() => {
            expect(screen.getByText(/admin/)).toBeInTheDocument();
            expect(screen.getByText(/viewer/)).toBeInTheDocument();
        });
    });
});
