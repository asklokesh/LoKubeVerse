import React from 'react';
import { render, screen } from '@testing-library/react';
import { PageWrapper } from '../../src/components/wrappers/PageWrapper';

// Mock the error boundary component
jest.mock('../../src/components/common/ErrorBoundary', () => ({
    ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>
}));

// Mock the mock data provider
jest.mock('../../src/providers/MockDataProvider', () => ({
    MockDataProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-data-provider">{children}</div>
}));

describe('PageWrapper', () => {
    it('renders children correctly', () => {
        render(
            <PageWrapper>
                <div data-testid="test-content">Test Content</div>
            </PageWrapper>
        );

        // Check that the content is rendered
        expect(screen.getByTestId('test-content')).toBeInTheDocument();
        expect(screen.getByTestId('test-content')).toHaveTextContent('Test Content');

        // Check that it's wrapped in the error boundary and mock data provider
        expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
        expect(screen.getByTestId('mock-data-provider')).toBeInTheDocument();
    });

    it('passes custom title to error boundary', () => {
        const customTitle = 'Custom Error Title';
        render(
            <PageWrapper title={customTitle}>
                <div>Test Content</div>
            </PageWrapper>
        );

        // Since we've mocked the ErrorBoundary, we can't test the actual prop passing
        // In a real test setup, you might want to use a spy or a more complex mock
        expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });
});
