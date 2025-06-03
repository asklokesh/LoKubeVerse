import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { TenantSwitcher } from '../../src/components/tenant/TenantSwitcher';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock useErrorHandler hook - use a stable function reference
const mockGetErrorMessage = jest.fn((error: any, defaultMessage: string) => {
    if (error?.message) return error.message;
    return defaultMessage;
});

jest.mock('@/hooks/useErrorHandler', () => ({
    useErrorHandler: () => ({
        getErrorMessage: mockGetErrorMessage
    })
}));

describe('TenantSwitcher', () => {
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        mockGetErrorMessage.mockClear();
    });

    it('renders tenant options correctly', async () => {
        // Mock successful API response - component should use this data  
        mockedAxios.get.mockResolvedValueOnce({
            data: [
                { id: 'tenant-1', name: 'Organization A' },
                { id: 'tenant-2', name: 'Organization B' }
            ]
        });

        render(<TenantSwitcher />);

        // Initially loading state should be shown
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        // Wait for loading to complete and select element to appear
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        }, { timeout: 3000 });

        // After loading completes, select element should be rendered
        const selectElement = screen.getByRole('combobox');
        expect(selectElement).toBeInTheDocument();

        // Check option text
        const options = screen.getAllByRole('option');
        expect(options).toHaveLength(2);
        expect(options[0]).toHaveTextContent('Organization A');
        expect(options[1]).toHaveTextContent('Organization B');
    });

    it('shows error message when API fails', async () => {
        // Mock API failure
        mockedAxios.get.mockRejectedValueOnce(new Error('Failed to fetch tenants'));

        render(<TenantSwitcher />);

        // Initially loading state should be shown
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        // Wait for error message to be displayed
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        }, { timeout: 3000 });

        const errorMessage = screen.getByText('Failed to fetch tenants');
        expect(errorMessage).toBeInTheDocument();
    });
});
