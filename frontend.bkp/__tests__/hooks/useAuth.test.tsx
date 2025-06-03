import { renderHook, waitFor, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock localStorage properly
const createMockStorage = () => {
    let store: Record<string, string> = {};
    return {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        })
    };
};

const localStorageMock = createMockStorage();
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

describe('useAuth', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.getItem.mockClear();
        localStorageMock.setItem.mockClear();
        localStorageMock.removeItem.mockClear();
        // Mock the session check API call that happens on mount
        mockedAxios.get.mockRejectedValue(new Error('No session'));
    });

    it('initializes with null user and no loading', () => {
        const { result } = renderHook(() => useAuth());

        expect(result.current.user).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('handles successful login', async () => {
        const mockResponse = {
            data: {
                user: { id: '1', email: 'test@example.com', name: 'Test User' },
                access_token: 'mock-token-123',
            },
        };
        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        const { result } = renderHook(() => useAuth());

        let loginPromise: any;
        let response: any;

        await act(async () => {
            loginPromise = result.current.login('test@example.com', 'password');
        });

        await act(async () => {
            response = await loginPromise;
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.user).toEqual(mockResponse.data.user);
        expect(result.current.error).toBeNull();

        expect(response).toEqual(mockResponse.data);
        expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/login', {
            email: 'test@example.com',
            password: 'password',
        });
        expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-token-123');
    });

    it('handles login failure', async () => {
        mockedAxios.post.mockRejectedValueOnce(new Error('Invalid credentials'));

        const { result } = renderHook(() => useAuth());

        let thrownError;
        await act(async () => {
            try {
                await result.current.login('test@example.com', 'wrongpassword');
            } catch (error) {
                thrownError = error;
            }
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Login failed');
        expect(result.current.user).toBeNull();
        expect(thrownError).toBeInstanceOf(Error);
        expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('handles successful registration', async () => {
        const mockResponse = {
            data: {
                user: { id: '1', email: 'newuser@example.com', name: 'New User' },
                access_token: 'new-token-456',
            },
        };
        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        const { result } = renderHook(() => useAuth());

        let response: any;
        await act(async () => {
            response = await result.current.register('New User', 'newuser@example.com', 'password');
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.user).toEqual(mockResponse.data.user);
        expect(result.current.error).toBeNull();
        expect(response).toEqual(mockResponse.data);
        expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/register', {
            name: 'New User',
            email: 'newuser@example.com',
            password: 'password',
        });
        expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'new-token-456');
    });

    it('handles registration failure', async () => {
        mockedAxios.post.mockRejectedValueOnce(new Error('Email already exists'));

        const { result } = renderHook(() => useAuth());

        let thrownError;
        await act(async () => {
            try {
                await result.current.register('New User', 'existing@example.com', 'password');
            } catch (error) {
                thrownError = error;
            }
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Registration failed');
        expect(result.current.user).toBeNull();
        expect(thrownError).toBeInstanceOf(Error);
    });

    it('handles logout', () => {
        const { result } = renderHook(() => useAuth());

        act(() => {
            result.current.logout();
        });

        expect(result.current.user).toBeNull();
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });

    it('maintains loading state during async operations', async () => {
        // Create a promise that never resolves to keep loading state
        let resolvePromise: any;
        const neverResolvingPromise = new Promise((resolve) => {
            resolvePromise = resolve;
        });
        mockedAxios.post.mockReturnValueOnce(neverResolvingPromise as any);

        const { result } = renderHook(() => useAuth());

        act(() => {
            result.current.login('test@example.com', 'password');
        });

        expect(result.current.loading).toBe(true);

        // Clean up by resolving the promise
        act(() => {
            resolvePromise({ data: { user: { id: '1' }, access_token: 'token' } });
        });
    });

    it('clears error on successful operations', async () => {
        const { result } = renderHook(() => useAuth());

        // First cause an error
        mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));
        await act(async () => {
            try {
                await result.current.login('test@example.com', 'password');
            } catch { }
        });

        expect(result.current.error).toBe('Login failed');

        // Then succeed
        mockedAxios.post.mockResolvedValueOnce({
            data: {
                user: { id: '1', email: 'test@example.com', name: 'Test' },
                access_token: 'token'
            },
        });
        await act(async () => {
            await result.current.login('test@example.com', 'password');
        });

        expect(result.current.error).toBeNull();
    });
});
