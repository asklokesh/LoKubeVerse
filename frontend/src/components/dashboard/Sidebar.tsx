'use client'

import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'

interface SidebarProps {
    isOpen: boolean
    activeView: string
    navigationItems: Array<{
        id: string
        label: string
        icon: React.ComponentType<{ className?: string }>
    }>
    onViewChange: (view: string) => void
    onToggle: () => void
}

export default function Sidebar({
    isOpen,
    activeView,
    navigationItems,
    onViewChange,
    onToggle
}: SidebarProps) {
    return (
        <div className={clsx(
            'fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-all duration-300',
            isOpen ? 'w-64' : 'w-16'
        )}>
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        {isOpen && (
                            <h1 className="text-xl font-bold text-gray-900">K8s Dashboard</h1>
                        )}
                        <button
                            onClick={onToggle}
                            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            {isOpen ? (
                                <ChevronLeft className="h-5 w-5" />
                            ) : (
                                <ChevronRight className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {navigationItems.map((item) => {
                        const Icon = item.icon
                        const isActive = activeView === item.id

                        return (
                            <button
                                key={item.id}
                                onClick={() => onViewChange(item.id)}
                                className={clsx(
                                    'w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                )}
                                title={!isOpen ? item.label : undefined}
                            >
                                <Icon className="h-5 w-5" />
                                {isOpen && <span>{item.label}</span>}
                            </button>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200">
                    {isOpen && (
                        <div className="text-xs text-gray-500">
                            Multi-Cloud K8s Management
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
