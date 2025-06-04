import React, { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChartPieIcon,
  ServerStackIcon,
  CubeIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  BellIcon,
  MenuIcon as Bars3Icon,
  XIcon as XMarkIcon,
  SearchIcon as MagnifyingGlassIcon,
  UserCircleIcon
} from '@heroicons/react/outline'
import { authService } from '../services/api'
import toast, { Toaster } from 'react-hot-toast'

const navigation = [
  { name: 'Dashboard', href: '/', icon: ChartPieIcon },
  { name: 'Clusters', href: '/clusters', icon: ServerStackIcon },
  { name: 'Workloads', href: '/workloads', icon: CubeIcon },
  { name: 'Deployments', href: '/deployments', icon: RocketLaunchIcon },
  { name: 'Monitoring', href: '/monitoring', icon: ChartBarIcon },
  { name: 'Cost Analysis', href: '/costs', icon: CurrencyDollarIcon },
  { name: 'Users', href: '/users', icon: UsersIcon },
]

const NavLink = ({ item, isActive, onClick }) => (
  <Link
    to={item.href}
    onClick={onClick}
    className={`
      flex items-center gap-3 px-4 py-3 rounded-ios transition-all duration-200
      ${isActive 
        ? 'bg-ios-blue text-white shadow-ios-md' 
        : 'text-ios-gray-700 hover:bg-ios-gray-100'
      }
    `}
  >
    <item.icon className="w-5 h-5" />
    <span className="font-medium">{item.name}</span>
  </Link>
)

const Layout = () => {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const user = authService.getUser()

  const handleLogout = () => {
    authService.logout()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400">
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'glass rounded-ios-lg',
          style: {
            padding: '16px',
            color: '#1C1C1E',
          },
          success: {
            iconTheme: {
              primary: '#34C759',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF3B30',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Top Navigation */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/20">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-ios hover:bg-ios-gray-100"
            >
              {sidebarOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-ios-blue to-ios-blue-light rounded-ios flex items-center justify-center">
                <ServerStackIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-ios-gray-900">K8s Dash</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ios-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clusters, workloads..."
                  className="input-ios pl-10 pr-4 py-2 w-64"
                />
              </div>
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-ios hover:bg-ios-gray-100">
              <BellIcon className="w-6 h-6 text-ios-gray-700" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-ios-red rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 rounded-ios hover:bg-ios-gray-100"
              >
                <UserCircleIcon className="w-8 h-8 text-ios-gray-700" />
                <span className="hidden md:block text-sm font-medium text-ios-gray-700">
                  {user?.name || 'User'}
                </span>
              </button>

              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 glass rounded-ios-lg shadow-ios-xl overflow-hidden"
                >
                  <Link
                    to="/profile"
                    className="block px-4 py-3 text-sm text-ios-gray-700 hover:bg-ios-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-3 text-sm text-ios-gray-700 hover:bg-ios-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Settings
                  </Link>
                  <hr className="border-ios-gray-200" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 text-sm text-ios-red hover:bg-ios-gray-100"
                  >
                    Sign Out
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-16 left-0 bottom-0 w-64 glass border-r border-white/20 z-40
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="p-4 space-y-1 scrollbar-ios overflow-y-auto h-full">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              item={item}
              isActive={location.pathname === item.href}
              onClick={() => setSidebarOpen(false)}
            />
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 mt-16 p-6">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-7xl mx-auto"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}

export default Layout 