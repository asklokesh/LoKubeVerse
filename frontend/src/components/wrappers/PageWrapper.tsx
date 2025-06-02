import React, { ReactNode } from 'react';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { ErrorFallback } from '../common/ErrorFallback';
import { MockDataProvider } from '@/providers/MockDataProvider';

interface PageWrapperProps {
    children: ReactNode;
    title?: string;
}

/**
 * A wrapper component for pages that provides error handling and mock data
 * This ensures all pages have consistent error boundaries and can access mock data
 */
export const PageWrapper: React.FC<PageWrapperProps> = ({
    children,
    title = 'Page failed to load'
}) => {
    return (
        <ErrorBoundary
            fallback={<ErrorFallback error={new Error(title)} resetError={() => window.location.reload()} />}
        >
            <MockDataProvider>
                {children}
            </MockDataProvider>
        </ErrorBoundary>
    );
};
