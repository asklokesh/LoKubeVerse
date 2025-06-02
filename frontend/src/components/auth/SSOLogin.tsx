import React from 'react';
import axios from 'axios';

export const SSOLogin: React.FC = () => {
  const handleSSOLogin = async () => {
    try {
      const response = await axios.get('/api/auth/sso');
      window.location.href = response.data.url;
    } catch (error) {
      console.error('SSO login failed:', error);
    }
  };

  return (
    <button onClick={handleSSOLogin}>
      Login with SSO
    </button>
  );
}; 