import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RoleAssignmentForm } from '@/components/users/RoleAssignmentForm';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('RoleAssignmentForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders role assignment form', () => {
    render(<RoleAssignmentForm userId="1" />);
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /assign/i })).toBeInTheDocument();
  });

  it('submits role assignment and shows success', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: 'Role assigned' } });
    render(<RoleAssignmentForm userId="1" />);
    fireEvent.change(screen.getByLabelText(/role/i), { target: { value: 'admin' } });
    fireEvent.click(screen.getByRole('button', { name: /assign/i }));
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/users/1/role', { role: 'admin' });
      expect(screen.getByText(/role assigned/i)).toBeInTheDocument();
    });
  });
});
