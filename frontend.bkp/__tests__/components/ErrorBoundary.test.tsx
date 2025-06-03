import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

// Mock console.error to avoid test noise
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = jest.fn();
});
afterEach(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary', () => {
  // Component that throws an error
  const ThrowError = ({ message }: { message: string }) => {
    throw new Error(message);
    return null;
  };
  
  it('renders the fallback UI when a child component throws', () => {
    render(
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <ThrowError message="Test error" />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
  
  it('renders children normally when no errors occur', () => {
    render(
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <div>Content rendered successfully</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Content rendered successfully')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });
  
  it('renders custom fallback UI with error details', () => {
    const CustomFallback = ({ error }: { error: Error }) => (
      <div>Error: {error.message}</div>
    );
    
    render(
      <ErrorBoundary fallback={({ error }) => <CustomFallback error={error} />}>
        <ThrowError message="Custom error message" />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Error: Custom error message')).toBeInTheDocument();
  });
});
