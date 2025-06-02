import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuditLogViewer } from '@/components/users/AuditLogViewer';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuditLogViewer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders audit logs', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [
      { id: '1', action: 'login', resource: 'user', details: {}, created_at: '2024-01-01T00:00:00Z' },
      { id: '2', action: 'create', resource: 'cluster', details: {}, created_at: '2024-01-02T00:00:00Z' },
    ] });
    render(<AuditLogViewer />);
    await waitFor(() => {
      expect(screen.getByText(/login/)).toBeInTheDocument();
      expect(screen.getByText(/create/)).toBeInTheDocument();
      expect(screen.getByText(/cluster/)).toBeInTheDocument();
    });
  });
});
