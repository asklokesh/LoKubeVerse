import { render, screen, waitFor } from '@testing-library/react';
import { MockDataProvider } from '@/providers/MockDataProvider';
import { useClusters } from '@/hooks/useClusters';
import { useDeployments } from '@/hooks/useDeployments';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

// Mock axios to avoid actual API calls
jest.mock('axios');

describe('MockDataProvider', () => {
  // Test component that consumes the mock data
  const TestComponent = () => {
    const { clusters, loading: clustersLoading } = useClusters();
    const { deployments, loading: deploymentsLoading } = useDeployments();
    const { user } = useAuth();
    const [ready, setReady] = useState(false);
    
    useEffect(() => {
      if (!clustersLoading && !deploymentsLoading) {
        setReady(true);
      }
    }, [clustersLoading, deploymentsLoading]);
    
    return (
      <div>
        {ready ? (
          <>
            <div data-testid="clusters-count">{clusters.length}</div>
            <div data-testid="deployments-count">{deployments.length}</div>
            <div data-testid="auth-status">{user ? 'Logged in' : 'Not logged in'}</div>
          </>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    );
  };

  it('provides mock clusters data', async () => {
    render(
      <MockDataProvider>
        <TestComponent />
      </MockDataProvider>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByTestId('clusters-count')).toBeInTheDocument();
    });
    
    const clustersCount = screen.getByTestId('clusters-count');
    expect(clustersCount.textContent).not.toBe('0');
  });
  
  it('provides mock deployments data', async () => {
    render(
      <MockDataProvider>
        <TestComponent />
      </MockDataProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('deployments-count')).toBeInTheDocument();
    });
    
    const deploymentsCount = screen.getByTestId('deployments-count');
    expect(deploymentsCount.textContent).not.toBe('0');
  });
  
  it('provides a mock authenticated user', async () => {
    render(
      <MockDataProvider initialAuthState={{ isAuthenticated: true }}>
        <TestComponent />
      </MockDataProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toBeInTheDocument();
    });
    
    const authStatus = screen.getByTestId('auth-status');
    expect(authStatus.textContent).toBe('Logged in');
  });
});
