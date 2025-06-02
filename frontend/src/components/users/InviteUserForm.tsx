import React, { useState } from 'react';
import axios from 'axios';

export const InviteUserForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/users/invite', { email });
      setMessage(res.data.message || 'Invitation sent');
    } catch (err) {
      setMessage('Failed to send invitation');
    }
  };

  return (
    <form onSubmit={handleInvite}>
      <label htmlFor="invite-email">Email</label>
      <input
        id="invite-email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        aria-label="email"
        required
      />
      <button type="submit">Invite</button>
      {message && <div>{message}</div>}
    </form>
  );
};
