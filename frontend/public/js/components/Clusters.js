// Clusters Component - Multi-cloud cluster management
class Clusters {
    constructor() {
        this.clusters = [];
        this.filteredClusters = [];
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.refreshInterval = null;
        this.isVisible = false;
    }

    // Render the clusters page
    async render() {
        return `
            <div class="clusters-container">
                <div class="clusters-header">
                    <div class="header-content">
                        <h1 class="mdc-typography--headline4">Clusters</h1>
                        <p class="mdc-typography--body1">Manage your Kubernetes clusters across AWS, Azure, and GCP</p>
                    </div>
                    <div class="header-actions">
                        <button class="mdc-button mdc-button--raised" id="create-cluster-btn">
                            <i class="material-icons mdc-button__icon">add</i>
                            <span class="mdc-button__label">Create Cluster</span>
                        </button>
                    </div>
                </div>

                <!-- Filters and Search -->
                <div class="clusters-controls">
                    <div class="controls-left">
                        <div class="filter-chips">
                            <div class="mdc-chip-set" role="grid">
                                <div class="mdc-chip mdc-chip--selected" role="row" data-filter="all">
                                    <div class="mdc-chip__ripple"></div>
                                    <span role="gridcell">
                                        <span class="mdc-chip__text">All</span>
                                    </span>
                                </div>
                                <div class="mdc-chip" role="row" data-filter="aws">
                                    <div class="mdc-chip__ripple"></div>
                                    <span role="gridcell">
                                        <span class="mdc-chip__text">AWS</span>
                                    </span>
                                </div>
                                <div class="mdc-chip" role="row" data-filter="azure">
                                    <div class="mdc-chip__ripple"></div>
                                    <span role="gridcell">
                                        <span class="mdc-chip__text">Azure</span>
                                    </span>
                                </div>
                                <div class="mdc-chip" role="row" data-filter="gcp">
                                    <div class="mdc-chip__ripple"></div>
                                    <span role="gridcell">
                                        <span class="mdc-chip__text">GCP</span>
                                    </span>
                                </div>
                                <div class="mdc-chip" role="row" data-filter="running">
                                    <div class="mdc-chip__ripple"></div>
                                    <span role="gridcell">
                                        <span class="mdc-chip__text">Running</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="controls-right">
                        <div class="mdc-text-field mdc-text-field--outlined mdc-text-field--with-leading-icon search-field">
                            <i class="material-icons mdc-text-field__icon mdc-text-field__icon--leading">search</i>
                            <input class="mdc-text-field__input" type="text" id="cluster-search" placeholder="Search clusters...">
                            <div class="mdc-notched-outline">
                                <div class="mdc-notched-outline__leading"></div>
                                <div class="mdc-notched-outline__notch">
                                    <label for="cluster-search" class="mdc-floating-label">Search</label>
                                </div>
                                <div class="mdc-notched-outline__trailing"></div>
                            </div>
                        </div>

                        <button class="mdc-icon-button" id="refresh-clusters" title="Refresh">
                            <i class="material-icons">refresh</i>
                        </button>

                        <button class="mdc-icon-button" id="view-toggle" title="Toggle View" data-view="grid">
                            <i class="material-icons">view_list</i>
                        </button>
                    </div>
                </div>

                <!-- Clusters Content -->
                <div class="clusters-content">
                    <div class="clusters-grid-view" id="clusters-grid">
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

                    <div class="clusters-list-view" id="clusters-list" style="display: none;">
                        <!-- List view content will be populated here -->
                    </div>
                </div>
            </div>

            <!-- Create Cluster Modal -->
            <div class="mdc-dialog" id="create-cluster-dialog">
                <div class="mdc-dialog__container">
                    <div class="mdc-dialog__surface">
                        <h2 class="mdc-dialog__title">Create New Cluster</h2>
                        <div class="mdc-dialog__content">
                            <form id="create-cluster-form">
                                <div class="form-row">
                                    <div class="mdc-text-field mdc-text-field--outlined">
                                        <input type="text" id="cluster-name" class="mdc-text-field__input" required>
                                        <div class="mdc-notched-outline">
                                            <div class="mdc-notched-outline__leading"></div>
                                            <div class="mdc-notched-outline__notch">
                                                <label for="cluster-name" class="mdc-floating-label">Cluster Name</label>
                                            </div>
                                            <div class="mdc-notched-outline__trailing"></div>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-row">
                                    <div class="mdc-select mdc-select--outlined">
                                        <div class="mdc-select__anchor" id="provider-select">
                                            <span class="mdc-notched-outline">
                                                <span class="mdc-notched-outline__leading"></span>
                                                <span class="mdc-notched-outline__notch">
                                                    <span class="mdc-floating-label">Cloud Provider</span>
                                                </span>
                                                <span class="mdc-notched-outline__trailing"></span>
                                            </span>
                                            <span class="mdc-select__selected-text-container">
                                                <span class="mdc-select__selected-text"></span>
                                            </span>
                                            <span class="mdc-select__dropdown-icon">
                                                <svg class="mdc-select__dropdown-icon-graphic" viewBox="7 10 10 5">
                                                    <polygon class="mdc-select__dropdown-icon-inactive" stroke="none" fill-rule="evenodd" points="7 10 12 15 17 10"></polygon>
                                                    <polygon class="mdc-select__dropdown-icon-active" stroke="none" fill-rule="evenodd" points="7 15 12 10 17 15"></polygon>
                                                </svg>
                                            </span>
                                        </div>
                                        <div class="mdc-select__menu mdc-menu mdc-menu-surface mdc-menu-surface--fullwidth">
                                            <ul class="mdc-list" role="listbox">
                                                <li class="mdc-list-item" aria-selected="false" data-value="aws" role="option">
                                                    <span class="mdc-list-item__ripple"></span>
                                                    <span class="mdc-list-item__text">Amazon Web Services (EKS)</span>
                                                </li>
                                                <li class="mdc-list-item" aria-selected="false" data-value="azure" role="option">
                                                    <span class="mdc-list-item__ripple"></span>
                                                    <span class="mdc-list-item__text">Microsoft Azure (AKS)</span>
                                                </li>
                                                <li class="mdc-list-item" aria-selected="false" data-value="gcp" role="option">
                                                    <span class="mdc-list-item__ripple"></span>
                                                    <span class="mdc-list-item__text">Google Cloud Platform (GKE)</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-row">
                                    <div class="mdc-text-field mdc-text-field--outlined">
                                        <input type="text" id="cluster-region" class="mdc-text-field__input" required>
                                        <div class="mdc-notched-outline">
                                            <div class="mdc-notched-outline__leading"></div>
                                            <div class="mdc-notched-outline__notch">
                                                <label for="cluster-region" class="mdc-floating-label">Region</label>
                                            </div>
                                            <div class="mdc-notched-outline__trailing"></div>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-row">
                                    <div class="mdc-text-field mdc-text-field--outlined">
                                        <input type="number" id="cluster-nodes" class="mdc-text-field__input" value="3" min="1" max="100" required>
                                        <div class="mdc-notched-outline">
                                            <div class="mdc-notched-outline__leading"></div>
                                            <div class="mdc-notched-outline__notch">
                                                <label for="cluster-nodes" class="mdc-floating-label">Initial Node Count</label>
                                            </div>
                                            <div class="mdc-notched-outline__trailing"></div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="mdc-dialog__actions">
                            <button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="cancel">
                                <div class="mdc-button__ripple"></div>
                                <span class="mdc-button__label">Cancel</span>
                            </button>
                            <button type="button" class="mdc-button mdc-button--raised mdc-dialog__button" data-mdc-dialog-action="accept" id="create-cluster-submit">
                                <div class="mdc-button__ripple"></div>
                                <span class="mdc-button__label">Create Cluster</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="mdc-dialog__scrim"></div>
            </div>
        `;
    }

    // Initialize clusters page
    async init() {
        this.isVisible = true;
        await this.loadClusters();
        this.bindEvents();
        this.initializeComponents();
        this.startAutoRefresh();
    }

    // Load clusters data
    async loadClusters() {
        try {
            const result = await APIService.getClusters();
            if (result.success) {
                this.clusters = result.data || [];
            } else {
                this.clusters = this.getMockClusters();
            }
        } catch (error) {
            console.error('Error loading clusters:', error);
            this.clusters = this.getMockClusters();
        }

        this.applyFilters();
        this.renderClusters();
    }

    async fetchClusters() {
        try {
            const response = await fetch('/api/clusters');
            if (!response.ok) {
                throw new Error('Failed to fetch clusters');
            }
            const data = await response.json();
            this.clusters = data;
            this.filteredClusters = data;
        } catch (error) {
            console.error('Error fetching clusters:', error);
        }
    }

    // Apply current filters and search
    applyFilters() {
        let filtered = [...this.clusters];

        // Apply provider filter
        if (this.currentFilter !== 'all') {
            if (this.currentFilter === 'running') {
                filtered = filtered.filter(cluster => cluster.status === 'running');
            } else {
                filtered = filtered.filter(cluster => cluster.provider === this.currentFilter);
            }
        }

        // Apply search filter
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(cluster =>
                cluster.name.toLowerCase().includes(query) ||
                cluster.provider.toLowerCase().includes(query) ||
                cluster.region.toLowerCase().includes(query)
            );
        }

        this.filteredClusters = filtered;
    }

    // Render clusters in current view mode
    renderClusters() {
        const viewMode = document.getElementById('view-toggle')?.dataset.view || 'grid';

        if (viewMode === 'grid') {
            this.renderGridView();
        } else {
            this.renderListView();
        }
    }

    // Render clusters in grid view
    renderGridView() {
        const container = document.getElementById('clusters-grid');
        if (!container) return;

        if (this.filteredClusters.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }

        const clustersHTML = this.filteredClusters.map(cluster => `
            <div class="cluster-card detailed" data-cluster-id="${cluster.id}">
                <div class="cluster-card-header">
                    <div class="cluster-info">
                        <h3 class="cluster-name">${cluster.name}</h3>
                        <div class="cluster-provider">
                            <span class="provider-badge provider-${cluster.provider}">
                                ${cluster.provider.toUpperCase()}
                            </span>
                            <span class="cluster-region">${cluster.region}</span>
                        </div>
                    </div>
                    <div class="cluster-status">
                        <span class="status-indicator status-${cluster.status}"></span>
                        <span class="status-text">${this.formatStatus(cluster.status)}</span>
                    </div>
                </div>

                <div class="cluster-metrics-detailed">
                    <div class="metrics-row">
                        <div class="metric-item">
                            <i class="material-icons">computer</i>
                            <div class="metric-content">
                                <span class="metric-value">${cluster.nodes || 0}</span>
                                <span class="metric-label">Nodes</span>
                            </div>
                        </div>
                        <div class="metric-item">
                            <i class="material-icons">widgets</i>
                            <div class="metric-content">
                                <span class="metric-value">${cluster.pods || 0}</span>
                                <span class="metric-label">Pods</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="metrics-row">
                        <div class="metric-item">
                            <i class="material-icons">memory</i>
                            <div class="metric-content">
                                <span class="metric-value">${cluster.cpu_usage || 0}%</span>
                                <span class="metric-label">CPU Usage</span>
                            </div>
                            <div class="usage-bar">
                                <div class="usage-fill" style="width: ${cluster.cpu_usage || 0}%"></div>
                            </div>
                        </div>
                        <div class="metric-item">
                            <i class="material-icons">storage</i>
                            <div class="metric-content">
                                <span class="metric-value">${cluster.memory_usage || 0}%</span>
                                <span class="metric-label">Memory Usage</span>
                            </div>
                            <div class="usage-bar">
                                <div class="usage-fill" style="width: ${cluster.memory_usage || 0}%"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="cluster-actions">
                    <button class="mdc-button mdc-button--outlined" data-action="view-cluster" data-cluster-id="${cluster.id}">
                        <span class="mdc-button__label">View Details</span>
                    </button>
                    <button class="mdc-icon-button" title="Scale Cluster" data-action="scale-cluster" data-cluster-id="${cluster.id}">
                        <i class="material-icons">expand</i>
                    </button>
                    <button class="mdc-icon-button" title="Monitoring" data-action="monitor-cluster" data-cluster-id="${cluster.id}">
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

    // Render clusters in list view
    renderListView() {
        const container = document.getElementById('clusters-list');
        if (!container) return;

        if (this.filteredClusters.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }

        const clustersHTML = `
            <div class="clusters-table">
                <div class="table-header">
                    <div class="table-row header-row">
                        <div class="table-cell">Name</div>
                        <div class="table-cell">Provider</div>
                        <div class="table-cell">Region</div>
                        <div class="table-cell">Status</div>
                        <div class="table-cell">Nodes</div>
                        <div class="table-cell">Pods</div>
                        <div class="table-cell">CPU</div>
                        <div class="table-cell">Memory</div>
                        <div class="table-cell">Actions</div>
                    </div>
                </div>
                <div class="table-body">
                    ${this.filteredClusters.map(cluster => `
                        <div class="table-row cluster-row" data-cluster-id="${cluster.id}">
                            <div class="table-cell">
                                <div class="cluster-name-cell">
                                    <strong>${cluster.name}</strong>
                                </div>
                            </div>
                            <div class="table-cell">
                                <span class="provider-badge provider-${cluster.provider}">
                                    ${cluster.provider.toUpperCase()}
                                </span>
                            </div>
                            <div class="table-cell">${cluster.region}</div>
                            <div class="table-cell">
                                <span class="status-badge status-${cluster.status}">${this.formatStatus(cluster.status)}</span>
                            </div>
                            <div class="table-cell">${cluster.nodes || 0}</div>
                            <div class="table-cell">${cluster.pods || 0}</div>
                            <div class="table-cell">
                                <div class="usage-indicator">
                                    <span>${cluster.cpu_usage || 0}%</span>
                                    <div class="usage-bar-small">
                                        <div class="usage-fill" style="width: ${cluster.cpu_usage || 0}%"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="table-cell">
                                <div class="usage-indicator">
                                    <span>${cluster.memory_usage || 0}%</span>
                                    <div class="usage-bar-small">
                                        <div class="usage-fill" style="width: ${cluster.memory_usage || 0}%"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="table-cell">
                                <div class="action-buttons">
                                    <button class="mdc-icon-button" title="View Details" data-action="view-cluster" data-cluster-id="${cluster.id}">
                                        <i class="material-icons">visibility</i>
                                    </button>
                                    <button class="mdc-icon-button" title="Monitoring" data-action="monitor-cluster" data-cluster-id="${cluster.id}">
                                        <i class="material-icons">monitoring</i>
                                    </button>
                                    <button class="mdc-icon-button" title="More" data-action="cluster-menu" data-cluster-id="${cluster.id}">
                                        <i class="material-icons">more_vert</i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        container.innerHTML = clustersHTML;
    }

    // Render empty state
    renderEmptyState() {
        return `
            <div class="empty-state">
                <i class="material-icons">dns</i>
                <h3>No clusters found</h3>
                <p>
                    ${this.searchQuery || this.currentFilter !== 'all'
                ? 'No clusters match your current filters'
                : 'Create your first Kubernetes cluster to get started'}
                </p>
                ${!this.searchQuery && this.currentFilter === 'all' ? `
                    <button class="mdc-button mdc-button--raised" id="empty-create-cluster">
                        <i class="material-icons mdc-button__icon">add</i>
                        <span class="mdc-button__label">Create Cluster</span>
                    </button>
                ` : ''}
            </div>
        `;
    }

    // Format status text
    formatStatus(status) {
        const statusMap = {
            'running': 'Running',
            'pending': 'Pending',
            'stopping': 'Stopping',
            'stopped': 'Stopped',
            'error': 'Error'
        };
        return statusMap[status] || status;
    }

    // Bind event listeners
    bindEvents() {
        // Create cluster button
        const createButton = document.getElementById('create-cluster-btn');
        createButton?.addEventListener('click', () => this.showCreateClusterDialog());

        // Filter chips
        document.querySelectorAll('.mdc-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const filter = chip.dataset.filter;
                this.setFilter(filter);
            });
        });

        // Search input
        const searchInput = document.getElementById('cluster-search');
        searchInput?.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.applyFilters();
            this.renderClusters();
        });

        // Refresh button
        const refreshButton = document.getElementById('refresh-clusters');
        refreshButton?.addEventListener('click', () => this.refreshClusters());

        // View toggle
        const viewToggle = document.getElementById('view-toggle');
        viewToggle?.addEventListener('click', () => this.toggleView());

        // Cluster actions
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-action]')) {
                const button = e.target.closest('[data-action]');
                const action = button.dataset.action;
                const clusterId = button.dataset.clusterId;
                this.handleClusterAction(action, clusterId);
            }
        });

        // Create cluster form submission
        const createForm = document.getElementById('create-cluster-form');
        createForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCreateCluster();
        });
    }

    // Initialize Material Components
    initializeComponents() {
        // Initialize dialogs, selects, text fields, etc.
        if (window.mdc) {
            const dialog = document.querySelector('#create-cluster-dialog');
            if (dialog && !dialog.mdcDialog) {
                dialog.mdcDialog = new mdc.dialog.MDCDialog(dialog);
            }

            const selects = document.querySelectorAll('.mdc-select');
            selects.forEach(select => {
                if (!select.mdcSelect) {
                    select.mdcSelect = new mdc.select.MDCSelect(select);
                }
            });

            const textFields = document.querySelectorAll('.mdc-text-field');
            textFields.forEach(field => {
                if (!field.mdcTextField) {
                    field.mdcTextField = new mdc.textField.MDCTextField(field);
                }
            });
        }
    }

    // Set filter
    setFilter(filter) {
        // Update chip selection
        document.querySelectorAll('.mdc-chip').forEach(chip => {
            chip.classList.remove('mdc-chip--selected');
        });
        document.querySelector(`[data-filter="${filter}"]`)?.classList.add('mdc-chip--selected');

        this.currentFilter = filter;
        this.applyFilters();
        this.renderClusters();
    }

    // Toggle view mode
    toggleView() {
        const viewToggle = document.getElementById('view-toggle');
        const currentView = viewToggle.dataset.view;
        const newView = currentView === 'grid' ? 'list' : 'grid';

        viewToggle.dataset.view = newView;
        viewToggle.querySelector('i').textContent = newView === 'grid' ? 'view_list' : 'view_module';
        viewToggle.title = newView === 'grid' ? 'Switch to List View' : 'Switch to Grid View';

        // Show/hide appropriate containers
        const gridContainer = document.getElementById('clusters-grid');
        const listContainer = document.getElementById('clusters-list');

        if (newView === 'grid') {
            gridContainer.style.display = 'block';
            listContainer.style.display = 'none';
            this.renderGridView();
        } else {
            gridContainer.style.display = 'none';
            listContainer.style.display = 'block';
            this.renderListView();
        }
    }

    // Show create cluster dialog
    showCreateClusterDialog() {
        const dialog = document.querySelector('#create-cluster-dialog');
        if (dialog?.mdcDialog) {
            dialog.mdcDialog.open();
        }
    }

    // Handle cluster actions
    handleClusterAction(action, clusterId) {
        switch (action) {
            case 'view-cluster':
                this.viewClusterDetails(clusterId);
                break;
            case 'scale-cluster':
                this.showScaleDialog(clusterId);
                break;
            case 'monitor-cluster':
                App.navigateToPage('monitoring', { clusterId });
                break;
            case 'cluster-menu':
                this.showClusterMenu(clusterId);
                break;
        }
    }

    // Handle create cluster
    async handleCreateCluster() {
        const formData = {
            name: document.getElementById('cluster-name').value,
            provider: document.querySelector('#provider-select .mdc-select__selected-text').textContent.trim(),
            region: document.getElementById('cluster-region').value,
            nodes: parseInt(document.getElementById('cluster-nodes').value)
        };

        try {
            const result = await APIService.createCluster(formData);
            if (result.success) {
                // Close dialog
                const dialog = document.querySelector('#create-cluster-dialog');
                dialog?.mdcDialog?.close();

                // Refresh clusters
                await this.refreshClusters();

                // Show success message
                this.showNotification('Cluster creation started successfully', 'success');
            } else {
                this.showNotification(result.error || 'Failed to create cluster', 'error');
            }
        } catch (error) {
            console.error('Error creating cluster:', error);
            this.showNotification('Failed to create cluster', 'error');
        }
    }

    // View cluster details
    viewClusterDetails(clusterId) {
        const cluster = this.clusters.find(c => c.id === clusterId);
        if (cluster) {
            // Navigate to detailed cluster view or show details modal
            App.navigateToPage('workloads', { clusterId });
        }
    }

    // Show scale dialog
    showScaleDialog(clusterId) {
        // Implementation for scale dialog
        console.log('Show scale dialog for cluster:', clusterId);
    }

    // Show cluster menu
    showClusterMenu(clusterId) {
        // Implementation for cluster context menu
        console.log('Show cluster menu for:', clusterId);
    }

    // Refresh clusters
    async refreshClusters() {
        const refreshButton = document.getElementById('refresh-clusters');
        if (refreshButton) {
            refreshButton.classList.add('spinning');
            setTimeout(() => refreshButton.classList.remove('spinning'), 1000);
        }

        await this.loadClusters();
    }

    // Start auto-refresh
    startAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        this.refreshInterval = setInterval(() => {
            if (this.isVisible) {
                this.loadClusters();
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

    // Show notification
    showNotification(message, type = 'info') {
        // Implementation for notifications
        console.log(`${type}: ${message}`);
    }

    // Mock data for fallback
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
                memory_usage: 73,
                created_at: new Date().toISOString()
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
                memory_usage: 52,
                created_at: new Date().toISOString()
            },
            {
                id: 'cluster-3',
                name: 'dev-central',
                provider: 'azure',
                region: 'centralus',
                status: 'pending',
                nodes: 2,
                pods: 12,
                cpu_usage: 32,
                memory_usage: 38,
                created_at: new Date().toISOString()
            },
            {
                id: 'cluster-4',
                name: 'test-environment',
                provider: 'aws',
                region: 'eu-west-1',
                status: 'running',
                nodes: 1,
                pods: 8,
                cpu_usage: 25,
                memory_usage: 30,
                created_at: new Date().toISOString()
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
function createClusters() {
    const clusters = new Clusters();
    const appContainer = document.getElementById('app');
    if (appContainer) {
        clusters.render().then(html => {
            appContainer.innerHTML = html;
            clusters.initialize();
        });
    }
    return clusters;
}

// Make Clusters class available globally for browser usage
if (typeof window !== 'undefined') {
    window.Clusters = Clusters;
    window.createClusters = createClusters;
}

// CommonJS export for Node.js tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Clusters, createClusters };
}
