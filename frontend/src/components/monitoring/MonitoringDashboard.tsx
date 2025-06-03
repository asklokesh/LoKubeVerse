'use client'

import { useState, useEffect } from 'react'
import { Activity, Server, AlertTriangle, TrendingUp, Clock, Database } from 'lucide-react'

interface ClusterHealth {
    healthy: number
    unhealthy: number
    warning: number
}

interface NodeMetrics {
    total: number
    ready: number
    notReady: number
    cpuUsage: number
    memoryUsage: number
}

interface PodMetrics {
    running: number
    pending: number
    failed: number
    succeeded: number
}

interface LogEntry {
    timestamp: string
    level: 'info' | 'warning' | 'error'
    message: string
    source: string
}

export default function MonitoringDashboard() {
    const [clusterHealth, setClusterHealth] = useState<ClusterHealth>({ healthy: 0, unhealthy: 0, warning: 0 })
    const [nodeMetrics, setNodeMetrics] = useState<NodeMetrics>({
        total: 0, ready: 0, notReady: 0, cpuUsage: 0, memoryUsage: 0
    })
    const [podMetrics, setPodMetrics] = useState<PodMetrics>({
        running: 0, pending: 0, failed: 0, succeeded: 0
    })
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCluster, setSelectedCluster] = useState<string>('all')

    useEffect(() => {
        const fetchMonitoringData = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return

                // Fetch cluster health
                const healthResponse = await fetch('/api/monitoring/health', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (healthResponse.ok) {
                    const healthData = await healthResponse.json()
                    setClusterHealth(healthData)
                }

                // Fetch node metrics
                const nodesResponse = await fetch('/api/monitoring/nodes', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (nodesResponse.ok) {
                    const nodesData = await nodesResponse.json()
                    setNodeMetrics(nodesData)
                }

                // Fetch pod metrics
                const podsResponse = await fetch('/api/monitoring/pods', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (podsResponse.ok) {
                    const podsData = await podsResponse.json()
                    setPodMetrics(podsData)
                }

                // Fetch logs
                const logsResponse = await fetch('/api/monitoring/logs', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (logsResponse.ok) {
                    const logsData = await logsResponse.json()
                    setLogs(logsData.logs || [])
                }

            } catch (error) {
                console.error('Error fetching monitoring data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchMonitoringData()
        const interval = setInterval(fetchMonitoringData, 30000) // Refresh every 30 seconds

        return () => clearInterval(interval)
    }, [selectedCluster])

    const getHealthStatusColor = (status: 'healthy' | 'warning' | 'unhealthy') => {
        switch (status) {
            case 'healthy': return 'text-green-600 bg-green-100'
            case 'warning': return 'text-yellow-600 bg-yellow-100'
            case 'unhealthy': return 'text-red-600 bg-red-100'
        }
    }

    const getLogLevelColor = (level: string) => {
        switch (level) {
            case 'info': return 'text-blue-600'
            case 'warning': return 'text-yellow-600'
            case 'error': return 'text-red-600'
            default: return 'text-gray-600'
        }
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Monitoring Dashboard</h1>
                <select
                    value={selectedCluster}
                    onChange={(e) => setSelectedCluster(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Clusters</option>
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                </select>
            </div>

            {/* Cluster Health Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Healthy Clusters</p>
                            <p className="text-2xl font-bold text-green-600">{clusterHealth.healthy}</p>
                        </div>
                        <div className={`p-3 rounded-full ${getHealthStatusColor('healthy')}`}>
                            <Server className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Warning Clusters</p>
                            <p className="text-2xl font-bold text-yellow-600">{clusterHealth.warning}</p>
                        </div>
                        <div className={`p-3 rounded-full ${getHealthStatusColor('warning')}`}>
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Unhealthy Clusters</p>
                            <p className="text-2xl font-bold text-red-600">{clusterHealth.unhealthy}</p>
                        </div>
                        <div className={`p-3 rounded-full ${getHealthStatusColor('unhealthy')}`}>
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Resource Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Node Metrics</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total Nodes</span>
                            <span className="font-medium">{nodeMetrics.total}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Ready</span>
                            <span className="font-medium text-green-600">{nodeMetrics.ready}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Not Ready</span>
                            <span className="font-medium text-red-600">{nodeMetrics.notReady}</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">CPU Usage</span>
                                <span className="font-medium">{nodeMetrics.cpuUsage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${nodeMetrics.cpuUsage}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Memory Usage</span>
                                <span className="font-medium">{nodeMetrics.memoryUsage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${nodeMetrics.memoryUsage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pod Metrics</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Running</span>
                            <span className="font-medium text-green-600">{podMetrics.running}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Pending</span>
                            <span className="font-medium text-yellow-600">{podMetrics.pending}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Failed</span>
                            <span className="font-medium text-red-600">{podMetrics.failed}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Succeeded</span>
                            <span className="font-medium text-blue-600">{podMetrics.succeeded}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Logs */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Logs</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>Last updated: {new Date().toLocaleTimeString()}</span>
                    </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {logs.length > 0 ? (
                        logs.map((log, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex-shrink-0">
                                    <span className={`text-xs font-medium ${getLogLevelColor(log.level)}`}>
                                        {log.level.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900">{log.message}</p>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <span className="text-xs text-gray-500">{log.source}</span>
                                        <span className="text-xs text-gray-400">•</span>
                                        <span className="text-xs text-gray-500">{log.timestamp}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No logs available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}