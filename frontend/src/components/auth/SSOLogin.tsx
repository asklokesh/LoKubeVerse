import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export const SSOLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { getErrorMessage } = useErrorHandler();
  const router = useRouter();

  const handleSSOLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/auth/sso');
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        // For demo purposes, redirect to dashboard
        router.push('/');
      }
    } catch (error) {
      console.error('SSO login failed:', error);
      alert(getErrorMessage(error, 'SSO login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSSOLogin}
      disabled={loading}
      className="px-6 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      {loading ? 'Connecting...' : 'Sign in with SSO'}
    </button>
  );
}; 