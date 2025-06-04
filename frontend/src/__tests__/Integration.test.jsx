import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import App from '../components/App'

// Mock the API service
vi.mock('../services/api', () => ({
  authService: {
    login: vi.fn().mockResolvedValue({
      access_token: 'test-token',
      user: { id: 1, name: 'Test User', email: 'test@example.com' }
    }),
    logout: vi.fn(),
    isAuthenticated: vi.fn().mockReturnValue(true),
    getUser: vi.fn().mockReturnValue({ id: 1, name: 'Test User', email: 'test@example.com' }),
    getProfile: vi.fn().mockResolvedValue({
      data: { id: 1, name: 'Test User', email: 'test@example.com' }
    })
  },
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
      health: {
        uptime: 99.98,
        lastIncident: "2023-04-15T14:30:00Z"
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
        network: 144.17,
        aws: 624.45,
        azure: 298.67,
        gcp: 322.55
      },
      activity: [
        { id: 1, timestamp: "2023-08-15T10:30:00Z", message: "Cluster k8s-prod-01 scaled up", severity: "info", user: "admin" }
      ]
    }),
    getRecentActivity: vi.fn().mockResolvedValue([
      { id: 1, timestamp: "2023-08-15T10:30:00Z", message: "Cluster k8s-prod-01 scaled up", severity: "info", user: "admin" }
    ]),
    getWorkloads: vi.fn().mockResolvedValue([
      { id: 1, name: 'frontend', type: 'deployment', namespace: 'default', status: 'running', replicas: 3, image: 'nginx:latest' }
    ])
  }
}))

// Mock environment variables
vi.stubGlobal('import.meta', { 
  env: { 
    VITE_DEV_MODE: 'true', 
    VITE_SKIP_AUTHENTICATION: 'true',
    VITE_API_URL: 'http://localhost:8000'
  } 
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('Application Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') return 'test-token'
      if (key === 'user') return JSON.stringify({ id: 1, name: 'Test User', email: 'test@example.com' })
      return null
    })
  })

  it('renders the full application with dashboard in dev mode', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    
    // Expect App to show a loading state first
    expect(screen.getByText(/App mounted, auth status:/i)).toBeInTheDocument()
    
    // Wait for dashboard to appear
    await waitFor(() => {
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument()
    })
    
    // Verify dashboard content appears
    await waitFor(() => {
      expect(screen.getByText(/Total Clusters/i)).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument() // Total clusters count
    })
  })

  it('allows navigation between different pages', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument()
    })
    
    // Navigate to Workloads
    const workloadsLink = screen.getAllByText(/Workloads/i)[0]
    fireEvent.click(workloadsLink)
    
    // Verify workloads page content
    await waitFor(() => {
      expect(screen.getByText(/Deploy Workload/i)).toBeInTheDocument()
    })
  })
}) 