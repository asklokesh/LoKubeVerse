'use client'

import { useState, useEffect } from 'react'
import { Server, Activity, AlertTriangle, Users, Database, Cpu, MemoryStick, HardDrive } from 'lucide-react'

export default function ClusterOverview() {
    const [clusters, setClusters] = useState([])
    const [metrics, setMetrics] = useState({
        totalClusters: 0,
        totalNodes: 0,
        totalPods: 0,
        healthyPods: 0,
        cpu: { usage: 0, total: 100 },
        memory: { usage: 0, total: 100 },
        storage: { usage: 0, total: 100 }
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchClusterData()
    }, [])

    const fetchClusterData = async () => {
        try {
            const token = localStorage.getItem('authToken')
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }

            // Fetch clusters
            const clustersResponse = await fetch('/api/cluster/', { headers })
            if (clustersResponse.ok) {
                const clustersData = await clustersResponse.json()
                setClusters(clustersData)
            }

            // Mock metrics for demo - in real app would fetch from API
            setMetrics({
                totalClusters: 3,
                totalNodes: 12,
                totalPods: 147,
                healthyPods: 142,
                cpu: { usage: 68, total: 100 },
                memory: { usage: 54, total: 100 },
                storage: { usage: 32, total: 100 }
            })
        } catch (error) {
            console.error('Failed to fetch cluster data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="card h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Cluster Overview</h1>
                <p className="text-gray-600">Monitor and manage your Kubernetes clusters across multiple cloud providers</p>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Server className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Clusters</p>
                            <p className="text-2xl font-bold text-gray-900">{metrics?.totalClusters || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Users className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Nodes</p>
                            <p className="text-2xl font-bold text-gray-900">{metrics?.totalNodes || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Database className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Running Pods</p>
                            <p className="text-2xl font-bold text-gray-900">{metrics?.healthyPods || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <AlertTriangle className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Alerts</p>
                            <p className="text-2xl font-bold text-gray-900">3</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resource Usage */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="card">
                    <div className="flex items-center mb-4">
                        <Cpu className="h-5 w-5 text-blue-600 mr-2" />
                        <h3 className="text-lg font-medium text-gray-900">CPU Usage</h3>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Used</span>
                            <span>{metrics?.cpu.usage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${metrics?.cpu.usage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center mb-4">
                        <MemoryStick className="h-5 w-5 text-green-600 mr-2" />
                        <h3 className="text-lg font-medium text-gray-900">Memory Usage</h3>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Used</span>
                            <span>{metrics?.memory.usage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${metrics?.memory.usage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center mb-4">
                        <HardDrive className="h-5 w-5 text-purple-600 mr-2" />
                        <h3 className="text-lg font-medium text-gray-900">Storage Usage</h3>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Used</span>
                            <span>{metrics?.storage.usage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${metrics?.storage.usage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cluster List */}
            <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Clusters</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Provider
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nodes
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    CPU
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Memory
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {clusters.length > 0 ? (
                                clusters.map((cluster: any) => (
                                    <tr key={cluster.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {cluster.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {cluster.provider}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {cluster.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {cluster.node_count || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            65%
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            48%
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                        No clusters found. Create your first cluster to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
