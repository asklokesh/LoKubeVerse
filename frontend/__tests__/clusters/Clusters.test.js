import { render, screen } from '@testing-library/react';
import Clusters from '../../public/js/components/Clusters';

describe('Clusters Component', () => {
    test('renders without crashing', () => {
        render(<Clusters />);
        expect(screen.getByText(/Clusters/i)).toBeInTheDocument();
    });

    test('displays loading state initially', () => {
        render(<Clusters />);
        expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    });

    test('renders clusters when data is available', async () => {
        const mockClusters = [
            { id: 1, name: 'Cluster 1' },
            { id: 2, name: 'Cluster 2' },
        ];

        jest.spyOn(global, 'fetch').mockResolvedValue({
            json: jest.fn().mockResolvedValue(mockClusters),
        });

        render(<Clusters />);

        const clusterElements = await screen.findAllByText(/Cluster/i);
        expect(clusterElements).toHaveLength(mockClusters.length);

        global.fetch.mockRestore();
    });

    test('displays error message on fetch failure', async () => {
        jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Failed to fetch clusters'));

        render(<Clusters />);

        const errorElement = await screen.findByText(/Error fetching clusters/i);
        expect(errorElement).toBeInTheDocument();

        global.fetch.mockRestore();
    });
});
