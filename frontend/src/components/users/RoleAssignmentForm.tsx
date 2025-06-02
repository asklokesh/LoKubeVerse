import React, { useState } from 'react';
import axios from 'axios';

interface RoleAssignmentFormProps {
  userId: string;
}

export const RoleAssignmentForm: React.FC<RoleAssignmentFormProps> = ({ userId }) => {
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`/api/users/${userId}/role`, { role });
      setMessage(res.data.message || 'Role assigned');
    } catch (err) {
      setMessage('Failed to assign role');
    }
  };

  return (
    <form onSubmit={handleAssign}>
      <label htmlFor="role-select">Role</label>
      <select
        id="role-select"
        value={role}
        onChange={e => setRole(e.target.value)}
        aria-label="role"
        required
      >
        <option value="">Select role</option>
        <option value="admin">Admin</option>
        <option value="user">User</option>
        <option value="viewer">Viewer</option>
      </select>
      <button type="submit">Assign</button>
      {message && <div>{message}</div>}
    </form>
  );
};
