import { renderHook } from '@testing-library/react';
import { useErrorHandler } from '@/hooks/useErrorHandler';

describe('useErrorHandler', () => {
  it('returns the correct API error message', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    // Test with a standard Axios error response
    const error = {
      response: {
        data: {
          message: 'Invalid credentials'
        }
      }
    };
    
    expect(result.current.getErrorMessage(error)).toBe('Invalid credentials');
  });
  
  it('returns a fallback message when error has no response data', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    // Test with a network error
    const error = {
      message: 'Network Error'
    };
    
    expect(result.current.getErrorMessage(error)).toBe('Network Error');
  });
  
  it('returns a default message for unexpected error formats', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    // Test with an unknown error format
    const error = {};
    
    expect(result.current.getErrorMessage(error)).toBe('An unexpected error occurred');
  });
  
  it('returns a customized default message when provided', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    // Test with an unknown error format and custom message
    const error = {};
    
    expect(result.current.getErrorMessage(error, 'Failed to load data')).toBe('Failed to load data');
  });
});
