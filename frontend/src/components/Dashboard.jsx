import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowPathIcon, 
  ServerIcon,
  CloudIcon,
  CurrencyDollarIcon,
  HeartIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { apiClient } from '../services/api'
import { formatDistanceToNow } from 'date-fns'

const StatCard = ({ icon: Icon, title, value, change, bgColor, iconColor }) => (
  <motion.div 
    className="card-ios"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center gap-4">
      <div className={`w-14 h-14 rounded-ios flex items-center justify-center ${bgColor}`}>
        <Icon className={`w-7 h-7 ${iconColor}`} />
      </div>
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-ios-gray-900">{value}</h3>
        <p className="text-sm text-ios-gray-600">{title}</p>
        {change && (
          <span className={`text-xs font-semibold ${
            change.startsWith('+') ? 'text-ios-green' : 
            change.startsWith('-') ? 'text-ios-red' : 'text-ios-gray-500'
          }`}>
            {change}
          </span>
        )}
      </div>
    </div>
  </motion.div>
)

const ActivityItem = ({ activity }) => {
  const getIcon = () => {
    switch (activity.severity) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-ios-green" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-ios-orange" />
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-ios-red" />
      default:
        return <InformationCircleIcon className="w-5 h-5 text-ios-blue" />
    }
  }

  return (
    <div className={`timeline-item ${activity.severity}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-ios-gray-900">{activity.message}</p>
          <span className="text-xs text-ios-gray-500">
            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  )
}

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async () => {
    try {
      setError(null)
      const [statsData, activityData] = await Promise.all([
        apiClient.getDashboardStats(),
        apiClient.getRecentActivity()
      ])
      setStats(statsData)
      setActivity(activityData)
    } catch (err) {
      setError('Error loading dashboard')
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-ios-blue border-t-transparent mx-auto mb-4"></div>
          <p className="text-ios-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-ios-red mx-auto mb-4" />
          <p className="text-ios-gray-900 font-medium">{error}</p>
          <button 
            onClick={handleRefresh}
            className="btn-ios-primary mt-4"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-ios-gray-900">Dashboard</h1>
        <button
          onClick={handleRefresh}
          className={`btn-ios-secondary flex items-center gap-2 ${refreshing ? 'opacity-50' : ''}`}
          disabled={refreshing}
          aria-label="refresh"
        >
          <ArrowPathIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ServerIcon}
          title="Total Clusters"
          value={stats?.clusters?.total || 0}
          change={null}
          bgColor="bg-ios-blue/10"
          iconColor="text-ios-blue"
        />
        <StatCard
          icon={CloudIcon}
          title="AWS Clusters"
          value={stats?.clusters?.aws || 0}
          change="+2 this month"
          bgColor="bg-aws/10"
          iconColor="text-aws"
        />
        <StatCard
          icon={HeartIcon}
          title="Uptime"
          value={`${stats?.health?.uptime || 0}%`}
          change="+0.1%"
          bgColor="bg-ios-green/10"
          iconColor="text-ios-green"
        />
        <StatCard
          icon={CurrencyDollarIcon}
          title="Total Cost"
          value={`$${stats?.costs?.total?.toLocaleString() || 0}/mo`}
          change=null}
          bgColor="bg-ios-orange/10"
          iconColor="text-ios-orange"
        />
      </div>

      {/* Cluster Status */}
      <div className="card-ios">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ios-gray-900">Cluster Status</h2>
          <Link 
            to="/clusters" 
            className="text-sm font-medium text-ios-blue hover:text-blue-600"
          >
            View all clusters →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="status-dot status-running"></div>
            <span className="text-sm text-ios-gray-700">{stats?.clusters?.running || 0} Running</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="status-dot status-stopped"></div>
            <span className="text-sm text-ios-gray-700">{stats?.clusters?.stopped || 0} Stopped</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <motion.div 
        className="card-ios"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-ios-gray-900">Recent Activity</h2>
          <Link 
            to="/activity" 
            className="text-sm font-medium text-ios-blue hover:text-blue-600"
          >
            View all {'\u2192'}
          </Link>
        </div>
        <div className="space-y-0">
          {activity.map(item => (
            <ActivityItem key={item.id} activity={item} />
          ))}
        </div>
      </motion.div>

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          className="card-ios border-l-4 border-aws"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ios-gray-600">AWS</p>
              <p className="text-2xl font-bold text-ios-gray-900">
                ${stats?.costs?.aws?.toLocaleString() || 0}
              </p>
            </div>
            <div className="provider-badge provider-aws">
              <CloudIcon className="w-4 h-4" />
              AWS
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="card-ios border-l-4 border-azure"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ios-gray-600">Azure</p>
              <p className="text-2xl font-bold text-ios-gray-900">
                ${stats?.costs?.azure?.toLocaleString() || 0}
              </p>
            </div>
            <div className="provider-badge provider-azure">
              <CloudIcon className="w-4 h-4" />
              Azure
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="card-ios border-l-4 border-gcp"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ios-gray-600">GCP</p>
              <p className="text-2xl font-bold text-ios-gray-900">
                ${stats?.costs?.gcp?.toLocaleString() || 0}
              </p>
            </div>
            <div className="provider-badge provider-gcp">
              <CloudIcon className="w-4 h-4" />
              GCP
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard 