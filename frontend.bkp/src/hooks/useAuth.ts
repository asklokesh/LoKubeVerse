import { useState, useCallback, useEffect } from 'react';
import api from '../config/api';

interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

interface SessionResponse {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.get<SessionResponse>('/auth/session');
        if (response.data.isAuthenticated && response.data.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        // Ignore session check errors - user is not authenticated
        console.debug('Session check failed:', err);
      }
    };

    checkSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
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
      const response = await api.post<AuthResponse>('/auth/register', {
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