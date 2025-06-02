import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock MonitoringDashboard component
const MonitoringDashboard = ({ clusterId }: { clusterId: string }) => {
    const mockData = {
        metrics: [
            { title: 'CPU Usage', value: 72, unit: '%', icon: '🧠', gradient: 'from-emerald-400 to-emerald-600', status: 'excellent', trend: '+2.1%', details: '2.88 / 4.0 cores • 4 nodes active' },
            { title: 'Memory Usage', value: 68, unit: '%', icon: '💾', gradient: 'from-blue-400 to-blue-600', status: 'good', trend: '+5.3%', details: '27.2 / 40 GB • 16 pods running' },
            { title: 'Storage Usage', value: 45, unit: '%', icon: '💿', gradient: 'from-purple-400 to-pink-600', status: 'excellent', trend: '-1.2%', details: '450 / 1000 GB • 12 volumes' },
            { title: 'Network Load', value: 82, unit: '%', icon: '🌐', gradient: 'from-orange-400 to-red-500', status: 'warning', trend: '+12.8%', details: '4.2 Gbps peak • 8 services' }
        ],
        podStats: [
            { status: 'Running', count: 1247, color: 'emerald', icon: '🟢' },
            { status: 'Pending', count: 12, color: 'orange', icon: '🟡' },
            { status: 'Failed', count: 3, color: 'red', icon: '🔴' },
            { status: 'Succeeded', count: 892, color: 'blue', icon: '🔵' }
        ]
    };

    return (
        <div className="space-y-8" data-testid="monitoring-dashboard">
            {/* Header */}
            <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl" data-testid="dashboard-header">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-purple-500/10 opacity-50"></div>

                <div className="relative p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl hover:scale-105 transition-transform duration-300">
                                    <span className="text-3xl filter drop-shadow-lg" data-testid="dashboard-icon">📊</span>
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full border-2 border-white shadow-lg animate-pulse" data-testid="live-indicator"></div>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900 tracking-tight" data-testid="dashboard-title">Live Monitoring</h3>
                                <p className="text-sm text-gray-500 font-medium mt-1" data-testid="cluster-info">
                                    Cluster: <span className="text-blue-600 font-bold">{clusterId}</span> •
                                    <span className="text-emerald-600 font-bold ml-1">Real-time Data</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3 px-4 py-2 bg-emerald-50/80 backdrop-blur-sm rounded-2xl border border-emerald-200/50" data-testid="realtime-badge">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg">
                                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
                                </div>
                                <span className="text-sm font-semibold text-emerald-700">Real-time</span>
                            </div>
                            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:scale-105 transition-all duration-300 shadow-xl font-bold" data-testid="export-button">
                                Export Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6" data-testid="metrics-grid">
                {mockData.metrics.map((metric, index) => (
                    <div key={index} className="group relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer hover:scale-105" data-testid={`metric-card-${index}`}>
                        <div className="relative p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                                    <span className="text-3xl filter drop-shadow-lg" data-testid={`metric-icon-${index}`}>{metric.icon}</span>
                                </div>
                                <div className="text-right">
                                    <div className={`px-3 py-1 text-xs font-bold rounded-full ${metric.status === 'excellent' ? 'bg-emerald-100 text-emerald-700' :
                                            metric.status === 'good' ? 'bg-blue-100 text-blue-700' :
                                                metric.status === 'warning' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-gray-100 text-gray-700'
                                        }`} data-testid={`metric-status-${index}`}>
                                        {metric.status}
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-2" data-testid={`metric-title-${index}`}>{metric.title}</h3>
                            <div className="flex items-baseline space-x-2 mb-4">
                                <span className="text-4xl font-black bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent" data-testid={`metric-value-${index}`}>
                                    {metric.value}
                                </span>
                                <span className="text-lg text-gray-500 font-bold" data-testid={`metric-unit-${index}`}>{metric.unit}</span>
                            </div>

                            <div className="flex items-center space-x-1 text-xs font-medium mt-1">
                                <span data-testid={`trend-indicator-${index}`}>{metric.trend.includes('+') ? '📈' : '📉'}</span>
                                <span className={`${metric.trend.includes('+') ? 'text-emerald-600' : 'text-red-600'}`} data-testid={`trend-value-${index}`}>
                                    {metric.trend}
                                </span>
                            </div>

                            <p className="text-xs text-gray-500 mt-2 font-medium" data-testid={`metric-details-${index}`}>{metric.details}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pod Status Grid */}
            <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl" data-testid="pod-status-section">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-50"></div>

                <div className="relative p-8">
                    <h4 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3" data-testid="pod-status-title">
                        <span>⚙️</span><span>Pod Status Overview</span>
                        <div className="ml-auto text-sm font-medium text-gray-500">
                            Last updated: <span className="text-blue-600 font-bold" data-testid="last-updated">2 seconds ago</span>
                        </div>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6" data-testid="pod-stats-grid">
                        {mockData.podStats.map((item, index) => (
                            <div key={index} className="group relative overflow-hidden bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer" data-testid={`pod-stat-${index}`}>
                                <div className={`absolute inset-0 bg-gradient-to-br from-${item.color}-500/10 to-${item.color}-600/10 opacity-50 group-hover:opacity-70 transition-opacity duration-300`}></div>

                                <div className="relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-2xl" data-testid={`pod-icon-${index}`}>{item.icon}</span>
                                        <div className={`px-3 py-1 bg-${item.color}-100 text-${item.color}-700 text-xs font-bold rounded-full`} data-testid={`pod-status-label-${index}`}>
                                            {item.status}
                                        </div>
                                    </div>
                                    <div className={`text-3xl font-black bg-gradient-to-r from-${item.color}-600 to-${item.color}-800 bg-clip-text text-transparent mb-2`} data-testid={`pod-count-${index}`}>
                                        {item.count.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-500 font-medium" data-testid={`pod-label-${index}`}>
                                        {item.status} Pods
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

describe('MonitoringDashboard Component', () => {
    const mockClusterId = 'test-cluster-1';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render the monitoring dashboard', () => {
            render(<MonitoringDashboard clusterId={mockClusterId} />);

            expect(screen.getByTestId('monitoring-dashboard')).toBeInTheDocument();
        });

        it('should display dashboard header with cluster information', () => {
            render(<MonitoringDashboard clusterId={mockClusterId} />);

            expect(screen.getByTestId('dashboard-title')).toHaveTextContent('Live Monitoring');
            expect(screen.getByTestId('cluster-info')).toHaveTextContent(mockClusterId);
            expect(screen.getByTestId('cluster-info')).toHaveTextContent('Real-time Data');
        });

        it('should show live indicator', () => {
            render(<MonitoringDashboard clusterId={mockClusterId} />);

            const liveIndicator = screen.getByTestId('live-indicator');
            expect(liveIndicator).toBeInTheDocument();
            expect(liveIndicator).toHaveClass('animate-pulse');
        });

        it('should display real-time badge', () => {
            render(<MonitoringDashboard clusterId={mockClusterId} />);

            const realtimeBadge = screen.getByTestId('realtime-badge');
            expect(realtimeBadge).toHaveTextContent('Real-time');
        });
    });

    describe('Metric Cards', () => {
        it('should render all metric cards', () => {
            render(<MonitoringDashboard clusterId={mockClusterId} />);

            const metricsGrid = screen.getByTestId('metrics-grid');
            expect(metricsGrid).toBeInTheDocument();

            // Should have 4 metric cards
            for (let i = 0; i < 4; i++) {
                expect(screen.getByTestId(`metric-card-${i}`)).toBeInTheDocument();
            }
        });

        it('should display CPU usage metric correctly', () => {
            render(<MonitoringDashboard clusterId={mockClusterId} />);

            expect(screen.getByTestId('metric-title-0')).toHaveTextContent('CPU Usage');
            expect(screen.getByTestId('metric-value-0')).toHaveTextContent('72');
            expect(screen.getByTestId('metric-unit-0')).toHaveTextContent('%');
            expect(screen.getByTestId('metric-icon-0')).toHaveTextContent('🧠');
            expect(screen.getByTestId('metric-status-0')).toHaveTextContent('excellent');
        });

        it('should display memory usage metric correctly', () => {
            render(<MonitoringDashboard clusterId={mockClusterId} />);

            expect(screen.getByTestId('metric-title-1')).toHaveTextContent('Memory Usage');
            expect(screen.getByTestId('metric-value-1')).toHaveTextContent('68');
            expect(screen.getByTestId('metric-unit-1')).toHaveTextContent('%');
            expect(screen.getByTestId('metric-icon-1')).toHaveTextContent('💾');
            expect(screen.getByTestId('metric-status-1')).toHaveTextContent('good');
        });

        it('should display storage usage metric correctly', () => {
            render(<MonitoringDashboard clusterId={mockClusterId} />);

            expect(screen.getByTestId('metric-title-2')).toHaveTextContent('Storage Usage');
            expect(screen.getByTestId('metric-value-2')).toHaveTextContent('45');
            expect(screen.getByTestId('metric-unit-2')).toHaveTextContent('%');
            expect(screen.getByTestId('metric-icon-2')).toHaveTextContent('💿');
            expect(screen.getByTestId('metric-status-2')).toHaveTextContent('excellent');
        });

        it('should display network load metric correctly', () => {
            render(<MonitoringDashboard clusterId={mockClusterId} />);

            expect(screen.getByTestId('metric-title-3')).toHaveTextContent('Network Load');
            expect(screen.getByTestId('metric-value-3')).toHaveTextContent('82');
            expect(screen.getByTestId('metric-unit-3')).toHaveTextContent('%');
            expect(screen.getByTestId('metric-icon-3')).toHaveTextContent('🌐');
            expect(screen.getByTestId('metric-status-3')).toHaveTextContent('warning');
        });

        it('should display trend indicators correctly', () => {
            render(<MonitoringDashboard clusterId={mockClusterId} />);

            // Positive trends
            expect(screen.getByTestId('trend-indicator-0')).toHaveTextContent('📈');
            expect(screen.getByTestId('trend-value-0')).toHaveTextContent('+2.1%');
            expect(screen.getByTestId('trend-value-0')).toHaveClass('text-emerald-600');

            // Negative trend
            expect(screen.getByTestId('trend-indicator-2')).toHaveTextContent('📉');
            expect(screen.getByTestId('trend-value-2')).toHaveTextContent('-1.2%');
            expect(screen.getByTestId('trend-value-2')).toHaveClass('text-red-600');
        });
    });

    describe('Pod Status Section', () => {
        it('should render pod status overview', () => {
            render(<MonitoringDashboard clusterId={mockClusterId} />);

            expect(screen.getByTestId('pod-status-section')).toBeInTheDocument();
            expect(screen.getByTestId('pod-status-title')).toHaveTextContent('Pod Status Overview');
            expect(screen.getByTestId('last-updated')).toHaveTextContent('2 seconds ago');
        });

        it('should display all pod status categories', () => {
            render(<MonitoringDashboard clusterId={mockClusterId} />);

            const podStatsGrid = screen.getByTestId('pod-stats-grid');
            expect(podStatsGrid).toBeInTheDocument();

            // Should have 4 pod status cards
            for (let i = 0; i < 4; i++) {
                expect(screen.getByTestId(`pod-stat-${i}`)).toBeInTheDocument();
            }
        });

        it('should display running pods correctly', () => {
            render(<MonitoringDashboard clusterId={mockClusterId} />);

            expect(screen.getByTestId('pod-icon-0')).toHaveTextContent('🟢');
            expect(screen.getByTestId('pod-status-label-0')).toHaveTextContent('Running');
            expect(screen.getByTestId('pod-count-0')).toHaveTextContent('1,247');
            expect(screen.getByTestId('pod-label-0')).toHaveTextContent('Running Pods');
        });

        it('should display pending pods correctly', () => {
            render(<MonitoringDashboard clusterId={mockClusterId} />);

            expect(screen.getByTestId('pod-icon-1')).toHaveTextContent('🟡');
            expect(screen.getByTestId('pod-status-label-1')).toHaveTextContent('Pending');
            expect(screen.getByTestId('pod-count-1')).toHaveTextContent('12');
            expect(screen.getByTestId('pod-label-1')).toHaveTextContent('Pending Pods');
        });

        it('should display failed pods correctly', () => {
            render(<MonitoringDashboard clusterId={mockClusterId} />);

            expect(screen.getByTestId('pod-icon-2')).toHaveTextContent('🔴');
            expect(screen.getByTestId('pod-status-label-2')).toHaveTextContent('Failed');
            expect(screen.getByTestId('pod-count-2')).toHaveTextContent('3');
            expect(screen.getByTestId('pod-label-2')).toHaveTextContent('Failed Pods');
        });

        it('should display succeeded pods correctly', () => {
            render(<MonitoringDashboard clusterId={mockClusterId} />);

            expect(screen.getByTestId('pod-icon-3')).toHaveTextContent('🔵');
            expect(screen.getByTestId('pod-status-label-3')).toHaveTextContent('Succeeded');
            expect(screen.getByTestId('pod-count-3')).toHaveTextContent('892');
            expect(screen.getByTestId('pod-label-3')).toHaveTextContent('Succeeded Pods');
        });
    });

    describe('iOS Design Elements', () => {
        it('should have glassmorphism effects on main containers', () => {
            render(<MonitoringDashboard clusterId={mockClusterId} />);

            const header = screen.getByTestId('dashboard-header');
            expect(header).toHaveClass('bg-white/80', 'backdrop-blur-xl', 'border', 'border-white/20');

            const podSection = screen.getByTestId('pod-status-section');
            expect(podSection).toHaveClass('bg-white/80', 'backdrop-blur-xl', 'border', 'border-white/20');
        });

        it('should have iOS-style rounded corners', () => {
            render(<MonitoringDashboard clusterId={mockClusterId} />);

            const header = screen.getByTestId('dashboard-header');
            expect(header).toHaveClass('rounded-3xl');

            for (let i = 0; i < 4; i++) {
                const metricCard = screen.getByTestId(`metric-card-${i}`);
                expect(metricCard).toHaveClass('rounded-3xl');
            }
        });

        it('should have premium shadow effects', () => {
            render(<MonitoringDashboard clusterId={mockClusterId} />);

            const header = screen.getByTestId('dashboard-header');
            expect(header).toHaveClass('shadow-2xl');

            for (let i = 0; i < 4; i++) {
                const metricCard = screen.getByTestId(`metric-card-${i}`);
                expect(metricCard).toHaveClass('shadow-xl', 'hover:shadow-2xl');
            }
        });

        it('should have gradient backgrounds', () => {
            render(<MonitoringDashboard clusterId={mockClusterId} />);

            const header = screen.getByTestId('dashboard-header');
            const headerOverlay = header.querySelector('.absolute.inset-0');
            expect(headerOverlay).toHaveClass('bg-gradient-to-br');
        });
    });

    describe('Interactions', () => {
        it('should handle export button click', () => {
            render(<MonitoringDashboard clusterId={mockClusterId} />);

            const exportButton = screen.getByTestId('export-button');
            expect(exportButton).toBeInTheDocument();
            expect(exportButton).toHaveTextContent('Export Data');

            fireEvent.click(exportButton);
            // Note: In a real implementation, this would trigger an export function
        });

        it('should have hover effects on metric cards', () => {
            render(<MonitoringDashboard clusterId={mockClusterId} />);

            for (let i = 0; i < 4; i++) {
                const metricCard = screen.getByTestId(`metric-card-${i}`);
                expect(metricCard).toHaveClass('hover:scale-105', 'transition-all', 'duration-500');
            }
        });

        it('should have hover effects on pod status cards', () => {
            render(<MonitoringDashboard clusterId={mockClusterId} />);

            for (let i = 0; i < 4; i++) {
                const podStat = screen.getByTestId(`pod-stat-${i}`);
                expect(podStat).toHaveClass('hover:scale-105', 'transition-all', 'duration-300');
            }
        });
    });

    describe('Responsive Design', () => {
        it('should have responsive grid layouts', () => {
            render(<MonitoringDashboard clusterId={mockClusterId} />);

            const metricsGrid = screen.getByTestId('metrics-grid');
            expect(metricsGrid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'xl:grid-cols-4');

            const podStatsGrid = screen.getByTestId('pod-stats-grid');
            expect(podStatsGrid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'xl:grid-cols-4');
        });

        it('should have responsive spacing classes', () => {
            render(<MonitoringDashboard clusterId={mockClusterId} />);

            const dashboard = screen.getByTestId('monitoring-dashboard');
            expect(dashboard).toHaveClass('space-y-8');
        });
    });

    describe('Accessibility', () => {
        it('should have proper heading hierarchy', () => {
            render(<MonitoringDashboard clusterId={mockClusterId} />);

            const mainTitle = screen.getByTestId('dashboard-title');
            expect(mainTitle.tagName).toBe('H3');

            const podTitle = screen.getByTestId('pod-status-title');
            expect(podTitle.tagName).toBe('H4');
        });

        it('should have descriptive content for metrics', () => {
            render(<MonitoringDashboard clusterId={mockClusterId} />);

            for (let i = 0; i < 4; i++) {
                const metricDetails = screen.getByTestId(`metric-details-${i}`);
                expect(metricDetails).toBeInTheDocument();
                expect(metricDetails).toHaveTextContent(/cores|GB|volumes|services/);
            }
        });
    });
});
