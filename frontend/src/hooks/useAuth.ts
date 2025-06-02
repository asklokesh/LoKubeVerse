import { useState, useCallback } from 'react';
import axios from 'axios';

interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<AuthResponse>('/api/auth/login', {
        email,
        password,
      });
      setUser(response.data.user);
      localStorage.setItem('token', response.data.access_token);
      return response.data;
    } catch (err) {
      setError('Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<AuthResponse>('/api/auth/register', {
        name,
        email,
        password,
      });
      setUser(response.data.user);
      localStorage.setItem('token', response.data.access_token);
      return response.data;
    } catch (err) {
      setError('Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
  }, []);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };
}; 