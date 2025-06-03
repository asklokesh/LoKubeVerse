import React from 'react';

interface LoadingStateProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
    type?: 'default' | 'clusters' | 'deployments' | 'users' | 'namespaces';
}

/**
 * A consistent loading spinner with customizable message
 * Optional type parameter to show different loading animations based on content type
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
    message,
    size = 'md',
    type = 'default',
}) => {
    // Generate message based on type if not provided
    const loadingMessage = message || `Loading ${type}...`;
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-10 w-10',
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <div
                className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin`}
                role="status"
            />
            <p className="text-gray-600 font-medium">{loadingMessage}</p>
        </div>
    );
};
