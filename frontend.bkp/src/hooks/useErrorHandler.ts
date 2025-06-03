/**
 * A hook for handling and formatting API errors consistently
 */
export const useErrorHandler = () => {
  /**
   * Extract a user-friendly error message from various error formats
   * @param error - The error object from API calls or other sources
   * @param defaultMessage - Optional custom default message
   * @returns A user-friendly error message
   */
  const getErrorMessage = (error: any, defaultMessage = 'An unexpected error occurred'): string => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    
    if (error.message) {
      return error.message;
    }
    
    return defaultMessage;
  };
  
  return {
    getErrorMessage,
  };
};
