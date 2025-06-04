import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Dashboard from '../components/Dashboard'

// Mock the API service
vi.mock('../services/api', () => ({
  apiService: {
    getDashboardStats: vi.fn().mockResolvedValue({
      clusters: {
        total: 12,
        aws: 5,
        azure: 3,
        gcp: 4,
        running: 9,
        stopped: 3
      },
      workloads: {
        deployments: 24,
        statefulsets: 8,
        daemonsets: 6,
        pods: {
          running: 86,
          pending: 2,
          failed: 1
        }
      },
      nodes: {
        total: 15,
        healthy: 14,
        unhealthy: 1
      },
      resources: {
        cpu: {
          total: 48,
          used: 32,
          available: 16
        },
        memory: {
          total: 192,
          used: 128,
          available: 64
        },
        storage: {
          total: 1024,
          used: 512,
          available: 512
        }
      },
      costs: {
        total: 1245.67,
        compute: 856.32,
        storage: 245.18,
        network: 144.17
      },
      activity: [
        { timestamp: "2023-01-01T10:00:00Z", event: "Cluster k8s-prod-01 scaled up", user: "admin" }
      ]
    }),
    getRecentActivity: vi.fn().mockResolvedValue([
      { timestamp: "2023-01-01T10:00:00Z", event: "Cluster k8s-prod-01 scaled up", user: "admin" }
    ])
  }
}))

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks()
  })

  it('renders dashboard with statistics', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )
    
    // Wait for dashboard data to load
    await waitFor(() => {
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument()
    })
    
    // Check for various dashboard elements
    await waitFor(() => {
      expect(screen.getByText(/Total Clusters/i)).toBeInTheDocument()
      expect(screen.getByText(/12/)).toBeInTheDocument() // Total clusters count
      expect(screen.getByText(/Resource Utilization/i)).toBeInTheDocument()
    })
  })
}) 