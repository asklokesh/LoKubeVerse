import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  EnvelopeIcon, 
  LockClosedIcon,
  ServerStackIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import { authService } from '../services/api'
import toast from 'react-hot-toast'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authService.login(email, password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-ios-blue to-ios-blue-light rounded-ios-xl mx-auto flex items-center justify-center mb-4">
            <ServerStackIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">K8s Dash</h1>
          <p className="text-white/80">Multi-Cloud Kubernetes Management</p>
        </div>

        {/* Login Form */}
        <div className="card-ios">
          <h2 className="text-2xl font-bold text-ios-gray-900 text-center mb-6">Welcome Back</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-ios-red/10 border border-ios-red/20 rounded-ios p-3 flex items-center gap-2"
              >
                <ExclamationCircleIcon className="w-5 h-5 text-ios-red flex-shrink-0" />
                <p className="text-sm text-ios-red">{error}</p>
              </motion.div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-ios-gray-700">Email</label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ios-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-ios pl-10"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-ios-gray-700">Password</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ios-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-ios pl-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-ios-gray-300 text-ios-blue focus:ring-ios-blue" />
                <span className="ml-2 text-sm text-ios-gray-700">Remember me</span>
              </label>
              <a href="#" className="text-sm font-medium text-ios-blue hover:text-blue-600">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-ios-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-ios-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-ios-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="btn-ios-secondary flex items-center justify-center gap-2">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                Google
              </button>
              <button className="btn-ios-secondary flex items-center justify-center gap-2">
                <img src="https://www.svgrepo.com/show/475661/github-color.svg" alt="GitHub" className="w-5 h-5" />
                GitHub
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-ios-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="font-medium text-ios-blue hover:text-blue-600">
              Sign up
            </a>
          </p>
        </div>

        {/* Demo Credentials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 card-ios bg-ios-blue/10 border border-ios-blue/20"
        >
          <p className="text-sm font-medium text-ios-blue mb-2">Demo Credentials</p>
          <p className="text-xs text-ios-gray-600">Email: demo@k8sdash.com</p>
          <p className="text-xs text-ios-gray-600">Password: demo123</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Login 