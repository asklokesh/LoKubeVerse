import axios from 'axios'
import toast from 'react-hot-toast'

// API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Development mode flag
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true'

// Create axios instance for API calls
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token')
    
    // If token exists, add to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add development mode header if enabled
    if (DEV_MODE) {
      config.headers['X-Dev-Mode'] = 'bypass-auth'
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    }
    return Promise.reject(error)
  }
)

// Authentication service
const authService = {
  // Login user
  login: async (email, password) => {
    // In dev mode, use the dev login endpoint if configured
    if (DEV_MODE && import.meta.env.VITE_SKIP_AUTHENTICATION === 'true') {
      try {
        const response = await apiClient.get('/api/dev/login')
        // Store token
        localStorage.setItem('token', response.data.access_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        return response.data
      } catch (error) {
        console.warn('Dev mode login failed, falling back to regular login')
        // Fall back to normal login
      }
    }
    
    // Regular login with credentials
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)
    
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    
    // Store token
    localStorage.setItem('token', response.data.access_token)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    return response.data
  },
  
  // Logout user
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  },
  
  // Get user from local storage
  getUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },
  
  // Get user profile
  getProfile: async () => {
    return apiClient.get('/api/users/me')
  },

  // Register new user
  register: async (email, password, name) => {
    const { data } = await apiClient.post('/api/auth/register', { email, password, name })
    return data
  }
}

// API service for all other endpoints
const apiService = {
  // Clusters
  async getClusters() {
    const { data } = await apiClient.get('/api/clusters')
    return data
  },

  async getCluster(id) {
    const { data } = await apiClient.get(`/api/clusters/${id}`)
    return data
  },

  async createCluster(cluster) {
    const { data } = await apiClient.post('/api/clusters', cluster)
    return data
  },

  async updateCluster(id, updates) {
    const { data } = await apiClient.patch(`/api/clusters/${id}`, updates)
    return data
  },

  async deleteCluster(id) {
    const { data } = await apiClient.delete(`/api/clusters/${id}`)
    return data
  },

  // Workloads
  async getWorkloads(clusterId = null) {
    const params = clusterId ? { cluster_id: clusterId } : {}
    const { data } = await apiClient.get('/api/workloads', { params })
    return data
  },

  async getWorkload(id) {
    const { data } = await apiClient.get(`/api/workloads/${id}`)
    return data
  },

  async deployWorkload(workload) {
    const { data } = await apiClient.post('/api/workloads', workload)
    return data
  },

  async updateWorkload(id, updates) {
    const { data } = await apiClient.patch(`/api/workloads/${id}`, updates)
    return data
  },

  async deleteWorkload(id) {
    const { data } = await apiClient.delete(`/api/workloads/${id}`)
    return data
  },

  // Deployments
  async getDeployments() {
    const { data } = await apiClient.get('/api/deployments')
    return data
  },

  async createDeployment(deployment) {
    const { data } = await apiClient.post('/api/deployments', deployment)
    return data
  },

  async promoteCanary(id) {
    const { data } = await apiClient.post(`/api/deployments/${id}/promote`)
    return data
  },

  async rollbackDeployment(id) {
    const { data } = await apiClient.post(`/api/deployments/${id}/rollback`)
    return data
  },

  // Monitoring
  async getMetrics(timeRange = '1h') {
    const { data } = await apiClient.get('/api/monitoring/metrics', {
      params: { timeRange }
    })
    return data
  },

  async getAlerts() {
    const { data } = await apiClient.get('/api/monitoring/alerts')
    return data
  },

  async acknowledgeAlert(id) {
    const { data } = await apiClient.post(`/api/monitoring/alerts/${id}/acknowledge`)
    return data
  },

  // Cost Analysis
  async getCostData(timeRange = 'month') {
    const { data } = await apiClient.get('/api/costs', {
      params: { timeRange }
    })
    return data
  },

  // Users
  async getUsers() {
    const { data } = await apiClient.get('/api/users')
    return data
  },

  async inviteUser(email, role) {
    const { data } = await apiClient.post('/api/users/invite', { email, role })
    return data
  },

  async updateUser(id, updates) {
    const { data } = await apiClient.patch(`/api/users/${id}`, updates)
    return data
  },

  async deleteUser(id) {
    const { data } = await apiClient.delete(`/api/users/${id}`)
    return data
  },

  // Dashboard
  async getDashboardStats() {
    try {
      // Use dev endpoint in dev mode
      const endpoint = DEV_MODE ? '/api/dashboard/stats-dev' : '/api/dashboard/stats'
      const { data } = await apiClient.get(endpoint)
      return data
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      // Return mock data in development mode when API fails
      if (DEV_MODE) {
        console.log('Using mock dashboard data')
        return {
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
            { id: 1, timestamp: "2023-08-15T10:30:00Z", message: "Cluster k8s-prod-01 scaled up", severity: "info", user: "admin" },
            { id: 2, timestamp: "2023-08-15T09:15:00Z", message: "Deployment api-gateway updated", severity: "success", user: "deployer" },
            { id: 3, timestamp: "2023-08-15T08:45:00Z", message: "High memory usage detected", severity: "warning", user: "system" },
            { id: 4, timestamp: "2023-08-14T22:10:00Z", message: "Pod auth-service-5d8f9 crashed", severity: "error", user: "system" },
            { id: 5, timestamp: "2023-08-14T20:05:00Z", message: "New cluster k8s-dev-03 created", severity: "info", user: "admin" }
          ]
        }
      }
      throw error
    }
  },

  async getRecentActivity() {
    try {
      const { data } = await apiClient.get('/api/activity')
      return data
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      // Return mock data in development mode when API fails
      if (DEV_MODE) {
        return [
          { id: 1, timestamp: "2023-08-15T10:30:00Z", message: "Cluster k8s-prod-01 scaled up", severity: "info", user: "admin" },
          { id: 2, timestamp: "2023-08-15T09:15:00Z", message: "Deployment api-gateway updated", severity: "success", user: "deployer" },
          { id: 3, timestamp: "2023-08-15T08:45:00Z", message: "High memory usage detected", severity: "warning", user: "system" },
          { id: 4, timestamp: "2023-08-14T22:10:00Z", message: "Pod auth-service-5d8f9 crashed", severity: "error", user: "system" },
          { id: 5, timestamp: "2023-08-14T20:05:00Z", message: "New cluster k8s-dev-03 created", severity: "info", user: "admin" }
        ]
      }
      throw error
    }
  }
}

// WebSocket service
class WebSocketService {
  constructor() {
    this.socket = null
    this.listeners = {}
  }

  connect() {
    if (this.socket) return
    
    const token = localStorage.getItem('token')
    if (!token) return
    
    const wsUrl = `${API_BASE_URL.replace('http', 'ws')}/ws?token=${token}`
    this.socket = new WebSocket(wsUrl)
    
    this.socket.onopen = () => {
      console.log('WebSocket connected')
    }
    
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type && this.listeners[data.type]) {
          this.listeners[data.type].forEach(callback => callback(data))
        }
      } catch (err) {
        console.error('WebSocket message error:', err)
      }
    }
    
    this.socket.onclose = () => {
      console.log('WebSocket disconnected')
      this.socket = null
      // Attempt to reconnect after 5 seconds
      setTimeout(() => this.connect(), 5000)
    }
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }
  
  subscribe(type, callback) {
    if (!this.listeners[type]) {
      this.listeners[type] = []
    }
    this.listeners[type].push(callback)
    return () => this.unsubscribe(type, callback)
  }
  
  unsubscribe(type, callback) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(cb => cb !== callback)
    }
  }
  
  send(type, data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, data }))
    }
  }
}

export const wsService = new WebSocketService()

export { apiClient, authService, apiService } 