import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TenantSwitcher } from '@/components/tenant/TenantSwitcher';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock useErrorHandler to return predictable error messages
const mockGetErrorMessage = jest.fn((error: any, defaultMessage: string) => {
    // Always return the default message for testing consistency
    return defaultMessage;
});

jest.mock('@/hooks/useErrorHandler', () => ({
    useErrorHandler: () => ({
        getErrorMessage: mockGetErrorMessage
    })
}));

describe('TenantSwitcher', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state initially', () => {
        mockedAxios.get.mockImplementation(() => new Promise(() => { })); // Never resolves

        render(<TenantSwitcher />);
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('renders tenant selector with options', async () => {
        const mockTenants = [
            { id: '1', name: 'Acme Corp' },
            { id: '2', name: 'Beta LLC' },
        ];
        mockedAxios.get.mockResolvedValueOnce({ data: mockTenants });

        render(<TenantSwitcher />);

        await waitFor(() => {
            expect(screen.getByRole('combobox')).toBeInTheDocument();
            expect(screen.getByText('Acme Corp')).toBeInTheDocument();
            expect(screen.getByText('Beta LLC')).toBeInTheDocument();
        });
    });

    it('handles tenant selection change', async () => {
        const mockTenants = [
            { id: '1', name: 'Acme Corp' },
            { id: '2', name: 'Beta LLC' },
        ];
        mockedAxios.get.mockResolvedValueOnce({ data: mockTenants });

        render(<TenantSwitcher />);

        await waitFor(() => {
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: '2' } });

        expect(select).toHaveValue('2');
    });

    it('handles empty tenant list', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: [] });

        render(<TenantSwitcher />);

        await waitFor(() => {
            const select = screen.getByRole('combobox');
            expect(select).toBeInTheDocument();
            // When API returns empty data, component falls back to hardcoded mock data
            expect(select).toHaveValue('tenant-1');
            expect(screen.getByText('Organization A')).toBeInTheDocument();
        });
    });

    it('displays error message on fetch failure', async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

        render(<TenantSwitcher />);

        await waitFor(() => {
            expect(screen.getByText(/failed to fetch tenants/i)).toBeInTheDocument();
        });
    });

    it('renders with proper accessibility attributes', async () => {
        const mockTenants = [{ id: '1', name: 'Acme Corp' }];
        mockedAxios.get.mockResolvedValueOnce({ data: mockTenants });

        render(<TenantSwitcher />);

        await waitFor(() => {
            const select = screen.getByRole('combobox');
            expect(select).toBeInTheDocument();
            expect(select).toHaveAttribute('id', 'tenant-select');
        });
    });
});
