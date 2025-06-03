'use client';

import React, { useState } from 'react';
import { MultiClusterView } from '@/components/multicluster/MultiClusterView';
import { CostDashboard } from '@/components/cost/CostDashboard';
import { AdvancedMonitoring } from '@/components/monitoring/AdvancedMonitoring';
import Sidebar from '@/components/layout/Sidebar';
import { useClusters } from '@/hooks/useClusters';
import { LoadingState } from '@/components/common/LoadingState';
import { PageWrapper } from '@/components/wrappers/PageWrapper';

// Define your type/interface, or import it
interface Cluster {
  id: string;
  name: string;
  provider: string;
  region: string;
  status: string;
  // Add other relevant cluster properties if available
}

export default function ClusterPageWrapper() {
  return (
    <PageWrapper title="Failed to load clusters">
      <ClustersPage />
    </PageWrapper>
  );
}

function ClustersPage() {
  const {
    clusters,
    loading,
    error,
    // _createCluster, // Prefix with underscore if unused but kept for future
    // _deleteCluster, // Prefix with underscore if unused but kept for future
  } = useClusters();

  // If createCluster and deleteCluster are definitely not used in this component,
  // you can remove them from the destructuring above for a cleaner approach:
  // const { clusters, loading, error } = useClusters();

  const [isModalOpen, setIsModalOpen] = useState(false); // Kept, assuming modal is a future feature

  // TODO: Implement modal functionality using 'isModalOpen' and 'setIsModalOpen'
  // TODO: Implement cluster creation using 'createCluster' if re-enabled
  // TODO: Implement cluster deletion using 'deleteCluster' if re-enabled

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <LoadingState type="clusters" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading clusters</h3>
                  <div className="mt-2 text-sm text-red-700">
                    {/* Ensure error is a string or a ReactNode. If it's an object, access its message property */}
                    <p>{typeof error === 'string' ? error : (error as Error)?.message || 'An unknown error occurred'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Helper for dynamic status badge (optional enhancement)
  const getStatusClasses = (status: string): string => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'running' || lowerStatus === 'active' || lowerStatus === 'available') { // Added 'available' as an example
      return 'bg-green-100 text-green-800';
    }
    if (lowerStatus === 'pending' || lowerStatus === 'provisioning') { // Added 'provisioning'
      return 'bg-yellow-100 text-yellow-800';
    }
    if (lowerStatus === 'error' || lowerStatus === 'failed' || lowerStatus === 'deleting') { // Added 'deleting'
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800'; // Default for unknown or other statuses
  };


  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto"> {/* Added overflow-y-auto for potentially long content */}
        <div className="max-w-7xl mx-auto">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-3xl font-bold text-gray-900">Clusters</h1>
              <p className="mt-2 text-sm text-gray-700">
                A list of all Kubernetes clusters across your cloud providers.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
              >
                Add Cluster
              </button>
            </div>
          </div>
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  {clusters && clusters.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                            Name
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Provider
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Region
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Status
                          </th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {clusters.map((cluster: Cluster) => ( // Using the defined Cluster interface
                          <tr key={cluster.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {cluster.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{cluster.provider}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{cluster.region}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5 ${getStatusClasses(cluster.status)}`}> {/* Adjusted padding slightly for typical badge look */}
                                {cluster.status}
                              </span>
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              {/* TODO: Implement Manage action, possibly link to a detail page or open a menu */}
                              <button className="text-primary-600 hover:text-primary-900">Manage</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-lg text-gray-600">No clusters found.</p>
                      {/* Optionally, add a call to action here if appropriate, e.g., the "Add Cluster" button or a message */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* These components are kept as is, assuming they are part of the page's functionality */}
          <div className="mt-8"> {/* Added some spacing for the components below the table */}
            <MultiClusterView />
          </div>
          <div className="mt-8">
            <CostDashboard />
          </div>
          <div className="mt-8">
            <AdvancedMonitoring />
          </div>

        </div>
      </main>

      {/* Example of where a modal might be rendered, if isModalOpen is true */}
      {/* {isModalOpen && (
        <YourClusterModal onClose={() => setIsModalOpen(false)} onCreate={createCluster} />
      )} */}
    </div>
  );
}