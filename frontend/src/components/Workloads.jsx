import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../services/api';
import { 
  PlusIcon, 
  RefreshIcon, 
  TrashIcon, 
  PencilIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  XCircleIcon 
} from '@heroicons/react/outline';
import toast from 'react-hot-toast';

const Workloads = () => {
  const [workloads, setWorkloads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'deployment',
    namespace: 'default',
    replicas: 1,
    image: '',
    cluster_id: '',
  });

  // Filter types
  const workloadTypes = [
    { id: 'all', name: 'All Workloads' },
    { id: 'deployment', name: 'Deployments' },
    { id: 'statefulset', name: 'StatefulSets' },
    { id: 'daemonset', name: 'DaemonSets' },
    { id: 'job', name: 'Jobs' },
    { id: 'cronjob', name: 'CronJobs' },
  ];

  // Fetch workloads from the API
  const fetchWorkloads = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getWorkloads();
      setWorkloads(data || []);
    } catch (error) {
      console.error('Error fetching workloads:', error);
      toast.error('Failed to load workloads');
    } finally {
      setIsLoading(false);
    }
  };

  // Load workloads on component mount
  useEffect(() => {
    fetchWorkloads();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.deployWorkload(formData);
      toast.success(`${formData.name} deployed successfully`);
      setShowCreateModal(false);
      setFormData({
        name: '',
        type: 'deployment',
        namespace: 'default',
        replicas: 1,
        image: '',
        cluster_id: '',
      });
      fetchWorkloads();
    } catch (error) {
      console.error('Error deploying workload:', error);
      toast.error('Failed to deploy workload');
    }
  };

  // Delete workload
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this workload?')) {
      try {
        await apiService.deleteWorkload(id);
        toast.success('Workload deleted successfully');
        fetchWorkloads();
      } catch (error) {
        console.error('Error deleting workload:', error);
        toast.error('Failed to delete workload');
      }
    }
  };

  // Filter workloads by type
  const filteredWorkloads = selectedType === 'all'
    ? workloads
    : workloads.filter(w => w.type === selectedType);

  // Status badge component
  const StatusBadge = ({ status }) => {
    let bgColor, textColor, icon;
    
    switch (status?.toLowerCase()) {
      case 'running':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        icon = <CheckCircleIcon className="w-4 h-4 mr-1" />;
        break;
      case 'pending':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        icon = <ExclamationCircleIcon className="w-4 h-4 mr-1" />;
        break;
      case 'failed':
      case 'error':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        icon = <XCircleIcon className="w-4 h-4 mr-1" />;
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        icon = null;
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {icon}
        {status || 'Unknown'}
      </span>
    );
  };

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Workloads</h1>
        <div className="mt-4 sm:mt-0 sm:flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Deploy Workload
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mt-6 border-b border-gray-200">
        <div className="flex space-x-8">
          {workloadTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`py-4 px-1 text-center border-b-2 font-medium text-sm ${
                selectedType === type.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>

      {/* Workload list */}
      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center">
            <RefreshIcon className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : filteredWorkloads.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white shadow overflow-hidden sm:rounded-md px-4 py-5 text-center text-gray-500"
          >
            {selectedType === 'all'
              ? 'No workloads found. Deploy a new workload to get started.'
              : `No ${selectedType}s found. Deploy a new ${selectedType} to get started.`}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white shadow overflow-hidden sm:rounded-md"
          >
            <ul className="divide-y divide-gray-200">
              {filteredWorkloads.map((workload) => (
                <li key={workload.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-blue-600 truncate">{workload.name}</p>
                        <p className="ml-2 text-xs text-gray-500 truncate">
                          <span className="px-2 py-1 rounded-full bg-gray-100">
                            {workload.namespace}
                          </span>
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <StatusBadge status={workload.status} />
                        <button
                          onClick={() => handleDelete(workload.id)}
                          className="p-1 rounded-full text-red-600 hover:bg-red-100"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {workload.type}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          {workload.replicas} {workload.replicas === 1 ? 'replica' : 'replicas'}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>{workload.image}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>

      {/* Create workload modal */}
      {showCreateModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Deploy New Workload</h3>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="deployment">Deployment</option>
                      <option value="statefulset">StatefulSet</option>
                      <option value="daemonset">DaemonSet</option>
                      <option value="job">Job</option>
                      <option value="cronjob">CronJob</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="namespace" className="block text-sm font-medium text-gray-700">
                      Namespace
                    </label>
                    <input
                      type="text"
                      name="namespace"
                      id="namespace"
                      value={formData.namespace}
                      onChange={handleInputChange}
                      className="mt-1 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label htmlFor="replicas" className="block text-sm font-medium text-gray-700">
                      Replicas
                    </label>
                    <input
                      type="number"
                      name="replicas"
                      id="replicas"
                      min="1"
                      value={formData.replicas}
                      onChange={handleInputChange}
                      className="mt-1 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                      Container Image
                    </label>
                    <input
                      type="text"
                      name="image"
                      id="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., nginx:latest"
                      className="mt-1 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                  >
                    Deploy
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workloads; 