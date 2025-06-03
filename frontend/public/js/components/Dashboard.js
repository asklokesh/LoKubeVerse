// Dashboard Component - Main overview with real-time metrics
class Dashboard {
    constructor() {
        this.clusters = [];
        this.metrics = {};
        this.costs = {};
        this.alerts = [];
        this.refreshInterval = null;
        this.isVisible = false;
    }

    // Render the dashboard page
    async render() {
        return `
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <h1 class="mdc-typography--headline4">Kubernetes Dashboard</h1>
                    <p class="mdc-typography--body1">Multi-cloud cluster overview and monitoring</p>
                </div>

                <!-- Quick Stats -->
                <div class="metrics-grid" id="quick-metrics">
                    <div class="metric-card loading" id="clusters-metric">
                        <div class="metric-icon">
                            <i class="material-icons">dns</i>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value">--</div>
                            <div class="metric-label">Active Clusters</div>
                        </div>
                    </div>

                    <div class="metric-card loading" id="workloads-metric">
                        <div class="metric-icon">
                            <i class="material-icons">work</i>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value">--</div>
                            <div class="metric-label">Running Workloads</div>
                        </div>
                    </div>

                    <div class="metric-card loading" id="alerts-metric">
                        <div class="metric-icon">
                            <i class="material-icons">warning</i>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value">--</div>
                            <div class="metric-label">Active Alerts</div>
                        </div>
                    </div>

                    <div class="metric-card loading" id="cost-metric">
                        <div class="metric-icon">
                            <i class="material-icons">attach_money</i>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value">--</div>
                            <div class="metric-label">Monthly Cost</div>
                        </div>
                    </div>
                </div>

                <!-- Cluster Overview -->
                <div class="dashboard-section">
                    <div class="section-header">
                        <h2 class="mdc-typography--headline6">Cluster Overview</h2>
                        <button class="mdc-button mdc-button--outlined" id="refresh-clusters">
                            <i class="material-icons mdc-button__icon">refresh</i>
                            <span class="mdc-button__label">Refresh</span>
                        </button>
                    </div>
                    
                    <div class="clusters-grid" id="clusters-overview">
                        <div class="loading-placeholder">
                            <div class="mdc-circular-progress mdc-circular-progress--indeterminate">
                                <div class="mdc-circular-progress__determinate-container">
                                    <svg class="mdc-circular-progress__determinate-circle-graphic" viewBox="0 0 48 48">
                                        <circle class="mdc-circular-progress__determinate-track" cx="24" cy="24" r="18" stroke-width="4"/>
                                        <circle class="mdc-circular-progress__determinate-circle" cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="113.097" stroke-width="4"/>
                                    </svg>
                                </div>
                                <div class="mdc-circular-progress__indeterminate-container">
                                    <div class="mdc-circular-progress__spinner-layer">
                                        <div class="mdc-circular-progress__circle-clipper mdc-circular-progress__circle-left">
                                            <svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 48 48">
                                                <circle cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="56.549" stroke-width="4"/>
                                            </svg>
                                        </div>
                                        <div class="mdc-circular-progress__gap-patch">
                                            <svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 48 48">
                                                <circle cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="56.549" stroke-width="3.2"/>
                                            </svg>
                                        </div>
                                        <div class="mdc-circular-progress__circle-clipper mdc-circular-progress__circle-right">
                                            <svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 48 48">
                                                <circle cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="56.549" stroke-width="4"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p>Loading clusters...</p>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="dashboard-section">
                    <div class="section-header">
                        <h2 class="mdc-typography--headline6">Recent Activity</h2>
                        <a href="#" class="mdc-button mdc-button--outlined" data-page="audit">
                            <span class="mdc-button__label">View All</span>
                            <i class="material-icons mdc-button__icon">arrow_forward</i>
                        </a>
                    </div>
                    
                    <div class="activity-list" id="recent-activity">
                        <div class="loading-placeholder">
                            <p>Loading recent activity...</p>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="dashboard-section">
                    <div class="section-header">
                        <h2 class="mdc-typography--headline6">Quick Actions</h2>
                    </div>
                    
                    <div class="quick-actions-grid">
                        <button class="mdc-card mdc-card--outlined quick-action-card" data-action="create-cluster">
                            <div class="mdc-card__primary-action">
                                <div class="action-icon">
                                    <i class="material-icons">add_circle</i>
                                </div>
                                <div class="action-content">
                                    <h3 class="mdc-typography--headline6">Create Cluster</h3>
                                    <p class="mdc-typography--body2">Launch a new Kubernetes cluster</p>
                                </div>
                            </div>
                        </button>

                        <button class="mdc-card mdc-card--outlined quick-action-card" data-action="deploy-app">
                            <div class="mdc-card__primary-action">
                                <div class="action-icon">
                                    <i class="material-icons">rocket_launch</i>
                                </div>
                                <div class="action-content">
                                    <h3 class="mdc-typography--headline6">Deploy Application</h3>
                                    <p class="mdc-typography--body2">Deploy apps to your clusters</p>
                                </div>
                            </div>
                        </button>

                        <button class="mdc-card mdc-card--outlined quick-action-card" data-action="view-monitoring">
                            <div class="mdc-card__primary-action">
                                <div class="action-icon">
                                    <i class="material-icons">monitoring</i>
                                </div>
                                <div class="action-content">
                                    <h3 class="mdc-typography--headline6">View Monitoring</h3>
                                    <p class="mdc-typography--body2">Check cluster health and metrics</p>
                                </div>
                            </div>
                        </button>

                        <button class="mdc-card mdc-card--outlined quick-action-card" data-action="manage-costs">
                            <div class="mdc-card__primary-action">
                                <div class="action-icon">
                                    <i class="material-icons">savings</i>
                                </div>
                                <div class="action-content">
                                    <h3 class="mdc-typography--headline6">Manage Costs</h3>
                                    <p class="mdc-typography--body2">Optimize spending and resources</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Initialize dashboard
    async init() {
        this.isVisible = true;
        await this.loadData();
        this.bindEvents();
        this.startAutoRefresh();
    }

    // Load dashboard data
    async loadData() {
        await Promise.all([
            this.loadClusters(),
            this.loadMetrics(),
            this.loadCosts(),
            this.loadRecentActivity()
        ]);
    }

    // Load clusters data
    async loadClusters() {
        try {
            const result = await APIService.getClusters();
            if (result.success) {
                this.clusters = result.data || [];
                this.renderClusters();
                this.updateQuickMetrics();
            } else {
                this.showError('Failed to load clusters');
            }
        } catch (error) {
            console.error('Error loading clusters:', error);
            this.clusters = this.getMockClusters(); // Fallback to mock data
            this.renderClusters();
            this.updateQuickMetrics();
        }
    }

    // Load metrics data
    async loadMetrics() {
        try {
            // Load metrics for each cluster
            const metricsPromises = this.clusters.map(async cluster => {
                const result = await APIService.getClusterMetrics(cluster.id);
                return {
                    clusterId: cluster.id,
                    metrics: result.success ? result.data : this.getMockMetrics()
                };
            });

            const results = await Promise.all(metricsPromises);
            results.forEach(({ clusterId, metrics }) => {
                this.metrics[clusterId] = metrics;
            });
        } catch (error) {
            console.error('Error loading metrics:', error);
        }
    }

    // Load costs data
    async loadCosts() {
        try {
            const result = await APIService.getCostSummary();
            if (result.success) {
                this.costs = result.data;
            } else {
                this.costs = this.getMockCosts();
            }
        } catch (error) {
            console.error('Error loading costs:', error);
            this.costs = this.getMockCosts();
        }
    }

    // Load recent activity
    async loadRecentActivity() {
        try {
            const result = await APIService.getAuditLogs({ limit: 10 });
            if (result.success) {
                this.renderRecentActivity(result.data);
            } else {
                this.renderRecentActivity(this.getMockActivity());
            }
        } catch (error) {
            console.error('Error loading recent activity:', error);
            this.renderRecentActivity(this.getMockActivity());
        }
    }

    // Render clusters overview
    renderClusters() {
        const container = document.getElementById('clusters-overview');
        if (!container || !this.clusters.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="material-icons">dns</i>
                    <h3>No clusters found</h3>
                    <p>Create your first Kubernetes cluster to get started</p>
                    <button class="mdc-button mdc-button--raised" data-action="create-cluster">
                        <i class="material-icons mdc-button__icon">add</i>
                        <span class="mdc-button__label">Create Cluster</span>
                    </button>
                </div>
            `;
            return;
        }

        const clustersHTML = this.clusters.map(cluster => `
            <div class="cluster-card" data-cluster-id="${cluster.id}">
                <div class="cluster-header">
                    <div class="cluster-info">
                        <h3 class="cluster-name">${cluster.name}</h3>
                        <div class="cluster-provider">
                            <span class="provider-badge provider-${cluster.provider}">${cluster.provider.toUpperCase()}</span>
                            <span class="cluster-region">${cluster.region}</span>
                        </div>
                    </div>
                    <div class="cluster-status">
                        <span class="status-indicator status-${cluster.status}"></span>
                        <span class="status-text">${cluster.status}</span>
                    </div>
                </div>

                <div class="cluster-metrics">
                    <div class="metric-item">
                        <span class="metric-label">Nodes</span>
                        <span class="metric-value">${cluster.nodes || 0}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Pods</span>
                        <span class="metric-value">${cluster.pods || 0}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">CPU</span>
                        <span class="metric-value">${cluster.cpu_usage || 0}%</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Memory</span>
                        <span class="metric-value">${cluster.memory_usage || 0}%</span>
                    </div>
                </div>

                <div class="cluster-actions">
                    <button class="mdc-icon-button" title="View Details" data-action="view-cluster" data-cluster-id="${cluster.id}">
                        <i class="material-icons">visibility</i>
                    </button>
                    <button class="mdc-icon-button" title="Monitoring" data-action="view-monitoring" data-cluster-id="${cluster.id}">
                        <i class="material-icons">monitoring</i>
                    </button>
                    <button class="mdc-icon-button" title="More Actions" data-action="cluster-menu" data-cluster-id="${cluster.id}">
                        <i class="material-icons">more_vert</i>
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = clustersHTML;
    }

    // Update quick metrics
    updateQuickMetrics() {
        const totalClusters = this.clusters.length;
        const activeClusters = this.clusters.filter(c => c.status === 'running').length;
        const totalWorkloads = this.clusters.reduce((sum, c) => sum + (c.pods || 0), 0);
        const totalAlerts = Object.values(this.metrics).reduce((sum, m) => sum + (m.alerts?.length || 0), 0);
        const monthlyCost = this.costs.monthly_total || 0;

        this.updateMetricCard('clusters-metric', activeClusters, 'Active Clusters', activeClusters === totalClusters ? 'healthy' : 'warning');
        this.updateMetricCard('workloads-metric', totalWorkloads, 'Running Workloads', 'healthy');
        this.updateMetricCard('alerts-metric', totalAlerts, 'Active Alerts', totalAlerts === 0 ? 'healthy' : 'warning');
        this.updateMetricCard('cost-metric', `$${monthlyCost.toLocaleString()}`, 'Monthly Cost', 'healthy');
    }

    // Update individual metric card
    updateMetricCard(cardId, value, label, status = 'healthy') {
        const card = document.getElementById(cardId);
        if (!card) return;

        card.className = `metric-card status-${status}`;
        card.querySelector('.metric-value').textContent = value;
        card.querySelector('.metric-label').textContent = label;
    }

    // Render recent activity
    renderRecentActivity(activities) {
        const container = document.getElementById('recent-activity');
        if (!container) return;

        if (!activities || activities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No recent activity</p>
                </div>
            `;
            return;
        }

        const activitiesHTML = activities.slice(0, 5).map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="material-icons">${this.getActivityIcon(activity.action)}</i>
                </div>
                <div class="activity-content">
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-meta">
                        <span class="activity-user">${activity.user}</span>
                        <span class="activity-time">${this.formatRelativeTime(activity.timestamp)}</span>
                    </div>
                </div>
                <div class="activity-status">
                    <span class="status-badge status-${activity.status}">${activity.status}</span>
                </div>
            </div>
        `).join('');

        container.innerHTML = activitiesHTML;
    }

    // Get activity icon based on action
    getActivityIcon(action) {
        const iconMap = {
            'cluster_created': 'add_circle',
            'cluster_deleted': 'remove_circle',
            'deployment_created': 'rocket_launch',
            'user_login': 'login',
            'user_logout': 'logout',
            'default': 'info'
        };
        return iconMap[action] || iconMap.default;
    }

    // Format relative time
    formatRelativeTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    }

    // Bind event listeners
    bindEvents() {
        // Refresh button
        const refreshButton = document.getElementById('refresh-clusters');
        refreshButton?.addEventListener('click', () => this.refreshData());

        // Quick action cards
        document.querySelectorAll('.quick-action-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const action = card.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Cluster actions
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-action]')) {
                const button = e.target.closest('[data-action]');
                const action = button.dataset.action;
                const clusterId = button.dataset.clusterId;
                this.handleClusterAction(action, clusterId);
            }
        });
    }

    // Handle quick actions
    handleQuickAction(action) {
        switch (action) {
            case 'create-cluster':
                App.navigateToPage('clusters');
                break;
            case 'deploy-app':
                // Show deployment dialog
                this.showDeploymentDialog();
                break;
            case 'view-monitoring':
                App.navigateToPage('monitoring');
                break;
            case 'manage-costs':
                App.navigateToPage('costs');
                break;
        }
    }

    // Handle cluster actions
    handleClusterAction(action, clusterId) {
        switch (action) {
            case 'view-cluster':
                App.navigateToPage('clusters', { clusterId });
                break;
            case 'view-monitoring':
                App.navigateToPage('monitoring', { clusterId });
                break;
            case 'cluster-menu':
                this.showClusterMenu(clusterId);
                break;
        }
    }

    // Show deployment dialog
    showDeploymentDialog() {
        // Implementation for deployment dialog
        console.log('Show deployment dialog');
    }

    // Show cluster context menu
    showClusterMenu(clusterId) {
        // Implementation for cluster context menu
        console.log('Show cluster menu for:', clusterId);
    }

    // Start auto-refresh
    startAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        this.refreshInterval = setInterval(() => {
            if (this.isVisible) {
                this.refreshData();
            }
        }, UI_CONSTANTS.INTERVALS.METRICS);
    }

    // Stop auto-refresh
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    // Refresh data
    async refreshData() {
        await this.loadData();
    }

    // Show error message
    showError(message) {
        // Implementation for error notifications
        console.error(message);
    }

    // Mock data methods (fallback when API fails)
    getMockClusters() {
        return [
            {
                id: 'cluster-1',
                name: 'production-east',
                provider: 'aws',
                region: 'us-east-1',
                status: 'running',
                nodes: 5,
                pods: 42,
                cpu_usage: 68,
                memory_usage: 73
            },
            {
                id: 'cluster-2',
                name: 'staging-west',
                provider: 'gcp',
                region: 'us-west1',
                status: 'running',
                nodes: 3,
                pods: 18,
                cpu_usage: 45,
                memory_usage: 52
            },
            {
                id: 'cluster-3',
                name: 'dev-central',
                provider: 'azure',
                region: 'centralus',
                status: 'running',
                nodes: 2,
                pods: 12,
                cpu_usage: 32,
                memory_usage: 38
            }
        ];
    }

    getMockMetrics() {
        return {
            alerts: [
                { severity: 'warning', message: 'High CPU usage' }
            ]
        };
    }

    getMockCosts() {
        return {
            monthly_total: 2847
        };
    }

    getMockActivity() {
        return [
            {
                action: 'deployment_created',
                description: 'Deployed nginx-app to production-east cluster',
                user: 'john.doe@company.com',
                timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
                status: 'success'
            },
            {
                action: 'cluster_created',
                description: 'Created new cluster dev-central in Azure',
                user: 'jane.smith@company.com',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                status: 'success'
            }
        ];
    }

    // Cleanup
    destroy() {
        this.isVisible = false;
        this.stopAutoRefresh();
    }
}

// Export for use in app.js and tests
function createDashboard() {
    const dashboard = new Dashboard();
    const appContainer = document.getElementById('app');
    if (appContainer) {
        dashboard.render().then(html => {
            appContainer.innerHTML = html;
            dashboard.initialize();
        });
    }
    return dashboard;
}

// Make Dashboard class available globally for browser usage
if (typeof window !== 'undefined') {
    window.Dashboard = Dashboard;
    window.createDashboard = createDashboard;
}

// CommonJS export for Node.js tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Dashboard, createDashboard };
}
