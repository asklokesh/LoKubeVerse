import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InviteUserForm } from '@/components/users/InviteUserForm';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('InviteUserForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders invite user form', () => {
    render(<InviteUserForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /invite/i })).toBeInTheDocument();
  });

  it('submits invite and shows success', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: 'Invitation sent' } });
    render(<InviteUserForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invite@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /invite/i }));
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/users/invite', { email: 'invite@example.com' });
      expect(screen.getByText(/invitation sent/i)).toBeInTheDocument();
    });
  });
});
