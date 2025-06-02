'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SSOLogin } from '@/components/auth/SSOLogin';
import { TenantSwitcher } from '@/components/tenant/TenantSwitcher';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ErrorFallback } from '@/components/common/ErrorFallback';
import { MockDataProvider } from '@/providers/MockDataProvider';
import { useAuth } from '@/hooks/useAuth';
import { LoadingState } from '@/components/common/LoadingState';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push('/');
    } catch (error) {
      // Error is handled by useAuth hook
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl px-8 pt-8 pb-10 mb-4 border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">K8s-Dash</h1>
            <p className="text-gray-600">Multi-Cloud Kubernetes Management</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="bg-white/50 backdrop-blur-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="bg-white/50 backdrop-blur-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <button
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
            <div className="mt-4 flex justify-center">
              <SSOLogin />
            </div>
          </div>

          <div className="mt-6 mb-2">
            <TenantSwitcher />
          </div>

          <div className="mt-4 text-xs text-center text-gray-500">
            <p>For demo purposes: any credentials will work</p>
            <button
              className="mt-2 text-blue-500 hover:underline"
              onClick={() => router.push('/')}
            >
              Skip login (Demo Mode)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <ErrorBoundary
      fallback={<ErrorFallback error={new Error('Failed to load login page')} />}
    >
      <MockDataProvider initialAuthState={{ isAuthenticated: false }}>
        <LoginForm />
      </MockDataProvider>
    </ErrorBoundary>
  );
} 