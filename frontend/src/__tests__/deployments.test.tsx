import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DeploymentList } from '@/components/deployments/DeploymentList';
import { CreateDeploymentForm } from '@/components/deployments/CreateDeploymentForm';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Deployment Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders deployment list', async () => {
    const mockDeployments = [
      {
        id: '1',
        name: 'Test Deployment',
        cluster: 'cluster-1',
        namespace: 'default',
        image: 'nginx:latest',
        status: 'running',
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: mockDeployments });

    render(<DeploymentList />);
    await waitFor(() => {
      expect(screen.getByText('Test Deployment')).toBeInTheDocument();
    });
  });

  it('renders create deployment form', () => {
    const mockClusters = [
      {
        id: '1',
        name: 'Test Cluster',
        provider: 'aws',
        region: 'us-west-2',
        status: 'active',
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: mockClusters });

    render(<CreateDeploymentForm />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cluster/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/namespace/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/image/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
  });

  it('handles deployment creation', async () => {
    const mockClusters = [
      {
        id: '1',
        name: 'Test Cluster',
        provider: 'aws',
        region: 'us-west-2',
        status: 'active',
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: mockClusters });
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        id: '1',
        name: 'New Deployment',
        cluster: 'cluster-1',
        namespace: 'default',
        image: 'nginx:latest',
        status: 'creating',
      },
    });

    render(<CreateDeploymentForm />);
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'New Deployment' },
    });
    fireEvent.change(screen.getByLabelText(/cluster/i), {
      target: { value: 'cluster-1' },
    });
    fireEvent.change(screen.getByLabelText(/namespace/i), {
      target: { value: 'default' },
    });
    fireEvent.change(screen.getByLabelText(/image/i), {
      target: { value: 'nginx:latest' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/deployments', {
        name: 'New Deployment',
        cluster: 'cluster-1',
        namespace: 'default',
        image: 'nginx:latest',
      });
    });
  });
}); 