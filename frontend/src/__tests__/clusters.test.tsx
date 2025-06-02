import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ClusterList } from '@/components/clusters/ClusterList';
import { CreateClusterForm } from '@/components/clusters/CreateClusterForm';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Cluster Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders cluster list', async () => {
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

    render(<ClusterList />);
    await waitFor(() => {
      expect(screen.getByText('Test Cluster')).toBeInTheDocument();
    });
  });

  it('renders create cluster form', () => {
    render(<CreateClusterForm />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/provider/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/region/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
  });

  it('handles cluster creation', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        id: '1',
        name: 'New Cluster',
        provider: 'aws',
        region: 'us-west-2',
        status: 'creating',
      },
    });

    render(<CreateClusterForm />);
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'New Cluster' },
    });
    fireEvent.change(screen.getByLabelText(/provider/i), {
      target: { value: 'aws' },
    });
    fireEvent.change(screen.getByLabelText(/region/i), {
      target: { value: 'us-west-2' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/clusters', {
        name: 'New Cluster',
        provider: 'aws',
        region: 'us-west-2',
      });
    });
  });
}); 