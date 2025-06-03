'use client'

import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import ClusterOverview from '../clusters/ClusterOverview'
import MonitoringDashboard from '../monitoring/MonitoringDashboard'
import DeploymentManager from '../deployments/DeploymentManager'
import { Activity, Server, Package, Settings } from 'lucide-react'

interface DashboardProps {
    onLogout: () => void
}

type ActiveView = 'overview' | 'clusters' | 'monitoring' | 'deployments' | 'settings'

export default function Dashboard({ onLogout }: DashboardProps) {
    const [activeView, setActiveView] = useState<ActiveView>('overview')
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const navigationItems = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'clusters', label: 'Clusters', icon: Server },
        { id: 'monitoring', label: 'Monitoring', icon: Activity },
        { id: 'deployments', label: 'Deployments', icon: Package },
        { id: 'settings', label: 'Settings', icon: Settings },
    ]

    const renderContent = () => {
        switch (activeView) {
            case 'overview':
                return <ClusterOverview />
            case 'clusters':
                return <ClusterOverview />
            case 'monitoring':
                return <MonitoringDashboard />
            case 'deployments':
                return <DeploymentManager />
            case 'settings':
                return (
                    <div className="p-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
                        <div className="card">
                            <p className="text-gray-600">Settings panel coming soon...</p>
                        </div>
                    </div>
                )
            default:
                return <ClusterOverview />
        }
    }

    return (
        <div className="h-screen flex bg-gray-50">
            <Sidebar
                isOpen={sidebarOpen}
                activeView={activeView}
                navigationItems={navigationItems}
                onViewChange={setActiveView}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
            />

            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
                <Header
                    onLogout={onLogout}
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                />

                <main className="flex-1 overflow-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    )
}
