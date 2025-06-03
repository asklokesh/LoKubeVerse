// Workloads Component - Namespace and Pod Management
class Workloads {
    constructor() {
        this.apiService = new APIService();
        this.currentNamespace = 'default';
        this.workloads = [];
        this.isLoading = false;
        this.viewMode = 'grid'; // grid or list
        this.filters = {
            search: '',
            status: 'all',
            type: 'all'
        };

        this.init();
    }

    init() {
        this.container = document.getElementById('workloads-content');
        this.render();
        this.loadWorkloads();
        this.setupEventListeners();
        this.startAutoRefresh();
    }

    render() {
        this.container.innerHTML = `
            <div class="workloads-page">
                <!-- Header with controls -->
                <div class="page-header">
                    <div class="header-title">
                        <h1>Workloads</h1>
                        <span class="subtitle">Manage pods, deployments, and services</span>
                    </div>
                    <div class="header-actions">
                        <button class="mdc-button mdc-button--raised" id="deploy-workload-btn">
                            <span class="mdc-button__label">Deploy Workload</span>
                        </button>
                        <button class="mdc-icon-button" id="refresh-workloads-btn" title="Refresh">
                            <i class="material-icons">refresh</i>
                        </button>
                    </div>
                </div>

                <!-- Namespace selector and filters -->
                <div class="workloads-controls">
                    <div class="namespace-selector">
                        <label class="mdc-text-field mdc-text-field--outlined namespace-field">
                            <span class="mdc-notched-outline">
                                <span class="mdc-notched-outline__leading"></span>
                                <span class="mdc-notched-outline__notch">
                                    <span class="mdc-floating-label">Namespace</span>
                                </span>
                                <span class="mdc-notched-outline__trailing"></span>
                            </span>
                            <select class="mdc-text-field__input" id="namespace-select">
                                <option value="default">default</option>
                                <option value="kube-system">kube-system</option>
                                <option value="kube-public">kube-public</option>
                            </select>
                        </label>
                    </div>

                    <div class="filters-row">
                        <label class="mdc-text-field mdc-text-field--outlined search-field">
                            <span class="mdc-notched-outline">
                                <span class="mdc-notched-outline__leading"></span>
                                <span class="mdc-notched-outline__notch">
                                    <span class="mdc-floating-label">Search workloads...</span>
                                </span>
                                <span class="mdc-notched-outline__trailing"></span>
                            </span>
                            <input type="text" class="mdc-text-field__input" id="workload-search">
                        </label>

                        <label class="mdc-text-field mdc-text-field--outlined filter-field">
                            <span class="mdc-notched-outline">
                                <span class="mdc-notched-outline__leading"></span>
                                <span class="mdc-notched-outline__notch">
                                    <span class="mdc-floating-label">Status</span>
                                </span>
                                <span class="mdc-notched-outline__trailing"></span>
                            </span>
                            <select class="mdc-text-field__input" id="status-filter">
                                <option value="all">All Status</option>
                                <option value="running">Running</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                                <option value="succeeded">Succeeded</option>
                            </select>
                        </label>

                        <label class="mdc-text-field mdc-text-field--outlined filter-field">
                            <span class="mdc-notched-outline">
                                <span class="mdc-notched-outline__leading"></span>
                                <span class="mdc-notched-outline__notch">
                                    <span class="mdc-floating-label">Type</span>
                                </span>
                                <span class="mdc-notched-outline__trailing"></span>
                            </span>
                            <select class="mdc-text-field__input" id="type-filter">
                                <option value="all">All Types</option>
                                <option value="deployment">Deployments</option>
                                <option value="pod">Pods</option>
                                <option value="service">Services</option>
                                <option value="job">Jobs</option>
                            </select>
                        </label>

                        <div class="view-toggle">
                            <button class="mdc-icon-button view-btn active" data-view="grid" title="Grid View">
                                <i class="material-icons">grid_view</i>
                            </button>
                            <button class="mdc-icon-button view-btn" data-view="list" title="List View">
                                <i class="material-icons">view_list</i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Loading state -->
                <div class="loading-container" id="workloads-loading" style="display: none;">
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
                    <p>Loading workloads...</p>
                </div>

                <!-- Workloads grid/list -->
                <div class="workloads-container" id="workloads-grid">
                    <!-- Workloads will be rendered here -->
                </div>

                <!-- Empty state -->
                <div class="empty-state" id="workloads-empty" style="display: none;">
                    <i class="material-icons">workspaces</i>
                    <h3>No workloads found</h3>
                    <p>Deploy your first workload to get started</p>
                    <button class="mdc-button mdc-button--raised">
                        <span class="mdc-button__label">Deploy Workload</span>
                    </button>
                </div>
            </div>

            <!-- Deploy Workload Modal -->
            <div class="mdc-dialog" id="deploy-workload-dialog">
                <div class="mdc-dialog__container">
                    <div class="mdc-dialog__surface">
                        <h2 class="mdc-dialog__title">Deploy Workload</h2>
                        <div class="mdc-dialog__content">
                            <div class="deploy-form">
                                <div class="form-section">
                                    <h3>Basic Information</h3>
                                    <div class="form-row">
                                        <label class="mdc-text-field mdc-text-field--outlined">
                                            <span class="mdc-notched-outline">
                                                <span class="mdc-notched-outline__leading"></span>
                                                <span class="mdc-notched-outline__notch">
                                                    <span class="mdc-floating-label">Name</span>
                                                </span>
                                                <span class="mdc-notched-outline__trailing"></span>
                                            </span>
                                            <input type="text" class="mdc-text-field__input" id="workload-name" required>
                                        </label>

                                        <label class="mdc-text-field mdc-text-field--outlined">
                                            <span class="mdc-notched-outline">
                                                <span class="mdc-notched-outline__leading"></span>
                                                <span class="mdc-notched-outline__notch">
                                                    <span class="mdc-floating-label">Type</span>
                                                </span>
                                                <span class="mdc-notched-outline__trailing"></span>
                                            </span>
                                            <select class="mdc-text-field__input" id="workload-type">
                                                <option value="deployment">Deployment</option>
                                                <option value="pod">Pod</option>
                                                <option value="job">Job</option>
                                                <option value="cronjob">CronJob</option>
                                            </select>
                                        </label>
                                    </div>
                                </div>

                                <div class="form-section">
                                    <h3>Container Configuration</h3>
                                    <div class="form-row">
                                        <label class="mdc-text-field mdc-text-field--outlined">
                                            <span class="mdc-notched-outline">
                                                <span class="mdc-notched-outline__leading"></span>
                                                <span class="mdc-notched-outline__notch">
                                                    <span class="mdc-floating-label">Image</span>
                                                </span>
                                                <span class="mdc-notched-outline__trailing"></span>
                                            </span>
                                            <input type="text" class="mdc-text-field__input" id="container-image" 
                                                   placeholder="nginx:latest" required>
                                        </label>

                                        <label class="mdc-text-field mdc-text-field--outlined">
                                            <span class="mdc-notched-outline">
                                                <span class="mdc-notched-outline__leading"></span>
                                                <span class="mdc-notched-outline__notch">
                                                    <span class="mdc-floating-label">Replicas</span>
                                                </span>
                                                <span class="mdc-notched-outline__trailing"></span>
                                            </span>
                                            <input type="number" class="mdc-text-field__input" id="replicas" 
                                                   value="1" min="1" max="100">
                                        </label>
                                    </div>
                                </div>

                                <div class="form-section">
                                    <h3>Resource Limits</h3>
                                    <div class="form-row">
                                        <label class="mdc-text-field mdc-text-field--outlined">
                                            <span class="mdc-notched-outline">
                                                <span class="mdc-notched-outline__leading"></span>
                                                <span class="mdc-notched-outline__notch">
                                                    <span class="mdc-floating-label">CPU (cores)</span>
                                                </span>
                                                <span class="mdc-notched-outline__trailing"></span>
                                            </span>
                                            <input type="text" class="mdc-text-field__input" id="cpu-limit" 
                                                   placeholder="0.5">
                                        </label>

                                        <label class="mdc-text-field mdc-text-field--outlined">
                                            <span class="mdc-notched-outline">
                                                <span class="mdc-notched-outline__leading"></span>
                                                <span class="mdc-notched-outline__notch">
                                                    <span class="mdc-floating-label">Memory (Mi)</span>
                                                </span>
                                                <span class="mdc-notched-outline__trailing"></span>
                                            </span>
                                            <input type="text" class="mdc-text-field__input" id="memory-limit" 
                                                   placeholder="512">
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="mdc-dialog__actions">
                            <button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="close">
                                <span class="mdc-button__label">Cancel</span>
                            </button>
                            <button type="button" class="mdc-button mdc-button--raised mdc-dialog__button" 
                                    data-mdc-dialog-action="deploy" id="deploy-confirm-btn">
                                <span class="mdc-button__label">Deploy</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="mdc-dialog__scrim"></div>
            </div>
        `;
    }

    setupEventListeners() {
        // Namespace selection
        document.getElementById('namespace-select').addEventListener('change', (e) => {
            this.currentNamespace = e.target.value;
            this.loadWorkloads();
        });

        // Search and filters
        document.getElementById('workload-search').addEventListener('input',
            this.debounce((e) => {
                this.filters.search = e.target.value.toLowerCase();
                this.filterWorkloads();
            }, 300)
        );

        document.getElementById('status-filter').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.filterWorkloads();
        });

        document.getElementById('type-filter').addEventListener('change', (e) => {
            this.filters.type = e.target.value;
            this.filterWorkloads();
        });

        // View toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.viewMode = btn.dataset.view;
                this.renderWorkloads();
            });
        });

        // Refresh button
        document.getElementById('refresh-workloads-btn').addEventListener('click', () => {
            this.loadWorkloads();
        });

        // Deploy workload
        document.getElementById('deploy-workload-btn').addEventListener('click', () => {
            this.showDeployModal();
        });

        // Deploy form submission
        document.getElementById('deploy-confirm-btn').addEventListener('click', () => {
            this.deployWorkload();
        });
    }

    async loadWorkloads() {
        this.setLoading(true);

        try {
            // Try to load from API, fallback to mock data
            const response = await this.apiService.get(`/workloads/${this.currentNamespace}`);
            this.workloads = response.workloads || this.getMockWorkloads();
        } catch (error) {
            console.warn('Failed to load workloads from API, using mock data:', error);
            this.workloads = this.getMockWorkloads();
        }

        this.setLoading(false);
        this.renderWorkloads();
    }

    getMockWorkloads() {
        return [
            {
                id: '1',
                name: 'frontend-deployment',
                type: 'deployment',
                status: 'running',
                replicas: { ready: 3, desired: 3 },
                image: 'nginx:1.21',
                age: '2d',
                cpu: '0.1',
                memory: '128Mi',
                restarts: 0
            },
            {
                id: '2',
                name: 'backend-api',
                type: 'deployment',
                status: 'running',
                replicas: { ready: 2, desired: 2 },
                image: 'myapp:latest',
                age: '1d',
                cpu: '0.3',
                memory: '512Mi',
                restarts: 2
            },
            {
                id: '3',
                name: 'database-migration',
                type: 'job',
                status: 'succeeded',
                replicas: { ready: 1, desired: 1 },
                image: 'migrate:v1.0',
                age: '3h',
                cpu: '0.05',
                memory: '64Mi',
                restarts: 0
            },
            {
                id: '4',
                name: 'redis-cache',
                type: 'deployment',
                status: 'pending',
                replicas: { ready: 0, desired: 1 },
                image: 'redis:6.2',
                age: '5m',
                cpu: '0.0',
                memory: '0Mi',
                restarts: 0
            }
        ];
    }

    filterWorkloads() {
        this.renderWorkloads();
    }

    renderWorkloads() {
        const container = document.getElementById('workloads-grid');
        const filtered = this.workloads.filter(workload => {
            const matchesSearch = !this.filters.search ||
                workload.name.toLowerCase().includes(this.filters.search) ||
                workload.image.toLowerCase().includes(this.filters.search);

            const matchesStatus = this.filters.status === 'all' ||
                workload.status === this.filters.status;

            const matchesType = this.filters.type === 'all' ||
                workload.type === this.filters.type;

            return matchesSearch && matchesStatus && matchesType;
        });

        if (filtered.length === 0) {
            document.getElementById('workloads-empty').style.display = 'block';
            container.style.display = 'none';
            return;
        }

        document.getElementById('workloads-empty').style.display = 'none';
        container.style.display = 'block';

        if (this.viewMode === 'grid') {
            container.className = 'workloads-grid';
            container.innerHTML = filtered.map(workload => this.renderWorkloadCard(workload)).join('');
        } else {
            container.className = 'workloads-list';
            container.innerHTML = `
                <div class="list-header">
                    <div class="list-cell">Name</div>
                    <div class="list-cell">Type</div>
                    <div class="list-cell">Status</div>
                    <div class="list-cell">Replicas</div>
                    <div class="list-cell">Age</div>
                    <div class="list-cell">Restarts</div>
                    <div class="list-cell">Actions</div>
                </div>
                ${filtered.map(workload => this.renderWorkloadRow(workload)).join('')}
            `;
        }

        // Add event listeners for workload actions
        this.setupWorkloadActions();
    }

    renderWorkloadCard(workload) {
        const statusClass = `status-${workload.status}`;
        const statusIcon = this.getStatusIcon(workload.status);

        return `
            <div class="workload-card" data-workload-id="${workload.id}">
                <div class="workload-header">
                    <div class="workload-name">
                        <i class="material-icons">${this.getTypeIcon(workload.type)}</i>
                        <span>${workload.name}</span>
                    </div>
                    <div class="workload-status ${statusClass}">
                        <i class="material-icons">${statusIcon}</i>
                        <span>${workload.status}</span>
                    </div>
                </div>
                
                <div class="workload-info">
                    <div class="info-row">
                        <span class="label">Type:</span>
                        <span class="value">${workload.type}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Image:</span>
                        <span class="value">${workload.image}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Replicas:</span>
                        <span class="value">${workload.replicas.ready}/${workload.replicas.desired}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Age:</span>
                        <span class="value">${workload.age}</span>
                    </div>
                </div>

                <div class="workload-metrics">
                    <div class="metric">
                        <span class="metric-label">CPU</span>
                        <span class="metric-value">${workload.cpu} cores</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Memory</span>
                        <span class="metric-value">${workload.memory}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Restarts</span>
                        <span class="metric-value">${workload.restarts}</span>
                    </div>
                </div>

                <div class="workload-actions">
                    <button class="mdc-icon-button" title="View Logs" data-action="logs">
                        <i class="material-icons">article</i>
                    </button>
                    <button class="mdc-icon-button" title="Scale" data-action="scale">
                        <i class="material-icons">open_in_full</i>
                    </button>
                    <button class="mdc-icon-button" title="Edit" data-action="edit">
                        <i class="material-icons">edit</i>
                    </button>
                    <button class="mdc-icon-button" title="Delete" data-action="delete">
                        <i class="material-icons">delete</i>
                    </button>
                </div>
            </div>
        `;
    }

    renderWorkloadRow(workload) {
        const statusClass = `status-${workload.status}`;
        const statusIcon = this.getStatusIcon(workload.status);

        return `
            <div class="workload-row" data-workload-id="${workload.id}">
                <div class="list-cell">
                    <div class="workload-name-cell">
                        <i class="material-icons">${this.getTypeIcon(workload.type)}</i>
                        <span>${workload.name}</span>
                    </div>
                </div>
                <div class="list-cell">${workload.type}</div>
                <div class="list-cell">
                    <div class="status-badge ${statusClass}">
                        <i class="material-icons">${statusIcon}</i>
                        <span>${workload.status}</span>
                    </div>
                </div>
                <div class="list-cell">${workload.replicas.ready}/${workload.replicas.desired}</div>
                <div class="list-cell">${workload.age}</div>
                <div class="list-cell">${workload.restarts}</div>
                <div class="list-cell">
                    <div class="row-actions">
                        <button class="mdc-icon-button" title="View Logs" data-action="logs">
                            <i class="material-icons">article</i>
                        </button>
                        <button class="mdc-icon-button" title="Scale" data-action="scale">
                            <i class="material-icons">open_in_full</i>
                        </button>
                        <button class="mdc-icon-button" title="Edit" data-action="edit">
                            <i class="material-icons">edit</i>
                        </button>
                        <button class="mdc-icon-button" title="Delete" data-action="delete">
                            <i class="material-icons">delete</i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    setupWorkloadActions() {
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const action = button.dataset.action;
                const workloadCard = button.closest('[data-workload-id]');
                const workloadId = workloadCard.dataset.workloadId;
                const workload = this.workloads.find(w => w.id === workloadId);

                this.handleWorkloadAction(action, workload);
            });
        });
    }

    handleWorkloadAction(action, workload) {
        switch (action) {
            case 'logs':
                this.showWorkloadLogs(workload);
                break;
            case 'scale':
                this.showScaleDialog(workload);
                break;
            case 'edit':
                this.editWorkload(workload);
                break;
            case 'delete':
                this.deleteWorkload(workload);
                break;
        }
    }

    getTypeIcon(type) {
        const icons = {
            deployment: 'deployed_code',
            pod: 'dns',
            service: 'cloud',
            job: 'work',
            cronjob: 'schedule'
        };
        return icons[type] || 'workspaces';
    }

    getStatusIcon(status) {
        const icons = {
            running: 'check_circle',
            pending: 'schedule',
            failed: 'error',
            succeeded: 'task_alt'
        };
        return icons[status] || 'help';
    }

    showDeployModal() {
        const dialog = new mdc.dialog.MDCDialog(document.getElementById('deploy-workload-dialog'));
        dialog.open();
    }

    async deployWorkload() {
        const formData = {
            name: document.getElementById('workload-name').value,
            type: document.getElementById('workload-type').value,
            image: document.getElementById('container-image').value,
            replicas: parseInt(document.getElementById('replicas').value),
            namespace: this.currentNamespace,
            resources: {
                cpu: document.getElementById('cpu-limit').value,
                memory: document.getElementById('memory-limit').value
            }
        };

        try {
            await this.apiService.post('/workloads', formData);
            this.showSnackbar('Workload deployed successfully');
            this.loadWorkloads(); // Refresh the list
        } catch (error) {
            console.error('Deploy failed:', error);
            this.showSnackbar('Failed to deploy workload', 'error');
        }
    }

    setLoading(loading) {
        this.isLoading = loading;
        const loadingEl = document.getElementById('workloads-loading');
        const contentEl = document.getElementById('workloads-grid');

        if (loading) {
            loadingEl.style.display = 'flex';
            contentEl.style.display = 'none';
        } else {
            loadingEl.style.display = 'none';
            contentEl.style.display = 'block';
        }
    }

    startAutoRefresh() {
        // Refresh every 30 seconds
        setInterval(() => {
            if (!this.isLoading) {
                this.loadWorkloads();
            }
        }, 30000);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    showSnackbar(message, type = 'info') {
        // Implementation would depend on your snackbar component
        console.log(`${type.toUpperCase()}: ${message}`);
    }

    showWorkloadLogs(workload) {
        console.log('Showing logs for:', workload.name);
        // Implementation for logs viewer
    }

    showScaleDialog(workload) {
        console.log('Scaling workload:', workload.name);
        // Implementation for scale dialog
    }

    editWorkload(workload) {
        console.log('Editing workload:', workload.name);
        // Implementation for edit form
    }

    deleteWorkload(workload) {
        if (confirm(`Are you sure you want to delete ${workload.name}?`)) {
            console.log('Deleting workload:', workload.name);
            // Implementation for delete
        }
    }
}
