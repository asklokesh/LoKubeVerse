import { useCallback } from 'react';

export const useErrorHandler = () => {
    const getErrorMessage = useCallback((error: any, defaultMessage: string) => {
        if (error?.response?.data?.message) {
            return error.response.data.message;
        }
        if (error?.message) {
            return error.message;
        }
        return defaultMessage;
    }, []);

    return { getErrorMessage };
};