import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoadingState } from '@/components/common/LoadingState';

describe('LoadingState', () => {
    it('renders a spinner and loading message', () => {
        render(<LoadingState message="Loading data..." />);

        // Check if spinner or loading indicator exists
        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    it('renders with default message when none provided', () => {
        render(<LoadingState />);

        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.getByText('Loading default...')).toBeInTheDocument();
    });

    it('renders with custom size classes when provided', () => {
        render(<LoadingState size="lg" />);

        const spinner = screen.getByRole('status');
        expect(spinner.classList.contains('h-10')).toBeTruthy();
        expect(spinner.classList.contains('w-10')).toBeTruthy();
    });
});
