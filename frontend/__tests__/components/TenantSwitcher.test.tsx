import React from 'react';
import { render, screen } from '@testing-library/react';
import { TenantSwitcher } from '../../src/components/tenant/TenantSwitcher';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TenantSwitcher', () => {
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
    });

    it('renders tenant options correctly', async () => {
        // Mock successful API response
        mockedAxios.get.mockResolvedValueOnce({
            data: [
                { id: 'tenant-1', name: 'Organization A' },
                { id: 'tenant-2', name: 'Organization B' }
            ]
        });

        render(<TenantSwitcher />);

        // Initially loading state should be shown
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        // After loading completes, options should be rendered
        const selectElement = await screen.findByRole('combobox');
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

        // Error message should be displayed
        const errorMessage = await screen.findByText('Failed to fetch tenants');
        expect(errorMessage).toBeInTheDocument();
    });
});
