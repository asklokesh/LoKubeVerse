import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CreateClusterForm } from '@/components/clusters/CreateClusterForm';
import { useClusters } from '@/hooks/useClusters';

// Mock the useClusters hook
jest.mock('@/hooks/useClusters', () => ({
    useClusters: jest.fn(),
}));

const mockCreateCluster = jest.fn();

describe('CreateClusterForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useClusters as jest.Mock).mockReturnValue({
            createCluster: mockCreateCluster,
        });
    });

    it('renders form fields', () => {
        render(<CreateClusterForm />);

        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/provider/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/region/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create cluster/i })).toBeInTheDocument();
    });

    it('handles form input changes', () => {
        render(<CreateClusterForm />);

        const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
        const providerSelect = screen.getByLabelText(/provider/i) as HTMLSelectElement;
        const regionInput = screen.getByLabelText(/region/i) as HTMLInputElement;

        fireEvent.change(nameInput, { target: { value: 'test-cluster' } });
        fireEvent.change(providerSelect, { target: { value: 'aws' } });
        fireEvent.change(regionInput, { target: { value: 'us-west-2' } });

        expect(nameInput.value).toBe('test-cluster');
        expect(providerSelect.value).toBe('aws');
        expect(regionInput.value).toBe('us-west-2');
    });

    it('submits form with valid data', async () => {
        mockCreateCluster.mockResolvedValueOnce({
            id: '1',
            name: 'test-cluster',
            provider: 'aws',
            region: 'us-west-2',
            status: 'creating'
        });

        render(<CreateClusterForm />);

        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'test-cluster' } });
        fireEvent.change(screen.getByLabelText(/provider/i), { target: { value: 'aws' } });
        fireEvent.change(screen.getByLabelText(/region/i), { target: { value: 'us-west-2' } });

        fireEvent.click(screen.getByRole('button', { name: /create cluster/i }));

        await waitFor(() => {
            expect(mockCreateCluster).toHaveBeenCalledWith({
                name: 'test-cluster',
                provider: 'aws',
                region: 'us-west-2'
            });
        });
    });

    it('displays error message on submission failure', async () => {
        mockCreateCluster.mockRejectedValueOnce(new Error('Creation failed'));

        render(<CreateClusterForm />);

        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'test-cluster' } });
        fireEvent.change(screen.getByLabelText(/provider/i), { target: { value: 'aws' } });
        fireEvent.change(screen.getByLabelText(/region/i), { target: { value: 'us-west-2' } });

        fireEvent.click(screen.getByRole('button', { name: /create cluster/i }));

        await waitFor(() => {
            expect(screen.getByText(/failed to create cluster/i)).toBeInTheDocument();
        });
    });

    it('clears form fields after successful submission', async () => {
        mockCreateCluster.mockResolvedValueOnce({
            id: '1',
            name: 'test-cluster',
            provider: 'aws',
            region: 'us-west-2',
            status: 'creating'
        });

        render(<CreateClusterForm />);

        const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
        const providerSelect = screen.getByLabelText(/provider/i) as HTMLSelectElement;
        const regionInput = screen.getByLabelText(/region/i) as HTMLInputElement;

        fireEvent.change(nameInput, { target: { value: 'test-cluster' } });
        fireEvent.change(providerSelect, { target: { value: 'aws' } });
        fireEvent.change(regionInput, { target: { value: 'us-west-2' } });

        fireEvent.click(screen.getByRole('button', { name: /create cluster/i }));

        await waitFor(() => {
            expect(nameInput.value).toBe('');
            expect(providerSelect.value).toBe('');
            expect(regionInput.value).toBe('');
        });
    });

    it('prevents submission with empty required fields', () => {
        render(<CreateClusterForm />);

        const form = screen.getByRole('form') || screen.getByTestId('cluster-form');
        fireEvent.submit(form);

        expect(mockCreateCluster).not.toHaveBeenCalled();
    });

    it('handles provider selection with appropriate regions', () => {
        render(<CreateClusterForm />);

        const providerSelect = screen.getByLabelText(/provider/i);

        expect(providerSelect).toContainHTML('<option value="">Select Provider</option>');
        expect(providerSelect).toContainHTML('<option value="aws">AWS</option>');
        expect(providerSelect).toContainHTML('<option value="azure">Azure</option>');
        expect(providerSelect).toContainHTML('<option value="gcp">GCP</option>');
    });
});
