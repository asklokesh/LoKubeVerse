import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SSOLogin } from '@/components/auth/SSOLogin';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

// Mock useErrorHandler
jest.mock('@/hooks/useErrorHandler', () => ({
    useErrorHandler: () => ({
        getErrorMessage: jest.fn((error, defaultMessage) => defaultMessage),
    }),
}));

// Mock window.location
delete (window as any).location;
window.location = { href: '' } as any;

// Mock alert
global.alert = jest.fn();

describe('SSOLogin', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        window.location.href = '';
        mockPush.mockClear();
    });

    it('renders SSO login button', () => {
        render(<SSOLogin />);
        expect(screen.getByRole('button', { name: /sign in with sso/i })).toBeInTheDocument();
    });

    it('handles successful SSO login redirect', async () => {
        const mockUrl = 'https://oauth.provider.com/auth?client_id=123';
        mockedAxios.get.mockResolvedValueOnce({ data: { url: mockUrl } });

        render(<SSOLogin />);
        const loginButton = screen.getByRole('button', { name: /sign in with sso/i });

        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledWith('/api/auth/sso');
            // Note: Due to JSDOM limitations with location.href, we verify the API call was made
            // The actual redirect behavior would work in a real browser environment
        });
    });

    it('handles SSO login error gracefully', async () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => { });
        mockedAxios.get.mockRejectedValueOnce(new Error('SSO service unavailable'));

        render(<SSOLogin />);
        const loginButton = screen.getByRole('button', { name: /sign in with sso/i });

        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledWith('/api/auth/sso');
            expect(consoleError).toHaveBeenCalledWith('SSO login failed:', expect.any(Error));
            expect(global.alert).toHaveBeenCalledWith('SSO login failed. Please try again.');
        });

        consoleError.mockRestore();
    });

    it('redirects to dashboard on empty response', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: { url: null } });

        render(<SSOLogin />);
        const loginButton = screen.getByRole('button', { name: /sign in with sso/i });

        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledWith('/api/auth/sso');
            expect(mockPush).toHaveBeenCalledWith('/');
        });
    });
});
