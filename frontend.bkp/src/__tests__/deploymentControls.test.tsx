import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DeploymentControls } from '@/components/deployments/DeploymentControls';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DeploymentControls', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders deployment control buttons', () => {
        render(<DeploymentControls deploymentId="d1" />);
        expect(screen.getByRole('button', { name: /blue-green/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /canary/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /rollback/i })).toBeInTheDocument();
    });

    it('triggers blue-green deployment', async () => {
        mockedAxios.post.mockResolvedValueOnce({ data: { status: 'ok' } });
        render(<DeploymentControls deploymentId="d1" />);
        fireEvent.click(screen.getByRole('button', { name: /blue-green/i }));
        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledWith('/api/deployments/d1/bluegreen');
        });
    });

    it('triggers canary deployment', async () => {
        mockedAxios.post.mockResolvedValueOnce({ data: { status: 'ok' } });
        render(<DeploymentControls deploymentId="d1" />);
        fireEvent.click(screen.getByRole('button', { name: /canary/i }));
        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledWith('/api/deployments/d1/canary');
        });
    });

    it('triggers rollback', async () => {
        mockedAxios.post.mockResolvedValueOnce({ data: { status: 'ok' } });
        render(<DeploymentControls deploymentId="d1" />);
        fireEvent.click(screen.getByRole('button', { name: /rollback/i }));
        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledWith('/api/deployments/d1/rollback');
        });
    });
});
