import { renderHook, waitFor } from '@testing-library/react';
import { useClusters } from '@/hooks/useClusters';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('useClusters', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('initializes with empty clusters and loading state', () => {
        mockedAxios.get.mockImplementation(() => new Promise(() => { })); // Never resolves

        const { result } = renderHook(() => useClusters());

        expect(result.current.clusters).toEqual([]);
        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBeNull();
    });

    it('fetches clusters successfully', async () => {
        const mockClusters = [
            { id: '1', name: 'cluster-1', provider: 'aws', region: 'us-west-2', status: 'active' },
            { id: '2', name: 'cluster-2', provider: 'gcp', region: 'us-central1', status: 'pending' },
        ];
        mockedAxios.get.mockResolvedValueOnce({ data: mockClusters });

        const { result } = renderHook(() => useClusters());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
            expect(result.current.clusters).toEqual(mockClusters);
            expect(result.current.error).toBeNull();
        });

        expect(mockedAxios.get).toHaveBeenCalledWith('/api/clusters');
    });

    it('handles fetch error', async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

        const { result } = renderHook(() => useClusters());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
            expect(result.current.clusters).toEqual([]);
            expect(result.current.error).toBe('Failed to fetch clusters');
        });
    });

    it('creates cluster successfully', async () => {
        const existingClusters = [
            { id: '1', name: 'cluster-1', provider: 'aws', region: 'us-west-2', status: 'active' },
        ];
        const newCluster = { id: '2', name: 'cluster-2', provider: 'gcp', region: 'us-central1', status: 'creating' };

        mockedAxios.get.mockResolvedValueOnce({ data: existingClusters });
        mockedAxios.post.mockResolvedValueOnce({ data: newCluster });

        const { result } = renderHook(() => useClusters());

        await waitFor(() => {
            expect(result.current.clusters).toEqual(existingClusters);
        });

        const response = await result.current.createCluster({
            name: 'cluster-2',
            provider: 'gcp',
            region: 'us-central1',
        });

        expect(response).toEqual(newCluster);
        expect(result.current.clusters).toEqual([...existingClusters, newCluster]);
        expect(mockedAxios.post).toHaveBeenCalledWith('/api/clusters', {
            name: 'cluster-2',
            provider: 'gcp',
            region: 'us-central1',
        });
    });

    it('handles create cluster error', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: [] });
        mockedAxios.post.mockRejectedValueOnce(new Error('Creation failed'));

        const { result } = renderHook(() => useClusters());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        let thrownError;
        try {
            await result.current.createCluster({
                name: 'cluster-1',
                provider: 'aws',
                region: 'us-west-2',
            });
        } catch (error) {
            thrownError = error;
        }

        expect(thrownError).toBeInstanceOf(Error);
        expect(result.current.error).toBe('Failed to create cluster');
        expect(result.current.clusters).toEqual([]); // Should not add failed cluster
    });

    it('deletes cluster successfully', async () => {
        const clusters = [
            { id: '1', name: 'cluster-1', provider: 'aws', region: 'us-west-2', status: 'active' },
            { id: '2', name: 'cluster-2', provider: 'gcp', region: 'us-central1', status: 'active' },
        ];

        mockedAxios.get.mockResolvedValueOnce({ data: clusters });
        mockedAxios.delete.mockResolvedValueOnce({ data: { message: 'Cluster deleted' } });

        const { result } = renderHook(() => useClusters());

        await waitFor(() => {
            expect(result.current.clusters).toEqual(clusters);
        });

        await result.current.deleteCluster('1');

        expect(result.current.clusters).toEqual([clusters[1]]); // Only cluster-2 remaining
        expect(mockedAxios.delete).toHaveBeenCalledWith('/api/clusters/1');
    });

    it('handles delete cluster error', async () => {
        const clusters = [
            { id: '1', name: 'cluster-1', provider: 'aws', region: 'us-west-2', status: 'active' },
        ];

        mockedAxios.get.mockResolvedValueOnce({ data: clusters });
        mockedAxios.delete.mockRejectedValueOnce(new Error('Deletion failed'));

        const { result } = renderHook(() => useClusters());

        await waitFor(() => {
            expect(result.current.clusters).toEqual(clusters);
        });

        let thrownError;
        try {
            await result.current.deleteCluster('1');
        } catch (error) {
            thrownError = error;
        }

        expect(thrownError).toBeInstanceOf(Error);
        expect(result.current.error).toBe('Failed to delete cluster');
        expect(result.current.clusters).toEqual(clusters); // Should not remove cluster on error
    });

    it('resets error state on successful operations', async () => {
        // First cause an error
        mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

        const { result } = renderHook(() => useClusters());

        await waitFor(() => {
            expect(result.current.error).toBe('Failed to fetch clusters');
        });

        // Then succeed with create
        const newCluster = { id: '1', name: 'cluster-1', provider: 'aws', region: 'us-west-2', status: 'creating' };
        mockedAxios.post.mockResolvedValueOnce({ data: newCluster });

        await result.current.createCluster({
            name: 'cluster-1',
            provider: 'aws',
            region: 'us-west-2',
        });

        expect(result.current.error).toBeNull();
    });
});
