import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient, authService } from '../api'
import axios from 'axios'

vi.mock('axios')

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Auth Service', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        data: {
          access_token: 'test-token',
          token_type: 'bearer',
          user: { id: 1, email: 'test@example.com' }
        }
      }
      axios.post.mockResolvedValueOnce(mockResponse)

      const result = await authService.login('test@example.com', 'password')
      
      expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
        username: 'test@example.com',
        password: 'password'
      })
      expect(localStorage.getItem('token')).toBe('test-token')
      expect(result).toEqual(mockResponse.data)
    })

    it('should logout and clear token', () => {
      localStorage.setItem('token', 'test-token')
      authService.logout()
      expect(localStorage.getItem('token')).toBeNull()
    })

    it('should check if user is authenticated', () => {
      expect(authService.isAuthenticated()).toBe(false)
      localStorage.setItem('token', 'test-token')
      expect(authService.isAuthenticated()).toBe(true)
    })
  })

  describe('Cluster API', () => {
    it('should fetch clusters', async () => {
      const mockClusters = [
        { id: 1, name: 'prod-cluster', provider: 'aws' },
        { id: 2, name: 'dev-cluster', provider: 'gcp' }
      ]
      axios.get.mockResolvedValueOnce({ data: mockClusters })

      const result = await apiClient.getClusters()
      
      expect(axios.get).toHaveBeenCalledWith('/api/clusters')
      expect(result).toEqual(mockClusters)
    })

    it('should create a new cluster', async () => {
      const newCluster = {
        name: 'test-cluster',
        provider: 'aws',
        region: 'us-east-1',
        nodeCount: 3
      }
      const mockResponse = { data: { id: 1, ...newCluster } }
      axios.post.mockResolvedValueOnce(mockResponse)

      const result = await apiClient.createCluster(newCluster)
      
      expect(axios.post).toHaveBeenCalledWith('/api/clusters', newCluster)
      expect(result).toEqual(mockResponse.data)
    })

    it('should update cluster', async () => {
      const clusterId = 1
      const updates = { nodeCount: 5 }
      const mockResponse = { data: { id: clusterId, ...updates } }
      axios.patch.mockResolvedValueOnce(mockResponse)

      const result = await apiClient.updateCluster(clusterId, updates)
      
      expect(axios.patch).toHaveBeenCalledWith(`/api/clusters/${clusterId}`, updates)
      expect(result).toEqual(mockResponse.data)
    })

    it('should delete cluster', async () => {
      const clusterId = 1
      axios.delete.mockResolvedValueOnce({ data: { success: true } })

      await apiClient.deleteCluster(clusterId)
      
      expect(axios.delete).toHaveBeenCalledWith(`/api/clusters/${clusterId}`)
    })
  })

  describe('Workloads API', () => {
    it('should fetch workloads', async () => {
      const mockWorkloads = [
        { id: 1, name: 'web-app', type: 'deployment' }
      ]
      axios.get.mockResolvedValueOnce({ data: mockWorkloads })

      const result = await apiClient.getWorkloads()
      
      expect(axios.get).toHaveBeenCalledWith('/api/workloads')
      expect(result).toEqual(mockWorkloads)
    })

    it('should deploy workload', async () => {
      const workload = {
        name: 'test-app',
        type: 'deployment',
        image: 'nginx:latest',
        replicas: 3
      }
      const mockResponse = { data: { id: 1, ...workload } }
      axios.post.mockResolvedValueOnce(mockResponse)

      const result = await apiClient.deployWorkload(workload)
      
      expect(axios.post).toHaveBeenCalledWith('/api/workloads', workload)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('Monitoring API', () => {
    it('should fetch metrics', async () => {
      const mockMetrics = {
        cpu: 45.2,
        memory: 62.8,
        network: 125.5
      }
      axios.get.mockResolvedValueOnce({ data: mockMetrics })

      const result = await apiClient.getMetrics('1h')
      
      expect(axios.get).toHaveBeenCalledWith('/api/monitoring/metrics', {
        params: { timeRange: '1h' }
      })
      expect(result).toEqual(mockMetrics)
    })

    it('should fetch alerts', async () => {
      const mockAlerts = [
        { id: 1, severity: 'warning', message: 'High CPU usage' }
      ]
      axios.get.mockResolvedValueOnce({ data: mockAlerts })

      const result = await apiClient.getAlerts()
      
      expect(axios.get).toHaveBeenCalledWith('/api/monitoring/alerts')
      expect(result).toEqual(mockAlerts)
    })
  })

  describe('Request Interceptors', () => {
    it('should add auth token to requests', async () => {
      localStorage.setItem('token', 'test-token')
      axios.get.mockResolvedValueOnce({ data: {} })

      await apiClient.getClusters()
      
      expect(axios.defaults.headers.common['Authorization']).toBe('Bearer test-token')
    })

    it('should handle 401 errors by logging out', async () => {
      const error = {
        response: { status: 401 }
      }
      axios.get.mockRejectedValueOnce(error)
      const logoutSpy = vi.spyOn(authService, 'logout')

      try {
        await apiClient.getClusters()
      } catch (err) {
        expect(logoutSpy).toHaveBeenCalled()
      }
    })
  })
}) 