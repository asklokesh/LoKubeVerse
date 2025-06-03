import React from 'react';

interface ErrorFallbackProps {
    error: Error;
    resetError?: () => void;
}

/**
 * Default error fallback component for error boundaries
 */
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
    return (
        <div className="p-6 max-w-lg mx-auto my-8 bg-white rounded-lg shadow-md border border-red-200">
            <div className="flex items-center mb-4">
                <div className="bg-red-100 p-2 rounded-full">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>
                <h2 className="ml-3 text-lg font-medium text-gray-900">Something went wrong</h2>
            </div>

            <div className="bg-gray-50 p-4 rounded-md mb-4">
                <p className="text-sm font-mono text-gray-800">{error.message}</p>
            </div>

            {resetError && (
                <div className="flex justify-end">
                    <button
                        onClick={resetError}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Try again
                    </button>
                </div>
            )}

            <p className="mt-4 text-sm text-gray-500">
                If this problem persists, please contact support or try reloading the page.
            </p>
        </div>
    );
};
