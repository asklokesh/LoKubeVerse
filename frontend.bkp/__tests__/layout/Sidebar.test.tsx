import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/hooks/useAuth';

// Mock Next.js router
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
    useRouter: jest.fn(),
}));

// Mock useAuth hook
jest.mock('@/hooks/useAuth', () => ({
    useAuth: jest.fn(),
}));

const mockPush = jest.fn();
const mockLogout = jest.fn();

describe('Sidebar', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        (useAuth as jest.Mock).mockReturnValue({ logout: mockLogout });
    });

    it('renders navigation items', () => {
        const mockUsePathname = require('next/navigation').usePathname;
        mockUsePathname.mockReturnValue('/');

        render(<Sidebar />);

        expect(screen.getByText('K8s-Dash')).toBeInTheDocument();
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Clusters')).toBeInTheDocument();
        expect(screen.getByText('Deployments')).toBeInTheDocument();
        expect(screen.getByText('Users')).toBeInTheDocument();
    });

    it('highlights active navigation item', () => {
        const mockUsePathname = require('next/navigation').usePathname;
        mockUsePathname.mockReturnValue('/clusters');

        render(<Sidebar />);

        const clustersLink = screen.getByRole('link', { name: /clusters/i });
        expect(clustersLink).toHaveClass('bg-primary-100', 'text-primary-600');
    });

    it('handles logout functionality', async () => {
        const mockUsePathname = require('next/navigation').usePathname;
        mockUsePathname.mockReturnValue('/');

        render(<Sidebar />);

        const signOutButton = screen.getByRole('button', { name: /sign out/i });
        fireEvent.click(signOutButton);

        expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('renders all navigation links with correct hrefs', () => {
        const mockUsePathname = require('next/navigation').usePathname;
        mockUsePathname.mockReturnValue('/');

        render(<Sidebar />);

        expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/');
        expect(screen.getByRole('link', { name: /clusters/i })).toHaveAttribute('href', '/clusters');
        expect(screen.getByRole('link', { name: /deployments/i })).toHaveAttribute('href', '/deployments');
        expect(screen.getByRole('link', { name: /users/i })).toHaveAttribute('href', '/users');
    });

    it('applies inactive styles to non-current navigation items', () => {
        const mockUsePathname = require('next/navigation').usePathname;
        mockUsePathname.mockReturnValue('/clusters');

        render(<Sidebar />);

        const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
        expect(dashboardLink).toHaveClass('text-gray-600', 'hover:bg-gray-50', 'hover:text-gray-900');
    });

    it('renders with proper semantic structure', () => {
        const mockUsePathname = require('next/navigation').usePathname;
        mockUsePathname.mockReturnValue('/');

        render(<Sidebar />);

        expect(screen.getByRole('navigation')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'K8s-Dash' })).toBeInTheDocument();
    });
});
