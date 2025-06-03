// Audit Component - Compliance Logging and Activity Tracking
class Audit {
    constructor() {
        this.apiService = new APIService();
        this.auditLogs = [];
        this.filters = {
            level: 'all',
            verb: 'all',
            user: '',
            resource: '',
            namespace: 'all',
            timeRange: '24h'
        };
        this.isLoading = false;
        this.currentPage = 1;
        this.pageSize = 50;
        this.totalPages = 1;

        this.init();
    }

    init() {
        this.container = document.getElementById('audit-content');
        this.render();
        this.loadAuditLogs();
        this.setupEventListeners();
        this.startAutoRefresh();
    }

    render() {
        this.container.innerHTML = `
            <div class="audit-page">
                <!-- Header with controls -->
                <div class="page-header">
                    <div class="header-title">
                        <h1>Audit Logs</h1>
                        <span class="subtitle">Compliance logging and activity tracking</span>
                    </div>
                    <div class="header-actions">
                        <button class="mdc-button mdc-button--raised" id="export-logs-btn">
                            <i class="material-icons">download</i>
                            <span class="mdc-button__label">Export Logs</span>
                        </button>
                        <button class="mdc-icon-button" id="refresh-audit-btn" title="Refresh">
                            <i class="material-icons">refresh</i>
                        </button>
                    </div>
                </div>

                <!-- Filters Section -->
                <div class="audit-filters">
                    <div class="filters-row">
                        <label class="mdc-text-field mdc-text-field--outlined filter-field">
                            <span class="mdc-notched-outline">
                                <span class="mdc-notched-outline__leading"></span>
                                <span class="mdc-notched-outline__notch">
                                    <span class="mdc-floating-label">Time Range</span>
                                </span>
                                <span class="mdc-notched-outline__trailing"></span>
                            </span>
                            <select class="mdc-text-field__input" id="time-range-filter">
                                <option value="1h">Last Hour</option>
                                <option value="24h" selected>Last 24 Hours</option>
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                            </select>
                        </label>

                        <label class="mdc-text-field mdc-text-field--outlined filter-field">
                            <span class="mdc-notched-outline">
                                <span class="mdc-notched-outline__leading"></span>
                                <span class="mdc-notched-outline__notch">
                                    <span class="mdc-floating-label">Audit Level</span>
                                </span>
                                <span class="mdc-notched-outline__trailing"></span>
                            </span>
                            <select class="mdc-text-field__input" id="level-filter">
                                <option value="all">All Levels</option>
                                <option value="metadata">Metadata</option>
                                <option value="request">Request</option>
                                <option value="requestresponse">Request & Response</option>
                            </select>
                        </label>

                        <label class="mdc-text-field mdc-text-field--outlined filter-field">
                            <span class="mdc-notched-outline">
                                <span class="mdc-notched-outline__leading"></span>
                                <span class="mdc-notched-outline__notch">
                                    <span class="mdc-floating-label">Verb</span>
                                </span>
                                <span class="mdc-notched-outline__trailing"></span>
                            </span>
                            <select class="mdc-text-field__input" id="verb-filter">
                                <option value="all">All Verbs</option>
                                <option value="get">GET</option>
                                <option value="list">LIST</option>
                                <option value="create">CREATE</option>
                                <option value="update">UPDATE</option>
                                <option value="patch">PATCH</option>
                                <option value="delete">DELETE</option>
                            </select>
                        </label>

                        <label class="mdc-text-field mdc-text-field--outlined filter-field">
                            <span class="mdc-notched-outline">
                                <span class="mdc-notched-outline__leading"></span>
                                <span class="mdc-notched-outline__notch">
                                    <span class="mdc-floating-label">Namespace</span>
                                </span>
                                <span class="mdc-notched-outline__trailing"></span>
                            </span>
                            <select class="mdc-text-field__input" id="namespace-filter">
                                <option value="all">All Namespaces</option>
                                <option value="default">default</option>
                                <option value="kube-system">kube-system</option>
                                <option value="production">production</option>
                                <option value="staging">staging</option>
                            </select>
                        </label>
                    </div>

                    <div class="filters-row">
                        <label class="mdc-text-field mdc-text-field--outlined search-field">
                            <span class="mdc-notched-outline">
                                <span class="mdc-notched-outline__leading"></span>
                                <span class="mdc-notched-outline__notch">
                                    <span class="mdc-floating-label">Search by user...</span>
                                </span>
                                <span class="mdc-notched-outline__trailing"></span>
                            </span>
                            <input type="text" class="mdc-text-field__input" id="user-search">
                        </label>

                        <label class="mdc-text-field mdc-text-field--outlined search-field">
                            <span class="mdc-notched-outline">
                                <span class="mdc-notched-outline__leading"></span>
                                <span class="mdc-notched-outline__notch">
                                    <span class="mdc-floating-label">Search by resource...</span>
                                </span>
                                <span class="mdc-notched-outline__trailing"></span>
                            </span>
                            <input type="text" class="mdc-text-field__input" id="resource-search">
                        </label>

                        <button class="mdc-button mdc-button--outlined" id="clear-filters-btn">
                            <span class="mdc-button__label">Clear Filters</span>
                        </button>
                    </div>
                </div>

                <!-- Statistics Cards -->
                <div class="audit-stats">
                    <div class="stats-card">
                        <div class="stat-icon">
                            <i class="material-icons">assessment</i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value" id="total-events">0</div>
                            <div class="stat-label">Total Events</div>
                        </div>
                    </div>

                    <div class="stats-card">
                        <div class="stat-icon">
                            <i class="material-icons">people</i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value" id="unique-users">0</div>
                            <div class="stat-label">Unique Users</div>
                        </div>
                    </div>

                    <div class="stats-card">
                        <div class="stat-icon">
                            <i class="material-icons">warning</i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value" id="failed-requests">0</div>
                            <div class="stat-label">Failed Requests</div>
                        </div>
                    </div>

                    <div class="stats-card">
                        <div class="stat-icon">
                            <i class="material-icons">security</i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value" id="policy-violations">0</div>
                            <div class="stat-label">Policy Violations</div>
                        </div>
                    </div>
                </div>

                <!-- Audit Logs Table -->
                <div class="audit-logs-section">
                    <div class="section-header">
                        <h2>Audit Events</h2>
                        <div class="results-info">
                            <span id="results-count">0 results</span>
                            <span id="results-range">Page 1 of 1</span>
                        </div>
                    </div>

                    <div class="audit-table-container">
                        <div class="audit-table" id="audit-table">
                            <!-- Table header -->
                            <div class="table-header">
                                <div class="table-cell timestamp-cell">Timestamp</div>
                                <div class="table-cell level-cell">Level</div>
                                <div class="table-cell verb-cell">Verb</div>
                                <div class="table-cell user-cell">User</div>
                                <div class="table-cell resource-cell">Resource</div>
                                <div class="table-cell namespace-cell">Namespace</div>
                                <div class="table-cell status-cell">Status</div>
                                <div class="table-cell actions-cell">Actions</div>
                            </div>

                            <!-- Table body -->
                            <div class="table-body" id="audit-table-body">
                                <!-- Audit logs will be rendered here -->
                            </div>
                        </div>
                    </div>

                    <!-- Pagination -->
                    <div class="pagination-container">
                        <button class="mdc-icon-button" id="prev-page-btn" disabled>
                            <i class="material-icons">chevron_left</i>
                        </button>
                        <span class="page-info" id="page-info">Page 1 of 1</span>
                        <button class="mdc-icon-button" id="next-page-btn" disabled>
                            <i class="material-icons">chevron_right</i>
                        </button>
                    </div>
                </div>

                <!-- Loading state -->
                <div class="loading-container" id="audit-loading" style="display: none;">
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
                    <p>Loading audit logs...</p>
                </div>
            </div>

            <!-- Event Details Modal -->
            <div class="mdc-dialog" id="event-details-dialog">
                <div class="mdc-dialog__container">
                    <div class="mdc-dialog__surface">
                        <h2 class="mdc-dialog__title">Audit Event Details</h2>
                        <div class="mdc-dialog__content">
                            <div class="event-details" id="event-details-content">
                                <!-- Event details will be populated here -->
                            </div>
                        </div>
                        <div class="mdc-dialog__actions">
                            <button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="close">
                                <span class="mdc-button__label">Close</span>
                            </button>
                            <button type="button" class="mdc-button mdc-button--raised" id="export-event-btn">
                                <span class="mdc-button__label">Export Event</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="mdc-dialog__scrim"></div>
            </div>
        `;
    }

    setupEventListeners() {
        // Filter change handlers
        document.getElementById('time-range-filter').addEventListener('change', (e) => {
            this.filters.timeRange = e.target.value;
            this.currentPage = 1;
            this.loadAuditLogs();
        });

        document.getElementById('level-filter').addEventListener('change', (e) => {
            this.filters.level = e.target.value;
            this.currentPage = 1;
            this.loadAuditLogs();
        });

        document.getElementById('verb-filter').addEventListener('change', (e) => {
            this.filters.verb = e.target.value;
            this.currentPage = 1;
            this.loadAuditLogs();
        });

        document.getElementById('namespace-filter').addEventListener('change', (e) => {
            this.filters.namespace = e.target.value;
            this.currentPage = 1;
            this.loadAuditLogs();
        });

        // Search handlers with debounce
        document.getElementById('user-search').addEventListener('input',
            this.debounce((e) => {
                this.filters.user = e.target.value.toLowerCase();
                this.currentPage = 1;
                this.loadAuditLogs();
            }, 500)
        );

        document.getElementById('resource-search').addEventListener('input',
            this.debounce((e) => {
                this.filters.resource = e.target.value.toLowerCase();
                this.currentPage = 1;
                this.loadAuditLogs();
            }, 500)
        );

        // Clear filters
        document.getElementById('clear-filters-btn').addEventListener('click', () => {
            this.clearFilters();
        });

        // Pagination
        document.getElementById('prev-page-btn').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadAuditLogs();
            }
        });

        document.getElementById('next-page-btn').addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.loadAuditLogs();
            }
        });

        // Export logs
        document.getElementById('export-logs-btn').addEventListener('click', () => {
            this.exportLogs();
        });

        // Refresh
        document.getElementById('refresh-audit-btn').addEventListener('click', () => {
            this.loadAuditLogs();
        });
    }

    async loadAuditLogs() {
        this.setLoading(true);

        try {
            // Build query parameters
            const params = new URLSearchParams({
                page: this.currentPage,
                pageSize: this.pageSize,
                timeRange: this.filters.timeRange,
                ...(this.filters.level !== 'all' && { level: this.filters.level }),
                ...(this.filters.verb !== 'all' && { verb: this.filters.verb }),
                ...(this.filters.namespace !== 'all' && { namespace: this.filters.namespace }),
                ...(this.filters.user && { user: this.filters.user }),
                ...(this.filters.resource && { resource: this.filters.resource })
            });

            // Try to load from API, fallback to mock data
            const response = await this.apiService.get(`/audit/logs?${params}`);
            this.auditLogs = response.logs || this.getMockAuditLogs();
            this.totalPages = response.totalPages || Math.ceil(this.auditLogs.length / this.pageSize);
        } catch (error) {
            console.warn('Failed to load audit logs from API, using mock data:', error);
            const mockData = this.getMockAuditLogs();
            this.auditLogs = this.filterMockData(mockData);
            this.totalPages = Math.ceil(this.auditLogs.length / this.pageSize);
        }

        this.setLoading(false);
        this.renderAuditLogs();
        this.updateStatistics();
        this.updatePagination();
    }

    getMockAuditLogs() {
        const users = ['admin@company.com', 'john.doe@company.com', 'system:serviceaccount:default:jenkins', 'system:node:worker-1'];
        const verbs = ['get', 'list', 'create', 'update', 'patch', 'delete', 'watch'];
        const resources = ['pods', 'deployments', 'services', 'configmaps', 'secrets', 'ingresses', 'nodes'];
        const namespaces = ['default', 'kube-system', 'production', 'staging'];
        const levels = ['metadata', 'request', 'requestresponse'];
        const statusCodes = [200, 201, 204, 400, 401, 403, 404, 500];

        const logs = [];
        const now = Date.now();

        for (let i = 0; i < 200; i++) {
            const timestamp = new Date(now - (Math.random() * 86400000 * 7)); // Last 7 days
            const user = users[Math.floor(Math.random() * users.length)];
            const verb = verbs[Math.floor(Math.random() * verbs.length)];
            const resource = resources[Math.floor(Math.random() * resources.length)];
            const namespace = namespaces[Math.floor(Math.random() * namespaces.length)];
            const level = levels[Math.floor(Math.random() * levels.length)];
            const statusCode = statusCodes[Math.floor(Math.random() * statusCodes.length)];

            logs.push({
                id: `event-${i + 1}`,
                timestamp: timestamp.toISOString(),
                level,
                verb: verb.toUpperCase(),
                user: user,
                resource: `${resource}/${resource}-${Math.floor(Math.random() * 100)}`,
                namespace: resource === 'nodes' ? null : namespace,
                statusCode,
                userAgent: 'kubectl/v1.28.0 (linux/amd64) kubernetes/9333297',
                sourceIPs: ['10.0.1.' + Math.floor(Math.random() * 255)],
                requestURI: `/api/v1/namespaces/${namespace}/${resource}`,
                responseStatus: {
                    metadata: {},
                    code: statusCode,
                    status: statusCode < 400 ? 'Success' : 'Failure'
                },
                requestReceivedTimestamp: timestamp.toISOString(),
                stageTimestamp: timestamp.toISOString(),
                annotations: {
                    'authorization.k8s.io/decision': statusCode < 400 ? 'allow' : 'forbid',
                    'authorization.k8s.io/reason': statusCode < 400 ? 'RBAC: allowed' : 'RBAC: forbidden'
                }
            });
        }

        return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    filterMockData(logs) {
        return logs.filter(log => {
            // Apply filters
            if (this.filters.level !== 'all' && log.level !== this.filters.level) {
                return false;
            }
            if (this.filters.verb !== 'all' && log.verb.toLowerCase() !== this.filters.verb) {
                return false;
            }
            if (this.filters.namespace !== 'all' && log.namespace !== this.filters.namespace) {
                return false;
            }
            if (this.filters.user && !log.user.toLowerCase().includes(this.filters.user)) {
                return false;
            }
            if (this.filters.resource && !log.resource.toLowerCase().includes(this.filters.resource)) {
                return false;
            }

            // Apply time range filter
            const logTime = new Date(log.timestamp);
            const now = new Date();
            const timeRangeMs = this.getTimeRangeInMs(this.filters.timeRange);
            if (now - logTime > timeRangeMs) {
                return false;
            }

            return true;
        });
    }

    getTimeRangeInMs(range) {
        const ranges = {
            '1h': 3600000,
            '24h': 86400000,
            '7d': 604800000,
            '30d': 2592000000
        };
        return ranges[range] || 86400000;
    }

    renderAuditLogs() {
        const container = document.getElementById('audit-table-body');
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageData = this.auditLogs.slice(startIndex, endIndex);

        container.innerHTML = pageData.map(log => `
            <div class="table-row" data-event-id="${log.id}">
                <div class="table-cell timestamp-cell">
                    <div class="timestamp">
                        <div class="date">${this.formatDate(log.timestamp)}</div>
                        <div class="time">${this.formatTime(log.timestamp)}</div>
                    </div>
                </div>
                <div class="table-cell level-cell">
                    <span class="level-badge level-${log.level}">${log.level}</span>
                </div>
                <div class="table-cell verb-cell">
                    <span class="verb-badge verb-${log.verb.toLowerCase()}">${log.verb}</span>
                </div>
                <div class="table-cell user-cell">
                    <div class="user-info">
                        <i class="material-icons">${log.user.includes('serviceaccount') ? 'smart_toy' : 'person'}</i>
                        <span class="user-name" title="${log.user}">${this.truncateText(log.user, 25)}</span>
                    </div>
                </div>
                <div class="table-cell resource-cell">
                    <span class="resource-name" title="${log.resource}">${this.truncateText(log.resource, 30)}</span>
                </div>
                <div class="table-cell namespace-cell">
                    <span class="namespace-name">${log.namespace || 'cluster-wide'}</span>
                </div>
                <div class="table-cell status-cell">
                    <span class="status-badge status-${this.getStatusClass(log.statusCode)}">
                        <i class="material-icons">${this.getStatusIcon(log.statusCode)}</i>
                        <span>${log.statusCode}</span>
                    </span>
                </div>
                <div class="table-cell actions-cell">
                    <button class="mdc-icon-button" title="View Details" data-action="view">
                        <i class="material-icons">visibility</i>
                    </button>
                    <button class="mdc-icon-button" title="Export Event" data-action="export">
                        <i class="material-icons">download</i>
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners for row actions
        this.setupRowActions();

        // Update results info
        document.getElementById('results-count').textContent = `${this.auditLogs.length} results`;
        document.getElementById('results-range').textContent =
            `Page ${this.currentPage} of ${this.totalPages}`;
    }

    setupRowActions() {
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const action = button.dataset.action;
                const row = button.closest('[data-event-id]');
                const eventId = row.dataset.eventId;
                const event = this.auditLogs.find(log => log.id === eventId);

                this.handleEventAction(action, event);
            });
        });
    }

    handleEventAction(action, event) {
        switch (action) {
            case 'view':
                this.showEventDetails(event);
                break;
            case 'export':
                this.exportEvent(event);
                break;
        }
    }

    showEventDetails(event) {
        const dialog = new mdc.dialog.MDCDialog(document.getElementById('event-details-dialog'));

        document.getElementById('event-details-content').innerHTML = `
            <div class="event-details-content">
                <div class="detail-section">
                    <h3>Event Information</h3>
                    <div class="detail-grid">
                        <div class="detail-row">
                            <span class="label">Timestamp:</span>
                            <span class="value">${this.formatFullTimestamp(event.timestamp)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Level:</span>
                            <span class="value">${event.level}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Verb:</span>
                            <span class="value">${event.verb}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">User:</span>
                            <span class="value">${event.user}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Resource:</span>
                            <span class="value">${event.resource}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Namespace:</span>
                            <span class="value">${event.namespace || 'cluster-wide'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Status Code:</span>
                            <span class="value">${event.statusCode}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Source IPs:</span>
                            <span class="value">${event.sourceIPs.join(', ')}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">User Agent:</span>
                            <span class="value">${event.userAgent}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Request URI:</span>
                            <span class="value">${event.requestURI}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Response Status</h3>
                    <div class="detail-grid">
                        <div class="detail-row">
                            <span class="label">Code:</span>
                            <span class="value">${event.responseStatus.code}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Status:</span>
                            <span class="value">${event.responseStatus.status}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Annotations</h3>
                    <div class="detail-grid">
                        ${Object.entries(event.annotations).map(([key, value]) => `
                            <div class="detail-row">
                                <span class="label">${key}:</span>
                                <span class="value">${value}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Raw Event Data</h3>
                    <pre class="raw-data"><code>${JSON.stringify(event, null, 2)}</code></pre>
                </div>
            </div>
        `;

        dialog.open();
    }

    updateStatistics() {
        const totalEvents = this.auditLogs.length;
        const uniqueUsers = new Set(this.auditLogs.map(log => log.user)).size;
        const failedRequests = this.auditLogs.filter(log => log.statusCode >= 400).length;
        const policyViolations = this.auditLogs.filter(log =>
            log.annotations && log.annotations['authorization.k8s.io/decision'] === 'forbid'
        ).length;

        document.getElementById('total-events').textContent = totalEvents.toLocaleString();
        document.getElementById('unique-users').textContent = uniqueUsers.toLocaleString();
        document.getElementById('failed-requests').textContent = failedRequests.toLocaleString();
        document.getElementById('policy-violations').textContent = policyViolations.toLocaleString();
    }

    updatePagination() {
        const prevBtn = document.getElementById('prev-page-btn');
        const nextBtn = document.getElementById('next-page-btn');
        const pageInfo = document.getElementById('page-info');

        prevBtn.disabled = this.currentPage <= 1;
        nextBtn.disabled = this.currentPage >= this.totalPages;
        pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
    }

    clearFilters() {
        this.filters = {
            level: 'all',
            verb: 'all',
            user: '',
            resource: '',
            namespace: 'all',
            timeRange: '24h'
        };

        // Reset form elements
        document.getElementById('time-range-filter').value = '24h';
        document.getElementById('level-filter').value = 'all';
        document.getElementById('verb-filter').value = 'all';
        document.getElementById('namespace-filter').value = 'all';
        document.getElementById('user-search').value = '';
        document.getElementById('resource-search').value = '';

        this.currentPage = 1;
        this.loadAuditLogs();
    }

    exportLogs() {
        const data = this.auditLogs.map(log => ({
            timestamp: log.timestamp,
            level: log.level,
            verb: log.verb,
            user: log.user,
            resource: log.resource,
            namespace: log.namespace,
            statusCode: log.statusCode,
            sourceIPs: log.sourceIPs.join(', '),
            requestURI: log.requestURI
        }));

        this.downloadJSON(data, `audit-logs-${new Date().toISOString().split('T')[0]}.json`);
    }

    exportEvent(event) {
        this.downloadJSON(event, `audit-event-${event.id}.json`);
    }

    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString();
    }

    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString();
    }

    formatFullTimestamp(timestamp) {
        return new Date(timestamp).toLocaleString();
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    getStatusClass(statusCode) {
        if (statusCode >= 200 && statusCode < 300) return 'success';
        if (statusCode >= 300 && statusCode < 400) return 'redirect';
        if (statusCode >= 400 && statusCode < 500) return 'client-error';
        if (statusCode >= 500) return 'server-error';
        return 'unknown';
    }

    getStatusIcon(statusCode) {
        if (statusCode >= 200 && statusCode < 300) return 'check_circle';
        if (statusCode >= 300 && statusCode < 400) return 'swap_horiz';
        if (statusCode >= 400 && statusCode < 500) return 'error';
        if (statusCode >= 500) return 'warning';
        return 'help';
    }

    setLoading(loading) {
        this.isLoading = loading;
        const loadingEl = document.getElementById('audit-loading');
        const contentEl = document.querySelector('.audit-page');

        if (loading) {
            loadingEl.style.display = 'flex';
            contentEl.style.opacity = '0.5';
        } else {
            loadingEl.style.display = 'none';
            contentEl.style.opacity = '1';
        }
    }

    startAutoRefresh() {
        // Refresh every 30 seconds for audit logs
        setInterval(() => {
            if (!this.isLoading) {
                this.loadAuditLogs();
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
}
