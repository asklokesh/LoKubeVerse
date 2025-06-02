import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getAll();
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (data: Omit<User, 'id' | 'lastLogin'>) => {
    try {
      const response = await usersApi.create(data);
      setUsers([...users, response.data]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const updateUser = async (id: number, data: Partial<User>) => {
    try {
      const response = await usersApi.update(id, data);
      setUsers(users.map((user) => 
        user.id === id ? response.data : user
      ));
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const deleteUser = async (id: number) => {
    try {
      await usersApi.delete(id);
      setUsers(users.filter((user) => user.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers: fetchUsers,
  };
} 