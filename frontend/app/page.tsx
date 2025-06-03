'use client'

import { useState, useEffect } from 'react'
import LoginForm from '@/components/auth/LoginForm'
import Dashboard from '@/components/dashboard/Dashboard'

export default function Home() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Check if user is already authenticated
        const token = localStorage.getItem('authToken')
        if (token) {
            // Verify token with backend
            fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => {
                    if (response.ok) {
                        setIsAuthenticated(true)
                    } else {
                        localStorage.removeItem('authToken')
                    }
                })
                .catch(() => {
                    localStorage.removeItem('authToken')
                })
                .finally(() => {
                    setIsLoading(false)
                })
        } else {
            setIsLoading(false)
        }
    }, [])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <LoginForm onLoginSuccess={() => setIsAuthenticated(true)} />
    }

    return <Dashboard onLogout={() => setIsAuthenticated(false)} />
}