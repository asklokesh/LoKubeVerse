import axios from 'axios'
import toast from 'react-hot-toast'

// Configure axios defaults
axios.defaults.baseURL = '/'
axios.defaults.headers.common['Content-Type'] = 'application/json'

// Request interceptor to add auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authService.logout()
      window.location.href = '/login'
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    }
    return Promise.reject(error)
  }
)

// Auth Service
export const authService = {
  async login(username, password) {
    const { data } = await axios.post('/api/auth/login', { username, password })
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  isAuthenticated() {
    return !!localStorage.getItem('token')
  },

  getUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  async register(email, password, name) {
    const { data } = await axios.post('/api/auth/register', { email, password, name })
    return data
  }
}

// API Client
export const apiClient = {
  // Clusters
  async getClusters() {
    const { data } = await axios.get('/api/clusters')
    return data
  },

  async getCluster(id) {
    const { data } = await axios.get(`/api/clusters/${id}`)
    return data
  },

  async createCluster(cluster) {
    const { data } = await axios.post('/api/clusters', cluster)
    return data
  },

  async updateCluster(id, updates) {
    const { data } = await axios.patch(`/api/clusters/${id}`, updates)
    return data
  },

  async deleteCluster(id) {
    const { data } = await axios.delete(`/api/clusters/${id}`)
    return data
  },

  // Workloads
  async getWorkloads(clusterId = null) {
    const params = clusterId ? { cluster_id: clusterId } : {}
    const { data } = await axios.get('/api/workloads', { params })
    return data
  },

  async getWorkload(id) {
    const { data } = await axios.get(`/api/workloads/${id}`)
    return data
  },

  async deployWorkload(workload) {
    const { data } = await axios.post('/api/workloads', workload)
    return data
  },

  async updateWorkload(id, updates) {
    const { data } = await axios.patch(`/api/workloads/${id}`, updates)
    return data
  },

  async deleteWorkload(id) {
    const { data } = await axios.delete(`/api/workloads/${id}`)
    return data
  },

  // Deployments
  async getDeployments() {
    const { data } = await axios.get('/api/deployments')
    return data
  },

  async createDeployment(deployment) {
    const { data } = await axios.post('/api/deployments', deployment)
    return data
  },

  async promoteCanary(id) {
    const { data } = await axios.post(`/api/deployments/${id}/promote`)
    return data
  },

  async rollbackDeployment(id) {
    const { data } = await axios.post(`/api/deployments/${id}/rollback`)
    return data
  },

  // Monitoring
  async getMetrics(timeRange = '1h') {
    const { data } = await axios.get('/api/monitoring/metrics', {
      params: { timeRange }
    })
    return data
  },

  async getAlerts() {
    const { data } = await axios.get('/api/monitoring/alerts')
    return data
  },

  async acknowledgeAlert(id) {
    const { data } = await axios.post(`/api/monitoring/alerts/${id}/acknowledge`)
    return data
  },

  // Cost Analysis
  async getCostData(timeRange = 'month') {
    const { data } = await axios.get('/api/costs', {
      params: { timeRange }
    })
    return data
  },

  // Users
  async getUsers() {
    const { data } = await axios.get('/api/users')
    return data
  },

  async inviteUser(email, role) {
    const { data } = await axios.post('/api/users/invite', { email, role })
    return data
  },

  async updateUser(id, updates) {
    const { data } = await axios.patch(`/api/users/${id}`, updates)
    return data
  },

  async deleteUser(id) {
    const { data } = await axios.delete(`/api/users/${id}`)
    return data
  },

  // Dashboard
  async getDashboardStats() {
    const { data } = await axios.get('/api/dashboard/stats')
    return data
  },

  async getRecentActivity() {
    const { data } = await axios.get('/api/dashboard/activity')
    return data
  }
}

// WebSocket Service
export class WebSocketService {
  constructor() {
    this.socket = null
    this.listeners = new Map()
  }

  connect() {
    const token = localStorage.getItem('token')
    if (!token) return

    this.socket = new WebSocket(`ws://localhost:8000/ws?token=${token}`)

    this.socket.onopen = () => {
      console.log('WebSocket connected')
      toast.success('Real-time connection established')
    }

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.notifyListeners(data.type, data)
    }

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error)
      toast.error('Real-time connection error')
    }

    this.socket.onclose = () => {
      console.log('WebSocket disconnected')
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

  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType).add(callback)

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType)
      if (callbacks) {
        callbacks.delete(callback)
      }
    }
  }

  notifyListeners(eventType, data) {
    const callbacks = this.listeners.get(eventType)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }

  send(eventType, data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: eventType, ...data }))
    }
  }
}

export const wsService = new WebSocketService() 