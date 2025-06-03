// Costs Component - Multi-cloud Cost Tracking and Optimization
class Costs {
    constructor() {
        this.apiService = new APIService();
        this.costs = {};
        this.recommendations = [];
        this.isLoading = false;
        this.currentView = 'overview'; // overview, breakdown, recommendations
        this.timeRange = '30d';
        this.groupBy = 'namespace';

        this.init();
    }

    init() {
        this.container = document.getElementById('costs-content');
        this.render();
        this.loadCosts();
        this.loadRecommendations();
        this.setupEventListeners();
        this.startAutoRefresh();
    }

    render() {
        this.container.innerHTML = `
            <div class="costs-page">
                <!-- Header with controls -->
                <div class="page-header">
                    <div class="header-title">
                        <h1>Cost Management</h1>
                        <span class="subtitle">Multi-cloud cost tracking and optimization</span>
                    </div>
                    <div class="header-actions">
                        <div class="time-range-selector">
                            <button class="mdc-button time-range-btn" data-range="7d">7D</button>
                            <button class="mdc-button time-range-btn active" data-range="30d">30D</button>
                            <button class="mdc-button time-range-btn" data-range="90d">90D</button>
                            <button class="mdc-button time-range-btn" data-range="1y">1Y</button>
                        </div>
                        <button class="mdc-icon-button" id="refresh-costs-btn" title="Refresh">
                            <i class="material-icons">refresh</i>
                        </button>
                    </div>
                </div>

                <!-- Navigation tabs -->
                <div class="costs-navigation">
                    <button class="mdc-button nav-btn active" data-view="overview">Overview</button>
                    <button class="mdc-button nav-btn" data-view="breakdown">Cost Breakdown</button>
                    <button class="mdc-button nav-btn" data-view="recommendations">Optimization</button>
                </div>

                <!-- Overview Tab -->
                <div class="costs-tab overview-tab" id="overview-tab">
                    <!-- Cost Summary Cards -->
                    <div class="cost-summary">
                        <div class="summary-card total-cost">
                            <div class="card-icon">
                                <i class="material-icons">account_balance_wallet</i>
                            </div>
                            <div class="card-content">
                                <h3>Total Cost</h3>
                                <div class="cost-value" id="total-cost">$0.00</div>
                                <div class="cost-change" id="total-change">--</div>
                            </div>
                        </div>

                        <div class="summary-card monthly-projection">
                            <div class="card-icon">
                                <i class="material-icons">trending_up</i>
                            </div>
                            <div class="card-content">
                                <h3>Monthly Projection</h3>
                                <div class="cost-value" id="monthly-projection">$0.00</div>
                                <div class="cost-change" id="monthly-change">--</div>
                            </div>
                        </div>

                        <div class="summary-card potential-savings">
                            <div class="card-icon">
                                <i class="material-icons">savings</i>
                            </div>
                            <div class="card-content">
                                <h3>Potential Savings</h3>
                                <div class="cost-value" id="potential-savings">$0.00</div>
                                <div class="savings-percentage" id="savings-percentage">--</div>
                            </div>
                        </div>

                        <div class="summary-card optimization-score">
                            <div class="card-icon">
                                <i class="material-icons">speed</i>
                            </div>
                            <div class="card-content">
                                <h3>Optimization Score</h3>
                                <div class="score-circle" id="optimization-score">
                                    <div class="score-value">--</div>
                                </div>
                                <div class="score-label">Cost Efficiency</div>
                            </div>
                        </div>
                    </div>

                    <!-- Cloud Provider Breakdown -->
                    <div class="provider-breakdown">
                        <div class="section-header">
                            <h2>Cost by Cloud Provider</h2>
                        </div>
                        <div class="providers-grid" id="providers-grid">
                            <!-- Provider costs will be rendered here -->
                        </div>
                    </div>

                    <!-- Cost Trends Chart -->
                    <div class="cost-trends">
                        <div class="section-header">
                            <h2>Cost Trends</h2>
                        </div>
                        <div class="chart-container">
                            <div class="chart-placeholder" id="cost-trends-chart">
                                <i class="material-icons">show_chart</i>
                                <p>Cost trends chart will appear here</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Breakdown Tab -->
                <div class="costs-tab breakdown-tab" id="breakdown-tab" style="display: none;">
                    <!-- Group By Controls -->
                    <div class="breakdown-controls">
                        <div class="control-group">
                            <label>Group by:</label>
                            <div class="group-buttons">
                                <button class="mdc-button group-btn active" data-group="namespace">Namespace</button>
                                <button class="mdc-button group-btn" data-group="service">Service</button>
                                <button class="mdc-button group-btn" data-group="cluster">Cluster</button>
                                <button class="mdc-button group-btn" data-group="resource">Resource Type</button>
                            </div>
                        </div>
                    </div>

                    <!-- Cost Breakdown Table -->
                    <div class="cost-breakdown-table" id="cost-breakdown-table">
                        <!-- Breakdown data will be rendered here -->
                    </div>
                </div>

                <!-- Recommendations Tab -->
                <div class="costs-tab recommendations-tab" id="recommendations-tab" style="display: none;">
                    <div class="recommendations-section">
                        <div class="section-header">
                            <h2>Cost Optimization Recommendations</h2>
                            <span class="recommendations-count" id="recommendations-count">0 recommendations</span>
                        </div>
                        
                        <div class="recommendations-list" id="recommendations-list">
                            <!-- Recommendations will be rendered here -->
                        </div>
                    </div>

                    <!-- Resource Right-sizing -->
                    <div class="rightsizing-section">
                        <div class="section-header">
                            <h2>Resource Right-sizing Opportunities</h2>
                        </div>
                        <div class="rightsizing-grid" id="rightsizing-grid">
                            <!-- Right-sizing opportunities will be rendered here -->
                        </div>
                    </div>
                </div>

                <!-- Loading state -->
                <div class="loading-container" id="costs-loading" style="display: none;">
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
                    <p>Loading cost data...</p>
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
                this.loadCosts();
            });
        });

        // Navigation tabs
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.switchView(btn.dataset.view);
            });
        });

        // Group by buttons
        document.querySelectorAll('.group-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.group-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.groupBy = btn.dataset.group;
                this.renderBreakdown();
            });
        });

        // Refresh button
        document.getElementById('refresh-costs-btn').addEventListener('click', () => {
            this.loadCosts();
            this.loadRecommendations();
        });
    }

    async loadCosts() {
        this.setLoading(true);

        try {
            // Try to load from API, fallback to mock data
            const response = await this.apiService.get(`/costs?range=${this.timeRange}`);
            this.costs = response.costs || this.getMockCosts();
        } catch (error) {
            console.warn('Failed to load costs from API, using mock data:', error);
            this.costs = this.getMockCosts();
        }

        this.setLoading(false);
        this.renderOverview();
        if (this.currentView === 'breakdown') {
            this.renderBreakdown();
        }
    }

    async loadRecommendations() {
        try {
            const response = await this.apiService.get('/costs/recommendations');
            this.recommendations = response.recommendations || this.getMockRecommendations();
        } catch (error) {
            console.warn('Failed to load recommendations from API, using mock data:', error);
            this.recommendations = this.getMockRecommendations();
        }

        if (this.currentView === 'recommendations') {
            this.renderRecommendations();
        }
    }

    getMockCosts() {
        return {
            total: 2847.32,
            change: -12.5, // percentage change
            monthlyProjection: 3120.45,
            monthlyChange: 8.2,
            potentialSavings: 423.18,
            optimizationScore: 72,
            providers: [
                {
                    name: 'AWS',
                    cost: 1245.67,
                    percentage: 43.7,
                    change: -8.2,
                    services: {
                        'EKS': 456.23,
                        'EC2': 578.91,
                        'EBS': 123.45,
                        'Load Balancer': 87.08
                    }
                },
                {
                    name: 'Azure',
                    cost: 987.34,
                    percentage: 34.7,
                    change: -15.3,
                    services: {
                        'AKS': 345.67,
                        'Virtual Machines': 432.11,
                        'Storage': 134.56,
                        'Application Gateway': 75.00
                    }
                },
                {
                    name: 'GCP',
                    cost: 614.31,
                    percentage: 21.6,
                    change: -18.7,
                    services: {
                        'GKE': 234.56,
                        'Compute Engine': 298.75,
                        'Persistent Disk': 56.00,
                        'Load Balancing': 25.00
                    }
                }
            ],
            breakdown: {
                namespace: [
                    { name: 'production', cost: 1234.56, percentage: 43.4, trend: 'up' },
                    { name: 'staging', cost: 567.89, percentage: 19.9, trend: 'down' },
                    { name: 'development', cost: 345.67, percentage: 12.1, trend: 'stable' },
                    { name: 'monitoring', cost: 234.56, percentage: 8.2, trend: 'up' },
                    { name: 'kube-system', cost: 464.64, percentage: 16.3, trend: 'stable' }
                ],
                service: [
                    { name: 'frontend', cost: 456.78, percentage: 16.0, trend: 'up' },
                    { name: 'backend-api', cost: 678.90, percentage: 23.8, trend: 'down' },
                    { name: 'database', cost: 890.12, percentage: 31.3, trend: 'stable' },
                    { name: 'cache', cost: 234.56, percentage: 8.2, trend: 'down' },
                    { name: 'monitoring', cost: 587.96, percentage: 20.7, trend: 'up' }
                ]
            }
        };
    }

    getMockRecommendations() {
        return [
            {
                id: 'rec-1',
                type: 'rightsizing',
                severity: 'high',
                title: 'Overprovisioned CPU in production namespace',
                description: 'Several deployments in the production namespace are using less than 20% of allocated CPU resources.',
                potentialSavings: 156.78,
                impact: 'high',
                effort: 'low',
                resources: ['frontend-deployment', 'worker-deployment'],
                action: 'Reduce CPU requests from 2 cores to 0.5 cores'
            },
            {
                id: 'rec-2',
                type: 'unused',
                severity: 'medium',
                title: 'Unused persistent volumes',
                description: 'Found 3 persistent volumes that are not attached to any pods.',
                potentialSavings: 89.45,
                impact: 'medium',
                effort: 'low',
                resources: ['pvc-old-data-1', 'pvc-old-data-2', 'pvc-temp-storage'],
                action: 'Delete unused persistent volumes'
            },
            {
                id: 'rec-3',
                type: 'scheduling',
                severity: 'medium',
                title: 'Inefficient node utilization',
                description: 'Consider using spot instances for non-critical workloads to reduce costs.',
                potentialSavings: 234.67,
                impact: 'high',
                effort: 'medium',
                resources: ['development cluster', 'staging cluster'],
                action: 'Migrate development and staging workloads to spot instances'
            },
            {
                id: 'rec-4',
                type: 'storage',
                severity: 'low',
                title: 'Optimize storage classes',
                description: 'Some workloads are using premium storage when standard storage would suffice.',
                potentialSavings: 67.89,
                impact: 'low',
                effort: 'medium',
                resources: ['logs-storage', 'backup-storage'],
                action: 'Change storage class from premium to standard for non-critical data'
            }
        ];
    }

    switchView(view) {
        this.currentView = view;

        // Hide all tabs
        document.querySelectorAll('.costs-tab').forEach(tab => {
            tab.style.display = 'none';
        });

        // Show selected tab
        document.getElementById(`${view}-tab`).style.display = 'block';

        // Load data for the selected view
        switch (view) {
            case 'overview':
                this.renderOverview();
                break;
            case 'breakdown':
                this.renderBreakdown();
                break;
            case 'recommendations':
                this.renderRecommendations();
                break;
        }
    }

    renderOverview() {
        const { total, change, monthlyProjection, monthlyChange, potentialSavings, optimizationScore, providers } = this.costs;

        // Update summary cards
        document.getElementById('total-cost').textContent = `$${total.toLocaleString()}`;
        document.getElementById('total-change').textContent = `${change > 0 ? '+' : ''}${change}%`;
        document.getElementById('total-change').className = `cost-change ${change > 0 ? 'increase' : 'decrease'}`;

        document.getElementById('monthly-projection').textContent = `$${monthlyProjection.toLocaleString()}`;
        document.getElementById('monthly-change').textContent = `${monthlyChange > 0 ? '+' : ''}${monthlyChange}%`;
        document.getElementById('monthly-change').className = `cost-change ${monthlyChange > 0 ? 'increase' : 'decrease'}`;

        document.getElementById('potential-savings').textContent = `$${potentialSavings.toLocaleString()}`;
        document.getElementById('savings-percentage').textContent = `${((potentialSavings / total) * 100).toFixed(1)}% possible`;

        // Update optimization score
        const scoreElement = document.getElementById('optimization-score');
        scoreElement.querySelector('.score-value').textContent = optimizationScore;
        const scoreClass = optimizationScore >= 80 ? 'excellent' :
            optimizationScore >= 60 ? 'good' : 'needs-improvement';
        scoreElement.className = `score-circle ${scoreClass}`;

        // Render provider breakdown
        this.renderProviders(providers);
    }

    renderProviders(providers) {
        const container = document.getElementById('providers-grid');

        container.innerHTML = providers.map(provider => `
            <div class="provider-card">
                <div class="provider-header">
                    <div class="provider-name">
                        <img src="https://via.placeholder.com/24x24/666/fff?text=${provider.name[0]}" alt="${provider.name}">
                        <span>${provider.name}</span>
                    </div>
                    <div class="provider-percentage">${provider.percentage}%</div>
                </div>
                
                <div class="provider-cost">
                    <div class="cost-amount">$${provider.cost.toLocaleString()}</div>
                    <div class="cost-change ${provider.change < 0 ? 'decrease' : 'increase'}">
                        ${provider.change > 0 ? '+' : ''}${provider.change}%
                    </div>
                </div>
                
                <div class="provider-services">
                    ${Object.entries(provider.services).map(([service, cost]) => `
                        <div class="service-cost">
                            <span class="service-name">${service}</span>
                            <span class="service-amount">$${cost.toLocaleString()}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="cost-bar">
                    <div class="cost-fill" style="width: ${provider.percentage}%"></div>
                </div>
            </div>
        `).join('');
    }

    renderBreakdown() {
        const container = document.getElementById('cost-breakdown-table');
        const data = this.costs.breakdown[this.groupBy] || [];

        container.innerHTML = `
            <div class="breakdown-table">
                <div class="table-header">
                    <div class="table-cell">Name</div>
                    <div class="table-cell">Cost</div>
                    <div class="table-cell">Percentage</div>
                    <div class="table-cell">Trend</div>
                    <div class="table-cell">Actions</div>
                </div>
                ${data.map(item => `
                    <div class="table-row">
                        <div class="table-cell">
                            <div class="item-name">
                                <i class="material-icons">${this.getGroupIcon(this.groupBy)}</i>
                                <span>${item.name}</span>
                            </div>
                        </div>
                        <div class="table-cell">$${item.cost.toLocaleString()}</div>
                        <div class="table-cell">${item.percentage}%</div>
                        <div class="table-cell">
                            <div class="trend-indicator trend-${item.trend}">
                                <i class="material-icons">${this.getTrendIcon(item.trend)}</i>
                                <span>${item.trend}</span>
                            </div>
                        </div>
                        <div class="table-cell">
                            <button class="mdc-icon-button" title="View Details">
                                <i class="material-icons">visibility</i>
                            </button>
                            <button class="mdc-icon-button" title="Optimize">
                                <i class="material-icons">tune</i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderRecommendations() {
        const container = document.getElementById('recommendations-list');
        document.getElementById('recommendations-count').textContent = `${this.recommendations.length} recommendations`;

        container.innerHTML = this.recommendations.map(rec => `
            <div class="recommendation-card severity-${rec.severity}">
                <div class="recommendation-header">
                    <div class="rec-icon">
                        <i class="material-icons">${this.getRecommendationIcon(rec.type)}</i>
                    </div>
                    <div class="rec-info">
                        <h3>${rec.title}</h3>
                        <p>${rec.description}</p>
                    </div>
                    <div class="rec-savings">
                        <div class="savings-amount">$${rec.potentialSavings.toLocaleString()}</div>
                        <div class="savings-label">potential savings</div>
                    </div>
                </div>
                
                <div class="recommendation-details">
                    <div class="rec-metrics">
                        <div class="metric">
                            <span class="label">Impact:</span>
                            <span class="value impact-${rec.impact}">${rec.impact}</span>
                        </div>
                        <div class="metric">
                            <span class="label">Effort:</span>
                            <span class="value effort-${rec.effort}">${rec.effort}</span>
                        </div>
                    </div>
                    
                    <div class="rec-resources">
                        <div class="resources-label">Affected resources:</div>
                        <div class="resources-list">
                            ${rec.resources.map(resource => `
                                <span class="resource-tag">${resource}</span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="rec-action">
                        <div class="action-label">Recommended action:</div>
                        <div class="action-text">${rec.action}</div>
                    </div>
                </div>
                
                <div class="recommendation-actions">
                    <button class="mdc-button" data-action="dismiss" data-rec-id="${rec.id}">
                        <span class="mdc-button__label">Dismiss</span>
                    </button>
                    <button class="mdc-button mdc-button--raised" data-action="apply" data-rec-id="${rec.id}">
                        <span class="mdc-button__label">Apply Recommendation</span>
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners for recommendation actions
        container.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = button.dataset.action;
                const recId = button.dataset.recId;
                this.handleRecommendationAction(action, recId);
            });
        });
    }

    getGroupIcon(group) {
        const icons = {
            namespace: 'folder',
            service: 'cloud',
            cluster: 'dns',
            resource: 'widgets'
        };
        return icons[group] || 'category';
    }

    getTrendIcon(trend) {
        const icons = {
            up: 'trending_up',
            down: 'trending_down',
            stable: 'trending_flat'
        };
        return icons[trend] || 'trending_flat';
    }

    getRecommendationIcon(type) {
        const icons = {
            rightsizing: 'tune',
            unused: 'delete_sweep',
            scheduling: 'schedule',
            storage: 'storage'
        };
        return icons[type] || 'lightbulb';
    }

    handleRecommendationAction(action, recId) {
        console.log(`${action} recommendation:`, recId);

        if (action === 'apply') {
            // Show confirmation dialog
            if (confirm('Are you sure you want to apply this recommendation?')) {
                // Implementation for applying recommendation
                this.applyRecommendation(recId);
            }
        } else if (action === 'dismiss') {
            this.dismissRecommendation(recId);
        }
    }

    async applyRecommendation(recId) {
        try {
            await this.apiService.post(`/costs/recommendations/${recId}/apply`);
            this.showSnackbar('Recommendation applied successfully');
            this.loadRecommendations(); // Refresh recommendations
        } catch (error) {
            console.error('Failed to apply recommendation:', error);
            this.showSnackbar('Failed to apply recommendation', 'error');
        }
    }

    dismissRecommendation(recId) {
        this.recommendations = this.recommendations.filter(rec => rec.id !== recId);
        this.renderRecommendations();
    }

    setLoading(loading) {
        this.isLoading = loading;
        const loadingEl = document.getElementById('costs-loading');
        const contentEl = document.querySelector('.costs-page');

        if (loading) {
            loadingEl.style.display = 'flex';
            contentEl.style.opacity = '0.5';
        } else {
            loadingEl.style.display = 'none';
            contentEl.style.opacity = '1';
        }
    }

    startAutoRefresh() {
        // Refresh every 5 minutes for cost data
        setInterval(() => {
            if (!this.isLoading) {
                this.loadCosts();
            }
        }, 300000);
    }

    showSnackbar(message, type = 'info') {
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}
