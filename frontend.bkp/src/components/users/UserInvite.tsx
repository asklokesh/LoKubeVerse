import React, { useState } from 'react';
import axios from 'axios';

export const UserInvite: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<string>('user');
  const [error, setError] = useState<string | null>(null);

  const handleInvite = async () => {
    try {
      await axios.post('/api/users/invite', { email, role });
      setEmail('');
      setRole('user');
      setError(null);
    } catch (err) {
      setError('Failed to invite user');
    }
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email"
      />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <button onClick={handleInvite}>Invite User</button>
      {error && <div>{error}</div>}
    </div>
  );
}; 