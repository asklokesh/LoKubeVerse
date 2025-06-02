import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SSOLogin } from '@/components/auth/SSOLogin';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock window.location
delete (window as any).location;
window.location = { href: '' } as any;

describe('SSOLogin', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        window.location.href = '';
    });

    it('renders SSO login button', () => {
        render(<SSOLogin />);
        expect(screen.getByRole('button', { name: /login with sso/i })).toBeInTheDocument();
    });

    it('handles successful SSO login redirect', async () => {
        const mockUrl = 'https://oauth.provider.com/auth?client_id=123';
        mockedAxios.get.mockResolvedValueOnce({ data: { url: mockUrl } });

        render(<SSOLogin />);
        const loginButton = screen.getByRole('button', { name: /login with sso/i });

        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledWith('/api/auth/sso');
            expect(window.location.href).toBe(mockUrl);
        });
    });

    it('handles SSO login error gracefully', async () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => { });
        mockedAxios.get.mockRejectedValueOnce(new Error('SSO service unavailable'));

        render(<SSOLogin />);
        const loginButton = screen.getByRole('button', { name: /login with sso/i });

        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledWith('/api/auth/sso');
            expect(consoleError).toHaveBeenCalledWith('SSO login failed:', expect.any(Error));
        });

        consoleError.mockRestore();
    });

    it('does not redirect on empty response', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: { url: null } });

        render(<SSOLogin />);
        const loginButton = screen.getByRole('button', { name: /login with sso/i });

        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledWith('/api/auth/sso');
            expect(window.location.href).toBe('');
        });
    });
});
