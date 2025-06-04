import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  PlusIcon,
  ArrowPathIcon,
  FunnelIcon,
  ServerStackIcon,
  CpuChipIcon,
  CircleStackIcon,
  SignalIcon,
  TrashIcon,
  PencilIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline'
import { apiClient } from '../services/api'
import toast from 'react-hot-toast'
import { Dialog } from '@headlessui/react'

const ClusterCard = ({ cluster, onEdit, onDelete, onScale }) => {
  const getProviderIcon = () => {
    switch (cluster.provider) {
      case 'aws':
        return <span className="provider-badge provider-aws">AWS</span>
      case 'azure':
        return <span className="provider-badge provider-azure">Azure</span>
      case 'gcp':
        return <span className="provider-badge provider-gcp">GCP</span>
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (cluster.status) {
      case 'running':
        return 'status-running'
      case 'stopped':
        return 'status-stopped'
      default:
        return 'status-warning'
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`card-ios border-l-4 ${
        cluster.provider === 'aws' ? 'border-aws' :
        cluster.provider === 'azure' ? 'border-azure' :
        'border-gcp'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {getProviderIcon()}
            <span className="text-xs text-ios-gray-500">{cluster.region}</span>
          </div>
          <h3 className="text-lg font-semibold text-ios-gray-900">{cluster.name}</h3>
          <p className="text-sm text-ios-gray-600">Created {new Date(cluster.created_at).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`status-dot ${getStatusColor()}`}></div>
          <span className="text-sm font-medium capitalize">{cluster.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="metric-card">
          <ServerStackIcon className="w-5 h-5 text-ios-gray-500 mb-1" />
          <p className="text-lg font-semibold">{cluster.node_count}</p>
          <p className="text-xs text-ios-gray-500">Nodes</p>
        </div>
        <div className="metric-card">
          <CircleStackIcon className="w-5 h-5 text-ios-gray-500 mb-1" />
          <p className="text-lg font-semibold">{cluster.pod_count || 0}</p>
          <p className="text-xs text-ios-gray-500">Pods</p>
        </div>
        <div className="metric-card">
          <CpuChipIcon className="w-5 h-5 text-ios-gray-500 mb-1" />
          <p className="text-lg font-semibold">{cluster.cpu_usage || 0}%</p>
          <p className="text-xs text-ios-gray-500">CPU</p>
        </div>
        <div className="metric-card">
          <SignalIcon className="w-5 h-5 text-ios-gray-500 mb-1" />
          <p className="text-lg font-semibold">{cluster.memory_usage || 0}%</p>
          <p className="text-xs text-ios-gray-500">Memory</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onScale(cluster)}
          className="btn-ios-secondary flex-1 text-sm py-2 flex items-center justify-center gap-1"
        >
          <ArrowsPointingOutIcon className="w-4 h-4" />
          Scale
        </button>
        <button
          onClick={() => onEdit(cluster)}
          className="btn-ios-secondary flex-1 text-sm py-2 flex items-center justify-center gap-1"
        >
          <PencilIcon className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={() => onDelete(cluster)}
          className="btn-ios-danger flex-1 text-sm py-2 flex items-center justify-center gap-1"
        >
          <TrashIcon className="w-4 h-4" />
          Delete
        </button>
      </div>
    </motion.div>
  )
}

const CreateClusterModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    provider: 'aws',
    region: 'us-east-1',
    node_count: 3,
    instance_type: 't3.medium'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="card-ios w-full max-w-md max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-xl font-bold text-ios-gray-900 mb-4">
            Create New Cluster
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-ios-gray-700">Cluster Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-ios mt-1"
                placeholder="my-cluster"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-ios-gray-700">Cloud Provider</label>
              <select
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                className="input-ios mt-1"
              >
                <option value="aws">Amazon Web Services (EKS)</option>
                <option value="azure">Microsoft Azure (AKS)</option>
                <option value="gcp">Google Cloud Platform (GKE)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-ios-gray-700">Region</label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="input-ios mt-1"
              >
                <option value="us-east-1">US East (N. Virginia)</option>
                <option value="us-west-2">US West (Oregon)</option>
                <option value="eu-west-1">Europe (Ireland)</option>
                <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-ios-gray-700">Number of Nodes</label>
              <input
                type="number"
                value={formData.node_count}
                onChange={(e) => setFormData({ ...formData, node_count: parseInt(e.target.value) })}
                className="input-ios mt-1"
                min="1"
                max="100"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-ios-gray-700">Instance Type</label>
              <select
                value={formData.instance_type}
                onChange={(e) => setFormData({ ...formData, instance_type: e.target.value })}
                className="input-ios mt-1"
              >
                <option value="t3.medium">t3.medium (2 vCPU, 4 GB RAM)</option>
                <option value="t3.large">t3.large (2 vCPU, 8 GB RAM)</option>
                <option value="m5.large">m5.large (2 vCPU, 8 GB RAM)</option>
                <option value="m5.xlarge">m5.xlarge (4 vCPU, 16 GB RAM)</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-ios-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-ios-primary flex-1"
              >
                Create Cluster
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

const Clusters = () => {
  const [clusters, setClusters] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filter, setFilter] = useState('all')

  const fetchClusters = async () => {
    try {
      const data = await apiClient.getClusters()
      setClusters(data)
    } catch (error) {
      toast.error('Failed to fetch clusters')
      console.error('Error fetching clusters:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchClusters()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchClusters()
  }

  const handleCreateCluster = async (formData) => {
    try {
      const newCluster = await apiClient.createCluster(formData)
      setClusters([...clusters, newCluster])
      setShowCreateModal(false)
      toast.success('Cluster created successfully!')
    } catch (error) {
      toast.error('Failed to create cluster')
      console.error('Error creating cluster:', error)
    }
  }

  const handleEditCluster = (cluster) => {
    // Implement edit functionality
    toast('Edit functionality coming soon!')
  }

  const handleDeleteCluster = async (cluster) => {
    if (window.confirm(`Are you sure you want to delete cluster "${cluster.name}"?`)) {
      try {
        await apiClient.deleteCluster(cluster.id)
        setClusters(clusters.filter(c => c.id !== cluster.id))
        toast.success('Cluster deleted successfully!')
      } catch (error) {
        toast.error('Failed to delete cluster')
        console.error('Error deleting cluster:', error)
      }
    }
  }

  const handleScaleCluster = (cluster) => {
    // Implement scale functionality
    toast('Scale functionality coming soon!')
  }

  const filteredClusters = filter === 'all' 
    ? clusters 
    : clusters.filter(c => c.provider === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-ios-blue border-t-transparent mx-auto mb-4"></div>
          <p className="text-ios-gray-500">Loading clusters...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-ios-gray-900">Clusters</h1>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-ios py-2 px-3"
          >
            <option value="all">All Providers</option>
            <option value="aws">AWS</option>
            <option value="azure">Azure</option>
            <option value="gcp">GCP</option>
          </select>
          <button
            onClick={handleRefresh}
            className={`btn-ios-secondary p-2 ${refreshing ? 'opacity-50' : ''}`}
            disabled={refreshing}
            aria-label="refresh"
          >
            <ArrowPathIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-ios-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Create Cluster
          </button>
        </div>
      </div>

      {/* Clusters Grid */}
      {filteredClusters.length === 0 ? (
        <div className="card-ios text-center py-12">
          <ServerStackIcon className="w-12 h-12 text-ios-gray-400 mx-auto mb-4" />
          <p className="text-ios-gray-600 mb-4">No clusters found</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-ios-primary mx-auto"
          >
            Create your first cluster
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClusters.map(cluster => (
            <ClusterCard
              key={cluster.id}
              cluster={cluster}
              onEdit={handleEditCluster}
              onDelete={handleDeleteCluster}
              onScale={handleScaleCluster}
            />
          ))}
        </div>
      )}

      {/* Create Cluster Modal */}
      <CreateClusterModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCluster}
      />
    </div>
  )
}

export default Clusters 