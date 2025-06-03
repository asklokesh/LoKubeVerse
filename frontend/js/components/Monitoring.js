// Monitoring Component - Real-time Metrics and Alerts
class Monitoring {
    constructor() {
        this.apiService = new APIService();
        this.metrics = {};
        this.alerts = [];
        this.isLoading = false;
        this.refreshInterval = null;
        this.charts = {};
        this.timeRange = '1h';

        this.init();
    }

    init() {
        this.container = document.getElementById('monitoring-content');
        this.render();
        this.loadMetrics();
        this.loadAlerts();
        this.setupEventListeners();
        this.startAutoRefresh();
    }

    render() {
        this.container.innerHTML = `
            <div class="monitoring-page">
                <!-- Header with controls -->
                <div class="page-header">
                    <div class="header-title">
                        <h1>Monitoring</h1>
                        <span class="subtitle">Real-time cluster and workload metrics</span>
                    </div>
                    <div class="header-actions">
                        <div class="time-range-selector">
                            <button class="mdc-button time-range-btn active" data-range="1h">1H</button>
                            <button class="mdc-button time-range-btn" data-range="6h">6H</button>
                            <button class="mdc-button time-range-btn" data-range="24h">24H</button>
                            <button class="mdc-button time-range-btn" data-range="7d">7D</button>
                        </div>
                        <button class="mdc-icon-button" id="refresh-monitoring-btn" title="Refresh">
                            <i class="material-icons">refresh</i>
                        </button>
                    </div>
                </div>

                <!-- Alerts Section -->
                <div class="alerts-section">
                    <div class="section-header">
                        <h2>Active Alerts</h2>
                        <span class="alert-count" id="alert-count">0</span>
                    </div>
                    <div class="alerts-container" id="alerts-container">
                        <!-- Alerts will be rendered here -->
                    </div>
                </div>

                <!-- Metrics Overview -->
                <div class="metrics-overview">
                    <div class="section-header">
                        <h2>Cluster Overview</h2>
                        <span class="last-updated" id="last-updated">Last updated: Never</span>
                    </div>
                    
                    <div class="metrics-grid">
                        <!-- Resource Usage Cards -->
                        <div class="metric-card">
                            <div class="metric-header">
                                <h3>CPU Usage</h3>
                                <span class="metric-value" id="cpu-usage">--</span>
                            </div>
                            <div class="metric-chart" id="cpu-chart">
                                <div class="usage-bar">
                                    <div class="usage-fill" style="width: 0%"></div>
                                </div>
                                <div class="usage-details">
                                    <span>Used: <span id="cpu-used">0</span> cores</span>
                                    <span>Total: <span id="cpu-total">0</span> cores</span>
                                </div>
                            </div>
                        </div>

                        <div class="metric-card">
                            <div class="metric-header">
                                <h3>Memory Usage</h3>
                                <span class="metric-value" id="memory-usage">--</span>
                            </div>
                            <div class="metric-chart" id="memory-chart">
                                <div class="usage-bar">
                                    <div class="usage-fill" style="width: 0%"></div>
                                </div>
                                <div class="usage-details">
                                    <span>Used: <span id="memory-used">0</span> GB</span>
                                    <span>Total: <span id="memory-total">0</span> GB</span>
                                </div>
                            </div>
                        </div>

                        <div class="metric-card">
                            <div class="metric-header">
                                <h3>Storage Usage</h3>
                                <span class="metric-value" id="storage-usage">--</span>
                            </div>
                            <div class="metric-chart" id="storage-chart">
                                <div class="usage-bar">
                                    <div class="usage-fill" style="width: 0%"></div>
                                </div>
                                <div class="usage-details">
                                    <span>Used: <span id="storage-used">0</span> GB</span>
                                    <span>Total: <span id="storage-total">0</span> GB</span>
                                </div>
                            </div>
                        </div>

                        <div class="metric-card">
                            <div class="metric-header">
                                <h3>Network I/O</h3>
                                <span class="metric-value" id="network-usage">--</span>
                            </div>
                            <div class="metric-chart" id="network-chart">
                                <div class="network-stats">
                                    <div class="stat">
                                        <span class="label">In:</span>
                                        <span class="value" id="network-in">0 MB/s</span>
                                    </div>
                                    <div class="stat">
                                        <span class="label">Out:</span>
                                        <span class="value" id="network-out">0 MB/s</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Node Status -->
                <div class="nodes-section">
                    <div class="section-header">
                        <h2>Node Status</h2>
                        <span class="node-count" id="node-count">0 nodes</span>
                    </div>
                    <div class="nodes-grid" id="nodes-grid">
                        <!-- Nodes will be rendered here -->
                    </div>
                </div>

                <!-- Workload Performance -->
                <div class="workloads-section">
                    <div class="section-header">
                        <h2>Top Resource Consumers</h2>
                        <div class="metric-toggle">
                            <button class="mdc-button metric-toggle-btn active" data-metric="cpu">CPU</button>
                            <button class="mdc-button metric-toggle-btn" data-metric="memory">Memory</button>
                        </div>
                    </div>
                    <div class="workload-metrics" id="workload-metrics">
                        <!-- Workload metrics will be rendered here -->
                    </div>
                </div>

                <!-- Historical Charts -->
                <div class="charts-section">
                    <div class="section-header">
                        <h2>Historical Metrics</h2>
                    </div>
                    <div class="charts-grid">
                        <div class="chart-container">
                            <h3>CPU Usage Over Time</h3>
                            <div class="chart-placeholder" id="cpu-history-chart">
                                <i class="material-icons">trending_up</i>
                                <p>Chart will appear here</p>
                            </div>
                        </div>
                        <div class="chart-container">
                            <h3>Memory Usage Over Time</h3>
                            <div class="chart-placeholder" id="memory-history-chart">
                                <i class="material-icons">trending_up</i>
                                <p>Chart will appear here</p>
                            </div>
                        </div>
                        <div class="chart-container">
                            <h3>Network Traffic</h3>
                            <div class="chart-placeholder" id="network-history-chart">
                                <i class="material-icons">trending_up</i>
                                <p>Chart will appear here</p>
                            </div>
                        </div>
                        <div class="chart-container">
                            <h3>Pod Count</h3>
                            <div class="chart-placeholder" id="pod-count-chart">
                                <i class="material-icons">trending_up</i>
                                <p>Chart will appear here</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Loading state -->
                <div class="loading-container" id="monitoring-loading" style="display: none;">
                    <div class="mdc-circular-progress" style="width:48px;height:48px;" role="progressbar">
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
                    <p>Loading monitoring data...</p>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Time range selector
        document.querySelectorAll('.time-range-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.time-range-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.timeRange = btn.dataset.range;
                this.loadMetrics();
            });
        });

        // Metric toggle for workloads
        document.querySelectorAll('.metric-toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.metric-toggle-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderWorkloadMetrics(btn.dataset.metric);
            });
        });

        // Refresh button
        document.getElementById('refresh-monitoring-btn').addEventListener('click', () => {
            this.loadMetrics();
            this.loadAlerts();
        });
    }

    async loadMetrics() {
        this.setLoading(true);

        try {
            // Try to load from API, fallback to mock data
            const response = await this.apiService.get(`/monitoring/metrics?range=${this.timeRange}`);
            this.metrics = response.metrics || this.getMockMetrics();
        } catch (error) {
            console.warn('Failed to load metrics from API, using mock data:', error);
            this.metrics = this.getMockMetrics();
        }

        this.setLoading(false);
        this.renderMetrics();
        this.updateLastUpdated();
    }

    async loadAlerts() {
        try {
            const response = await this.apiService.get('/monitoring/alerts');
            this.alerts = response.alerts || this.getMockAlerts();
        } catch (error) {
            console.warn('Failed to load alerts from API, using mock data:', error);
            this.alerts = this.getMockAlerts();
        }

        this.renderAlerts();
    }

    getMockMetrics() {
        return {
            cluster: {
                cpu: { used: 12.5, total: 32, percentage: 39 },
                memory: { used: 28.6, total: 64, percentage: 45 },
                storage: { used: 125, total: 500, percentage: 25 },
                network: { in: 15.2, out: 8.7 }
            },
            nodes: [
                {
                    id: 'node-1',
                    name: 'k8s-master-1',
                    status: 'ready',
                    cpu: { used: 4.2, total: 8, percentage: 53 },
                    memory: { used: 12.8, total: 16, percentage: 80 },
                    pods: { running: 15, capacity: 110 }
                },
                {
                    id: 'node-2',
                    name: 'k8s-worker-1',
                    status: 'ready',
                    cpu: { used: 3.1, total: 8, percentage: 39 },
                    memory: { used: 8.2, total: 16, percentage: 51 },
                    pods: { running: 12, capacity: 110 }
                },
                {
                    id: 'node-3',
                    name: 'k8s-worker-2',
                    status: 'ready',
                    cpu: { used: 5.2, total: 16, percentage: 33 },
                    memory: { used: 7.6, total: 32, percentage: 24 },
                    pods: { running: 8, capacity: 110 }
                }
            ],
            workloads: [
                { name: 'frontend-deployment', cpu: 2.1, memory: 4.2, namespace: 'default' },
                { name: 'backend-api', cpu: 1.8, memory: 8.5, namespace: 'default' },
                { name: 'database', cpu: 1.2, memory: 12.1, namespace: 'default' },
                { name: 'redis-cache', cpu: 0.5, memory: 2.1, namespace: 'default' },
                { name: 'nginx-ingress', cpu: 0.8, memory: 1.8, namespace: 'kube-system' }
            ]
        };
    }

    getMockAlerts() {
        return [
            {
                id: 'alert-1',
                severity: 'warning',
                title: 'High CPU Usage',
                description: 'Node k8s-master-1 CPU usage is above 80%',
                timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
                status: 'firing'
            },
            {
                id: 'alert-2',
                severity: 'critical',
                title: 'Pod Restart Loop',
                description: 'Pod backend-api-7b8f9c8d4f-x5z2p is restarting frequently',
                timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
                status: 'firing'
            },
            {
                id: 'alert-3',
                severity: 'info',
                title: 'Low Disk Space',
                description: 'Node k8s-worker-2 disk usage is at 75%',
                timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
                status: 'resolved'
            }
        ];
    }

    renderMetrics() {
        const { cluster, nodes, workloads } = this.metrics;

        // Update cluster overview
        this.updateResourceCard('cpu', cluster.cpu);
        this.updateResourceCard('memory', cluster.memory);
        this.updateResourceCard('storage', cluster.storage);
        this.updateNetworkCard(cluster.network);

        // Render nodes
        this.renderNodes(nodes);

        // Render workload metrics
        this.renderWorkloadMetrics('cpu', workloads);
    }

    updateResourceCard(type, data) {
        document.getElementById(`${type}-usage`).textContent = `${data.percentage}%`;
        document.getElementById(`${type}-used`).textContent = data.used;
        document.getElementById(`${type}-total`).textContent = data.total;

        const fillElement = document.querySelector(`#${type}-chart .usage-fill`);
        fillElement.style.width = `${data.percentage}%`;

        // Color coding based on usage
        const colorClass = data.percentage > 80 ? 'critical' :
            data.percentage > 60 ? 'warning' : 'normal';
        fillElement.className = `usage-fill ${colorClass}`;
    }

    updateNetworkCard(data) {
        document.getElementById('network-usage').textContent = `${(data.in + data.out).toFixed(1)} MB/s`;
        document.getElementById('network-in').textContent = `${data.in} MB/s`;
        document.getElementById('network-out').textContent = `${data.out} MB/s`;
    }

    renderNodes(nodes) {
        const container = document.getElementById('nodes-grid');
        document.getElementById('node-count').textContent = `${nodes.length} nodes`;

        container.innerHTML = nodes.map(node => `
            <div class="node-card">
                <div class="node-header">
                    <div class="node-name">
                        <i class="material-icons">dns</i>
                        <span>${node.name}</span>
                    </div>
                    <div class="node-status status-${node.status}">
                        <i class="material-icons">${node.status === 'ready' ? 'check_circle' : 'error'}</i>
                        <span>${node.status}</span>
                    </div>
                </div>
                
                <div class="node-metrics">
                    <div class="metric-row">
                        <span class="label">CPU:</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${node.cpu.percentage}%"></div>
                            <span class="progress-text">${node.cpu.percentage}%</span>
                        </div>
                    </div>
                    <div class="metric-row">
                        <span class="label">Memory:</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${node.memory.percentage}%"></div>
                            <span class="progress-text">${node.memory.percentage}%</span>
                        </div>
                    </div>
                    <div class="metric-row">
                        <span class="label">Pods:</span>
                        <span class="value">${node.pods.running}/${node.pods.capacity}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderWorkloadMetrics(metricType, workloads) {
        const container = document.getElementById('workload-metrics');

        // Sort workloads by the selected metric
        const sortedWorkloads = [...workloads].sort((a, b) => b[metricType] - a[metricType]);

        container.innerHTML = `
            <div class="workload-metrics-list">
                ${sortedWorkloads.slice(0, 10).map((workload, index) => `
                    <div class="workload-metric-item">
                        <div class="rank">${index + 1}</div>
                        <div class="workload-info">
                            <div class="workload-name">${workload.name}</div>
                            <div class="workload-namespace">${workload.namespace}</div>
                        </div>
                        <div class="metric-value">
                            ${workload[metricType]} ${metricType === 'cpu' ? 'cores' : 'GB'}
                        </div>
                        <div class="metric-bar">
                            <div class="metric-fill" style="width: ${(workload[metricType] / Math.max(...sortedWorkloads.map(w => w[metricType]))) * 100}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderAlerts() {
        const container = document.getElementById('alerts-container');
        const activeAlerts = this.alerts.filter(alert => alert.status === 'firing');

        document.getElementById('alert-count').textContent = activeAlerts.length;

        if (activeAlerts.length === 0) {
            container.innerHTML = `
                <div class="no-alerts">
                    <i class="material-icons">check_circle</i>
                    <p>No active alerts</p>
                </div>
            `;
            return;
        }

        container.innerHTML = activeAlerts.map(alert => `
            <div class="alert-item severity-${alert.severity}">
                <div class="alert-icon">
                    <i class="material-icons">${this.getAlertIcon(alert.severity)}</i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-description">${alert.description}</div>
                    <div class="alert-timestamp">${this.formatTimestamp(alert.timestamp)}</div>
                </div>
                <div class="alert-actions">
                    <button class="mdc-icon-button" title="Acknowledge" data-action="ack" data-alert-id="${alert.id}">
                        <i class="material-icons">check</i>
                    </button>
                    <button class="mdc-icon-button" title="Silence" data-action="silence" data-alert-id="${alert.id}">
                        <i class="material-icons">volume_off</i>
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners for alert actions
        container.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = button.dataset.action;
                const alertId = button.dataset.alertId;
                this.handleAlertAction(action, alertId);
            });
        });
    }

    getAlertIcon(severity) {
        const icons = {
            critical: 'error',
            warning: 'warning',
            info: 'info'
        };
        return icons[severity] || 'notification_important';
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) { // Less than 1 minute
            return 'Just now';
        } else if (diff < 3600000) { // Less than 1 hour
            return `${Math.floor(diff / 60000)}m ago`;
        } else if (diff < 86400000) { // Less than 1 day
            return `${Math.floor(diff / 3600000)}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    handleAlertAction(action, alertId) {
        console.log(`${action} alert:`, alertId);
        // Implementation for alert actions
    }

    updateLastUpdated() {
        const now = new Date();
        document.getElementById('last-updated').textContent =
            `Last updated: ${now.toLocaleTimeString()}`;
    }

    setLoading(loading) {
        this.isLoading = loading;
        const loadingEl = document.getElementById('monitoring-loading');
        const contentEl = document.querySelector('.monitoring-page');

        if (loading) {
            loadingEl.style.display = 'flex';
            contentEl.style.opacity = '0.5';
        } else {
            loadingEl.style.display = 'none';
            contentEl.style.opacity = '1';
        }
    }

    startAutoRefresh() {
        // Refresh every 15 seconds for real-time monitoring
        this.refreshInterval = setInterval(() => {
            if (!this.isLoading) {
                this.loadMetrics();
                this.loadAlerts();
            }
        }, 15000);
    }

    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }
}
