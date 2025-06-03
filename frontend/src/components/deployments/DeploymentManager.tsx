'use client'

import { useState, useEffect } from 'react'
import { Upload, Download, Play, Square, RefreshCw, FileText, Package, AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface Deployment {
    name: string
    namespace: string
    status: 'running' | 'pending' | 'failed' | 'stopped'
    replicas: {
        desired: number
        ready: number
        available: number
    }
    image: string
    created: string
    cluster: string
}

interface DeploymentTemplate {
    name: string
    description: string
    type: 'helm' | 'manifest'
    category: string
}

export default function DeploymentManager() {
    const [deployments, setDeployments] = useState<Deployment[]>([])
    const [templates, setTemplates] = useState<DeploymentTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCluster, setSelectedCluster] = useState<string>('all')
    const [activeTab, setActiveTab] = useState<'deployments' | 'templates' | 'deploy'>('deployments')
    const [manifestContent, setManifestContent] = useState('')
    const [helmChart, setHelmChart] = useState({ name: '', version: '', repository: '' })

    useEffect(() => {
        const fetchDeployments = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return

                const response = await fetch('/api/deployments', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (response.ok) {
                    const data = await response.json()
                    setDeployments(data.deployments || [])
                }

                // Fetch deployment templates
                const templatesResponse = await fetch('/api/deployments/templates', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (templatesResponse.ok) {
                    const templatesData = await templatesResponse.json()
                    setTemplates(templatesData.templates || [])
                }

            } catch (error) {
                console.error('Error fetching deployments:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchDeployments()
    }, [selectedCluster])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'text-green-600 bg-green-100'
            case 'pending': return 'text-yellow-600 bg-yellow-100'
            case 'failed': return 'text-red-600 bg-red-100'
            case 'stopped': return 'text-gray-600 bg-gray-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'running': return <CheckCircle className="w-4 h-4" />
            case 'pending': return <Clock className="w-4 h-4" />
            case 'failed': return <AlertCircle className="w-4 h-4" />
            case 'stopped': return <Square className="w-4 h-4" />
            default: return <Clock className="w-4 h-4" />
        }
    }

    const handleDeployManifest = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token || !manifestContent.trim()) return

            const response = await fetch('/api/deployments/manifest', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    manifest: manifestContent,
                    cluster: selectedCluster !== 'all' ? selectedCluster : undefined
                })
            })

            if (response.ok) {
                alert('Manifest deployed successfully!')
                setManifestContent('')
                setActiveTab('deployments')
                // Refresh deployments
                window.location.reload()
            } else {
                const error = await response.json()
                alert(`Deployment failed: ${error.detail}`)
            }
        } catch (error) {
            console.error('Error deploying manifest:', error)
            alert('Deployment failed')
        }
    }

    const handleDeployHelm = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token || !helmChart.name.trim()) return

            const response = await fetch('/api/deployments/helm', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chart_name: helmChart.name,
                    chart_version: helmChart.version,
                    repository: helmChart.repository,
                    cluster: selectedCluster !== 'all' ? selectedCluster : undefined
                })
            })

            if (response.ok) {
                alert('Helm chart deployed successfully!')
                setHelmChart({ name: '', version: '', repository: '' })
                setActiveTab('deployments')
                // Refresh deployments
                window.location.reload()
            } else {
                const error = await response.json()
                alert(`Deployment failed: ${error.detail}`)
            }
        } catch (error) {
            console.error('Error deploying Helm chart:', error)
            alert('Deployment failed')
        }
    }

    const handleRestartDeployment = async (deploymentName: string, namespace: string) => {
        try {
            const token = localStorage.getItem('token')
            if (!token) return

            const response = await fetch(`/api/deployments/${deploymentName}/restart`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ namespace })
            })

            if (response.ok) {
                alert('Deployment restarted successfully!')
                // Refresh deployments
                window.location.reload()
            } else {
                alert('Failed to restart deployment')
            }
        } catch (error) {
            console.error('Error restarting deployment:', error)
            alert('Failed to restart deployment')
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
                <h1 className="text-2xl font-bold text-gray-900">Deployment Manager</h1>
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

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'deployments', label: 'Active Deployments', icon: Package },
                        { id: 'templates', label: 'Templates', icon: FileText },
                        { id: 'deploy', label: 'Deploy New', icon: Upload },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'deployments' && (
                <div className="space-y-4">
                    {deployments.length > 0 ? (
                        deployments.map((deployment, index) => (
                            <div key={index} className="card">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className={`p-2 rounded-full ${getStatusColor(deployment.status)}`}>
                                            {getStatusIcon(deployment.status)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{deployment.name}</h3>
                                            <p className="text-sm text-gray-600">
                                                {deployment.namespace} • {deployment.cluster}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleRestartDeployment(deployment.name, deployment.namespace)}
                                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-1"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            <span>Restart</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Replicas</p>
                                        <p className="font-medium">
                                            {deployment.replicas.ready}/{deployment.replicas.desired} ready
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Image</p>
                                        <p className="font-medium text-sm truncate">{deployment.image}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Created</p>
                                        <p className="font-medium">{deployment.created}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No deployments found</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'templates' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.length > 0 ? (
                        templates.map((template, index) => (
                            <div key={index} className="card hover:shadow-md transition-shadow cursor-pointer">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                        {template.type === 'helm' ? <Package className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                                        <p className="text-sm text-gray-600">{template.category}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700 mb-4">{template.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${template.type === 'helm'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-green-100 text-green-700'
                                        }`}>
                                        {template.type.toUpperCase()}
                                    </span>
                                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                        Use Template
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No templates available</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'deploy' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Manifest Deployment */}
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Deploy Kubernetes Manifest</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        YAML Manifest
                                    </label>
                                    <textarea
                                        value={manifestContent}
                                        onChange={(e) => setManifestContent(e.target.value)}
                                        placeholder="Paste your Kubernetes YAML manifest here..."
                                        className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                    />
                                </div>
                                <button
                                    onClick={handleDeployManifest}
                                    disabled={!manifestContent.trim()}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span>Deploy Manifest</span>
                                </button>
                            </div>
                        </div>

                        {/* Helm Deployment */}
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Deploy Helm Chart</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Chart Name
                                    </label>
                                    <input
                                        type="text"
                                        value={helmChart.name}
                                        onChange={(e) => setHelmChart({ ...helmChart, name: e.target.value })}
                                        placeholder="e.g., nginx-ingress"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Chart Version (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={helmChart.version}
                                        onChange={(e) => setHelmChart({ ...helmChart, version: e.target.value })}
                                        placeholder="e.g., 1.0.0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Repository (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={helmChart.repository}
                                        onChange={(e) => setHelmChart({ ...helmChart, repository: e.target.value })}
                                        placeholder="e.g., https://charts.bitnami.com/bitnami"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <button
                                    onClick={handleDeployHelm}
                                    disabled={!helmChart.name.trim()}
                                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    <Package className="w-4 h-4" />
                                    <span>Deploy Helm Chart</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
