import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from '../Dashboard'
import { apiClient } from '../../services/api'

vi.mock('../../services/api')

const mockStats = {
  clusters: {
    total: 12,
    aws: 5,
    azure: 3,
    gcp: 4,
    running: 10,
    stopped: 2
  },
  workloads: {
    total: 47,
    deployments: 25,
    statefulsets: 12,
    daemonsets: 10
  },
  health: {
    uptime: 99.9,
    incidents: 2
  },
  costs: {
    total: 2847,
    aws: 1245,
    azure: 897,
    gcp: 705
  }
}

const mockActivity = [
  {
    id: 1,
    type: 'deployment',
    message: 'prod-web-app deployment successful',
    timestamp: new Date().toISOString(),
    severity: 'success'
  },
  {
    id: 2,
    type: 'alert',
    message: 'staging-cluster CPU usage high (85%)',
    timestamp: new Date().toISOString(),
    severity: 'warning'
  }
]

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  )
}

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render dashboard with loading state', () => {
    apiClient.getDashboardStats.mockImplementation(() => new Promise(() => {}))
    apiClient.getRecentActivity.mockImplementation(() => new Promise(() => {}))

    renderDashboard()

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('should render dashboard stats', async () => {
    apiClient.getDashboardStats.mockResolvedValueOnce(mockStats)
    apiClient.getRecentActivity.mockResolvedValueOnce(mockActivity)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('12')).toBeInTheDocument() // Total clusters
      expect(screen.getByText('AWS Clusters')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('99.9%')).toBeInTheDocument() // Uptime
      expect(screen.getByText('$2,847/mo')).toBeInTheDocument() // Total cost
    })
  })

  it('should render recent activity', async () => {
    apiClient.getDashboardStats.mockResolvedValueOnce(mockStats)
    apiClient.getRecentActivity.mockResolvedValueOnce(mockActivity)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText(/prod-web-app deployment successful/)).toBeInTheDocument()
      expect(screen.getByText(/staging-cluster CPU usage high/)).toBeInTheDocument()
    })
  })

  it('should handle API errors gracefully', async () => {
    apiClient.getDashboardStats.mockRejectedValueOnce(new Error('API Error'))
    apiClient.getRecentActivity.mockRejectedValueOnce(new Error('API Error'))

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText(/error loading dashboard/i)).toBeInTheDocument()
    })
  })

  it('should refresh data when refresh button clicked', async () => {
    apiClient.getDashboardStats.mockResolvedValue(mockStats)
    apiClient.getRecentActivity.mockResolvedValue(mockActivity)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
    })

    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    refreshButton.click()

    expect(apiClient.getDashboardStats).toHaveBeenCalledTimes(2)
    expect(apiClient.getRecentActivity).toHaveBeenCalledTimes(2)
  })

  it('should show correct status indicators', async () => {
    apiClient.getDashboardStats.mockResolvedValueOnce(mockStats)
    apiClient.getRecentActivity.mockResolvedValueOnce(mockActivity)

    renderDashboard()

    await waitFor(() => {
      // Check for running clusters indicator
      expect(screen.getByText('10 Running')).toBeInTheDocument()
      expect(screen.getByText('2 Stopped')).toBeInTheDocument()
    })
  })

  it('should navigate to clusters page when view all clicked', async () => {
    apiClient.getDashboardStats.mockResolvedValueOnce(mockStats)
    apiClient.getRecentActivity.mockResolvedValueOnce(mockActivity)

    renderDashboard()

    await waitFor(() => {
      const viewAllLink = screen.getByRole('link', { name: /view all clusters/i })
      expect(viewAllLink).toHaveAttribute('href', '/clusters')
    })
  })
}) 