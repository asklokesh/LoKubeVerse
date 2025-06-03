// RBAC Component - Role-Based Access Control Management
class RBAC {
    constructor() {
        this.apiService = new APIService();
        this.roles = [];
        this.users = [];
        this.bindings = [];
        this.isLoading = false;
        this.currentView = 'roles'; // roles, users, bindings
        this.selectedNamespace = 'all';

        this.init();
    }

    init() {
        this.container = document.getElementById('rbac-content');
        this.render();
        this.loadRBACData();
        this.setupEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="rbac-page">
                <!-- Header with controls -->
                <div class="page-header">
                    <div class="header-title">
                        <h1>RBAC Management</h1>
                        <span class="subtitle">Role-based access control and permissions</span>
                    </div>
                    <div class="header-actions">
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
                                    <option value="all">All Namespaces</option>
                                    <option value="default">default</option>
                                    <option value="kube-system">kube-system</option>
                                    <option value="production">production</option>
                                    <option value="staging">staging</option>
                                </select>
                            </label>
                        </div>
                        <button class="mdc-button mdc-button--raised" id="create-role-btn">
                            <span class="mdc-button__label">Create Role</span>
                        </button>
                        <button class="mdc-icon-button" id="refresh-rbac-btn" title="Refresh">
                            <i class="material-icons">refresh</i>
                        </button>
                    </div>
                </div>

                <!-- Navigation tabs -->
                <div class="rbac-navigation">
                    <button class="mdc-button nav-btn active" data-view="roles">Roles</button>
                    <button class="mdc-button nav-btn" data-view="users">Users & Service Accounts</button>
                    <button class="mdc-button nav-btn" data-view="bindings">Role Bindings</button>
                </div>

                <!-- Roles Tab -->
                <div class="rbac-tab roles-tab" id="roles-tab">
                    <div class="roles-section">
                        <div class="section-header">
                            <h2>Roles & ClusterRoles</h2>
                            <span class="roles-count" id="roles-count">0 roles</span>
                        </div>
                        
                        <div class="roles-grid" id="roles-grid">
                            <!-- Roles will be rendered here -->
                        </div>
                    </div>
                </div>

                <!-- Users Tab -->
                <div class="rbac-tab users-tab" id="users-tab" style="display: none;">
                    <div class="users-section">
                        <div class="section-header">
                            <h2>Users & Service Accounts</h2>
                            <span class="users-count" id="users-count">0 users</span>
                        </div>
                        
                        <div class="users-grid" id="users-grid">
                            <!-- Users will be rendered here -->
                        </div>
                    </div>
                </div>

                <!-- Bindings Tab -->
                <div class="rbac-tab bindings-tab" id="bindings-tab" style="display: none;">
                    <div class="bindings-section">
                        <div class="section-header">
                            <h2>Role Bindings</h2>
                            <span class="bindings-count" id="bindings-count">0 bindings</span>
                        </div>
                        
                        <div class="bindings-list" id="bindings-list">
                            <!-- Bindings will be rendered here -->
                        </div>
                    </div>
                </div>

                <!-- Loading state -->
                <div class="loading-container" id="rbac-loading" style="display: none;">
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
                    <p>Loading RBAC data...</p>
                </div>
            </div>

            <!-- Create Role Modal -->
            <div class="mdc-dialog" id="create-role-dialog">
                <div class="mdc-dialog__container">
                    <div class="mdc-dialog__surface">
                        <h2 class="mdc-dialog__title">Create Role</h2>
                        <div class="mdc-dialog__content">
                            <div class="role-form">
                                <div class="form-section">
                                    <h3>Basic Information</h3>
                                    <div class="form-row">
                                        <label class="mdc-text-field mdc-text-field--outlined">
                                            <span class="mdc-notched-outline">
                                                <span class="mdc-notched-outline__leading"></span>
                                                <span class="mdc-notched-outline__notch">
                                                    <span class="mdc-floating-label">Role Name</span>
                                                </span>
                                                <span class="mdc-notched-outline__trailing"></span>
                                            </span>
                                            <input type="text" class="mdc-text-field__input" id="role-name" required>
                                        </label>

                                        <label class="mdc-text-field mdc-text-field--outlined">
                                            <span class="mdc-notched-outline">
                                                <span class="mdc-notched-outline__leading"></span>
                                                <span class="mdc-notched-outline__notch">
                                                    <span class="mdc-floating-label">Type</span>
                                                </span>
                                                <span class="mdc-notched-outline__trailing"></span>
                                            </span>
                                            <select class="mdc-text-field__input" id="role-type">
                                                <option value="role">Role (Namespace)</option>
                                                <option value="clusterrole">ClusterRole (Cluster-wide)</option>
                                            </select>
                                        </label>
                                    </div>

                                    <label class="mdc-text-field mdc-text-field--outlined" id="role-namespace-field">
                                        <span class="mdc-notched-outline">
                                            <span class="mdc-notched-outline__leading"></span>
                                            <span class="mdc-notched-outline__notch">
                                                <span class="mdc-floating-label">Namespace</span>
                                            </span>
                                            <span class="mdc-notched-outline__trailing"></span>
                                        </span>
                                        <select class="mdc-text-field__input" id="role-namespace">
                                            <option value="default">default</option>
                                            <option value="production">production</option>
                                            <option value="staging">staging</option>
                                        </select>
                                    </label>
                                </div>

                                <div class="form-section">
                                    <h3>Permissions</h3>
                                    <div class="permissions-builder" id="permissions-builder">
                                        <div class="permission-rule">
                                            <div class="rule-header">
                                                <h4>Rule 1</h4>
                                                <button class="mdc-icon-button remove-rule-btn" type="button">
                                                    <i class="material-icons">delete</i>
                                                </button>
                                            </div>
                                            
                                            <div class="rule-fields">
                                                <label class="mdc-text-field mdc-text-field--outlined">
                                                    <span class="mdc-notched-outline">
                                                        <span class="mdc-notched-outline__leading"></span>
                                                        <span class="mdc-notched-outline__notch">
                                                            <span class="mdc-floating-label">API Groups</span>
                                                        </span>
                                                        <span class="mdc-notched-outline__trailing"></span>
                                                    </span>
                                                    <input type="text" class="mdc-text-field__input" 
                                                           placeholder="e.g., '', 'apps', 'extensions'" 
                                                           data-field="apiGroups">
                                                </label>

                                                <label class="mdc-text-field mdc-text-field--outlined">
                                                    <span class="mdc-notched-outline">
                                                        <span class="mdc-notched-outline__leading"></span>
                                                        <span class="mdc-notched-outline__notch">
                                                            <span class="mdc-floating-label">Resources</span>
                                                        </span>
                                                        <span class="mdc-notched-outline__trailing"></span>
                                                    </span>
                                                    <input type="text" class="mdc-text-field__input" 
                                                           placeholder="e.g., 'pods', 'deployments', 'services'" 
                                                           data-field="resources" required>
                                                </label>

                                                <label class="mdc-text-field mdc-text-field--outlined">
                                                    <span class="mdc-notched-outline">
                                                        <span class="mdc-notched-outline__leading"></span>
                                                        <span class="mdc-notched-outline__notch">
                                                            <span class="mdc-floating-label">Verbs</span>
                                                        </span>
                                                        <span class="mdc-notched-outline__trailing"></span>
                                                    </span>
                                                    <input type="text" class="mdc-text-field__input" 
                                                           placeholder="e.g., 'get', 'list', 'create', 'update', 'delete'" 
                                                           data-field="verbs" required>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button class="mdc-button" type="button" id="add-rule-btn">
                                        <i class="material-icons">add</i>
                                        <span class="mdc-button__label">Add Rule</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="mdc-dialog__actions">
                            <button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="close">
                                <span class="mdc-button__label">Cancel</span>
                            </button>
                            <button type="button" class="mdc-button mdc-button--raised mdc-dialog__button" 
                                    data-mdc-dialog-action="create" id="create-role-confirm-btn">
                                <span class="mdc-button__label">Create Role</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="mdc-dialog__scrim"></div>
            </div>

            <!-- Role Details Modal -->
            <div class="mdc-dialog" id="role-details-dialog">
                <div class="mdc-dialog__container">
                    <div class="mdc-dialog__surface">
                        <h2 class="mdc-dialog__title" id="role-details-title">Role Details</h2>
                        <div class="mdc-dialog__content">
                            <div class="role-details" id="role-details-content">
                                <!-- Role details will be populated here -->
                            </div>
                        </div>
                        <div class="mdc-dialog__actions">
                            <button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="close">
                                <span class="mdc-button__label">Close</span>
                            </button>
                            <button type="button" class="mdc-button mdc-button--raised" id="edit-role-btn">
                                <span class="mdc-button__label">Edit Role</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="mdc-dialog__scrim"></div>
            </div>
        `;
    }

    setupEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.switchView(btn.dataset.view);
            });
        });

        // Namespace selector
        document.getElementById('namespace-select').addEventListener('change', (e) => {
            this.selectedNamespace = e.target.value;
            this.loadRBACData();
        });

        // Create role button
        document.getElementById('create-role-btn').addEventListener('click', () => {
            this.showCreateRoleModal();
        });

        // Role type change (show/hide namespace field)
        document.getElementById('role-type').addEventListener('change', (e) => {
            const namespaceField = document.getElementById('role-namespace-field');
            if (e.target.value === 'clusterrole') {
                namespaceField.style.display = 'none';
            } else {
                namespaceField.style.display = 'block';
            }
        });

        // Add rule button
        document.getElementById('add-rule-btn').addEventListener('click', () => {
            this.addPermissionRule();
        });

        // Create role form submission
        document.getElementById('create-role-confirm-btn').addEventListener('click', () => {
            this.createRole();
        });

        // Refresh button
        document.getElementById('refresh-rbac-btn').addEventListener('click', () => {
            this.loadRBACData();
        });
    }

    async loadRBACData() {
        this.setLoading(true);

        try {
            // Try to load from API, fallback to mock data
            const [rolesResponse, usersResponse, bindingsResponse] = await Promise.all([
                this.apiService.get(`/rbac/roles?namespace=${this.selectedNamespace}`),
                this.apiService.get(`/rbac/users?namespace=${this.selectedNamespace}`),
                this.apiService.get(`/rbac/bindings?namespace=${this.selectedNamespace}`)
            ]);

            this.roles = rolesResponse.roles || this.getMockRoles();
            this.users = usersResponse.users || this.getMockUsers();
            this.bindings = bindingsResponse.bindings || this.getMockBindings();
        } catch (error) {
            console.warn('Failed to load RBAC data from API, using mock data:', error);
            this.roles = this.getMockRoles();
            this.users = this.getMockUsers();
            this.bindings = this.getMockBindings();
        }

        this.setLoading(false);
        this.renderCurrentView();
    }

    getMockRoles() {
        return [
            {
                id: 'role-1',
                name: 'pod-reader',
                type: 'role',
                namespace: 'default',
                rules: [
                    {
                        apiGroups: [''],
                        resources: ['pods'],
                        verbs: ['get', 'list', 'watch']
                    }
                ],
                bindings: 3,
                createdAt: '2024-01-15T10:30:00Z'
            },
            {
                id: 'role-2',
                name: 'deployment-manager',
                type: 'role',
                namespace: 'production',
                rules: [
                    {
                        apiGroups: ['apps'],
                        resources: ['deployments'],
                        verbs: ['get', 'list', 'create', 'update', 'patch', 'delete']
                    },
                    {
                        apiGroups: [''],
                        resources: ['pods', 'services'],
                        verbs: ['get', 'list', 'watch']
                    }
                ],
                bindings: 2,
                createdAt: '2024-01-10T09:15:00Z'
            },
            {
                id: 'role-3',
                name: 'cluster-admin',
                type: 'clusterrole',
                namespace: null,
                rules: [
                    {
                        apiGroups: ['*'],
                        resources: ['*'],
                        verbs: ['*']
                    }
                ],
                bindings: 1,
                createdAt: '2024-01-01T00:00:00Z'
            },
            {
                id: 'role-4',
                name: 'monitoring-reader',
                type: 'clusterrole',
                namespace: null,
                rules: [
                    {
                        apiGroups: [''],
                        resources: ['nodes', 'nodes/metrics', 'pods', 'services'],
                        verbs: ['get', 'list', 'watch']
                    },
                    {
                        apiGroups: ['metrics.k8s.io'],
                        resources: ['*'],
                        verbs: ['get', 'list']
                    }
                ],
                bindings: 5,
                createdAt: '2024-01-05T14:20:00Z'
            }
        ];
    }

    getMockUsers() {
        return [
            {
                id: 'user-1',
                name: 'john.doe@company.com',
                type: 'user',
                roles: ['pod-reader', 'deployment-manager'],
                lastActivity: '2024-01-20T15:30:00Z',
                status: 'active'
            },
            {
                id: 'user-2',
                name: 'jenkins-sa',
                type: 'serviceaccount',
                namespace: 'default',
                roles: ['deployment-manager'],
                lastActivity: '2024-01-20T16:45:00Z',
                status: 'active'
            },
            {
                id: 'user-3',
                name: 'monitoring-sa',
                type: 'serviceaccount',
                namespace: 'kube-system',
                roles: ['monitoring-reader'],
                lastActivity: '2024-01-20T16:50:00Z',
                status: 'active'
            },
            {
                id: 'user-4',
                name: 'admin@company.com',
                type: 'user',
                roles: ['cluster-admin'],
                lastActivity: '2024-01-20T12:00:00Z',
                status: 'active'
            }
        ];
    }

    getMockBindings() {
        return [
            {
                id: 'binding-1',
                name: 'pod-readers-binding',
                type: 'rolebinding',
                namespace: 'default',
                role: 'pod-reader',
                subjects: [
                    { kind: 'User', name: 'john.doe@company.com' },
                    { kind: 'ServiceAccount', name: 'jenkins-sa', namespace: 'default' }
                ],
                createdAt: '2024-01-15T10:35:00Z'
            },
            {
                id: 'binding-2',
                name: 'deployment-managers-binding',
                type: 'rolebinding',
                namespace: 'production',
                role: 'deployment-manager',
                subjects: [
                    { kind: 'User', name: 'john.doe@company.com' }
                ],
                createdAt: '2024-01-10T09:20:00Z'
            },
            {
                id: 'binding-3',
                name: 'cluster-admin-binding',
                type: 'clusterrolebinding',
                namespace: null,
                role: 'cluster-admin',
                subjects: [
                    { kind: 'User', name: 'admin@company.com' }
                ],
                createdAt: '2024-01-01T00:05:00Z'
            }
        ];
    }

    switchView(view) {
        this.currentView = view;

        // Hide all tabs
        document.querySelectorAll('.rbac-tab').forEach(tab => {
            tab.style.display = 'none';
        });

        // Show selected tab
        document.getElementById(`${view}-tab`).style.display = 'block';

        this.renderCurrentView();
    }

    renderCurrentView() {
        switch (this.currentView) {
            case 'roles':
                this.renderRoles();
                break;
            case 'users':
                this.renderUsers();
                break;
            case 'bindings':
                this.renderBindings();
                break;
        }
    }

    renderRoles() {
        const container = document.getElementById('roles-grid');
        const filteredRoles = this.selectedNamespace === 'all' ?
            this.roles :
            this.roles.filter(role => role.namespace === this.selectedNamespace || role.type === 'clusterrole');

        document.getElementById('roles-count').textContent = `${filteredRoles.length} roles`;

        container.innerHTML = filteredRoles.map(role => `
            <div class="role-card" data-role-id="${role.id}">
                <div class="role-header">
                    <div class="role-name">
                        <i class="material-icons">${role.type === 'clusterrole' ? 'admin_panel_settings' : 'security'}</i>
                        <span>${role.name}</span>
                    </div>
                    <div class="role-type ${role.type}">
                        ${role.type === 'clusterrole' ? 'Cluster Role' : 'Role'}
                    </div>
                </div>
                
                <div class="role-info">
                    ${role.namespace ? `
                        <div class="info-row">
                            <span class="label">Namespace:</span>
                            <span class="value">${role.namespace}</span>
                        </div>
                    ` : ''}
                    <div class="info-row">
                        <span class="label">Rules:</span>
                        <span class="value">${role.rules.length} rule${role.rules.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Bindings:</span>
                        <span class="value">${role.bindings} binding${role.bindings !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Created:</span>
                        <span class="value">${this.formatDate(role.createdAt)}</span>
                    </div>
                </div>

                <div class="role-permissions">
                    <div class="permissions-summary">
                        ${role.rules.slice(0, 2).map(rule => `
                            <div class="permission-item">
                                <span class="resources">${rule.resources.join(', ')}</span>
                                <span class="verbs">${rule.verbs.join(', ')}</span>
                            </div>
                        `).join('')}
                        ${role.rules.length > 2 ? `
                            <div class="more-rules">+${role.rules.length - 2} more rules</div>
                        ` : ''}
                    </div>
                </div>

                <div class="role-actions">
                    <button class="mdc-icon-button" title="View Details" data-action="view">
                        <i class="material-icons">visibility</i>
                    </button>
                    <button class="mdc-icon-button" title="Edit" data-action="edit">
                        <i class="material-icons">edit</i>
                    </button>
                    <button class="mdc-icon-button" title="Delete" data-action="delete">
                        <i class="material-icons">delete</i>
                    </button>
                </div>
            </div>
        `).join('');

        this.setupRoleActions();
    }

    renderUsers() {
        const container = document.getElementById('users-grid');
        document.getElementById('users-count').textContent = `${this.users.length} users`;

        container.innerHTML = this.users.map(user => `
            <div class="user-card" data-user-id="${user.id}">
                <div class="user-header">
                    <div class="user-name">
                        <i class="material-icons">${user.type === 'serviceaccount' ? 'smart_toy' : 'person'}</i>
                        <span>${user.name}</span>
                    </div>
                    <div class="user-status status-${user.status}">
                        <i class="material-icons">${user.status === 'active' ? 'check_circle' : 'pause_circle'}</i>
                        <span>${user.status}</span>
                    </div>
                </div>
                
                <div class="user-info">
                    <div class="info-row">
                        <span class="label">Type:</span>
                        <span class="value">${user.type === 'serviceaccount' ? 'Service Account' : 'User'}</span>
                    </div>
                    ${user.namespace ? `
                        <div class="info-row">
                            <span class="label">Namespace:</span>
                            <span class="value">${user.namespace}</span>
                        </div>
                    ` : ''}
                    <div class="info-row">
                        <span class="label">Roles:</span>
                        <span class="value">${user.roles.length} role${user.roles.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Last Activity:</span>
                        <span class="value">${this.formatDate(user.lastActivity)}</span>
                    </div>
                </div>

                <div class="user-roles">
                    <div class="roles-list">
                        ${user.roles.map(role => `
                            <span class="role-tag">${role}</span>
                        `).join('')}
                    </div>
                </div>

                <div class="user-actions">
                    <button class="mdc-icon-button" title="Manage Roles" data-action="manage-roles">
                        <i class="material-icons">admin_panel_settings</i>
                    </button>
                    <button class="mdc-icon-button" title="View Activity" data-action="activity">
                        <i class="material-icons">history</i>
                    </button>
                    ${user.type === 'serviceaccount' ? `
                        <button class="mdc-icon-button" title="Delete" data-action="delete">
                            <i class="material-icons">delete</i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');

        this.setupUserActions();
    }

    renderBindings() {
        const container = document.getElementById('bindings-list');
        const filteredBindings = this.selectedNamespace === 'all' ?
            this.bindings :
            this.bindings.filter(binding => binding.namespace === this.selectedNamespace || binding.type === 'clusterrolebinding');

        document.getElementById('bindings-count').textContent = `${filteredBindings.length} bindings`;

        container.innerHTML = filteredBindings.map(binding => `
            <div class="binding-card" data-binding-id="${binding.id}">
                <div class="binding-header">
                    <div class="binding-name">
                        <i class="material-icons">${binding.type === 'clusterrolebinding' ? 'link' : 'link_off'}</i>
                        <span>${binding.name}</span>
                    </div>
                    <div class="binding-type ${binding.type}">
                        ${binding.type === 'clusterrolebinding' ? 'Cluster Binding' : 'Role Binding'}
                    </div>
                </div>
                
                <div class="binding-details">
                    <div class="binding-role">
                        <span class="label">Role:</span>
                        <span class="role-name">${binding.role}</span>
                    </div>
                    ${binding.namespace ? `
                        <div class="binding-namespace">
                            <span class="label">Namespace:</span>
                            <span class="namespace">${binding.namespace}</span>
                        </div>
                    ` : ''}
                    <div class="binding-subjects">
                        <span class="label">Subjects:</span>
                        <div class="subjects-list">
                            ${binding.subjects.map(subject => `
                                <div class="subject-item">
                                    <i class="material-icons">${subject.kind === 'ServiceAccount' ? 'smart_toy' : 'person'}</i>
                                    <span>${subject.name}</span>
                                    ${subject.namespace ? `<span class="subject-namespace">(${subject.namespace})</span>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="binding-created">
                        <span class="label">Created:</span>
                        <span class="created-date">${this.formatDate(binding.createdAt)}</span>
                    </div>
                </div>

                <div class="binding-actions">
                    <button class="mdc-icon-button" title="Edit Subjects" data-action="edit">
                        <i class="material-icons">edit</i>
                    </button>
                    <button class="mdc-icon-button" title="Delete Binding" data-action="delete">
                        <i class="material-icons">delete</i>
                    </button>
                </div>
            </div>
        `).join('');

        this.setupBindingActions();
    }

    setupRoleActions() {
        document.querySelectorAll('.role-card [data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const action = button.dataset.action;
                const roleCard = button.closest('.role-card');
                const roleId = roleCard.dataset.roleId;
                const role = this.roles.find(r => r.id === roleId);

                this.handleRoleAction(action, role);
            });
        });
    }

    setupUserActions() {
        document.querySelectorAll('.user-card [data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const action = button.dataset.action;
                const userCard = button.closest('.user-card');
                const userId = userCard.dataset.userId;
                const user = this.users.find(u => u.id === userId);

                this.handleUserAction(action, user);
            });
        });
    }

    setupBindingActions() {
        document.querySelectorAll('.binding-card [data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const action = button.dataset.action;
                const bindingCard = button.closest('.binding-card');
                const bindingId = bindingCard.dataset.bindingId;
                const binding = this.bindings.find(b => b.id === bindingId);

                this.handleBindingAction(action, binding);
            });
        });
    }

    handleRoleAction(action, role) {
        switch (action) {
            case 'view':
                this.showRoleDetails(role);
                break;
            case 'edit':
                this.editRole(role);
                break;
            case 'delete':
                this.deleteRole(role);
                break;
        }
    }

    handleUserAction(action, user) {
        switch (action) {
            case 'manage-roles':
                this.manageUserRoles(user);
                break;
            case 'activity':
                this.showUserActivity(user);
                break;
            case 'delete':
                this.deleteUser(user);
                break;
        }
    }

    handleBindingAction(action, binding) {
        switch (action) {
            case 'edit':
                this.editBinding(binding);
                break;
            case 'delete':
                this.deleteBinding(binding);
                break;
        }
    }

    showCreateRoleModal() {
        const dialog = new mdc.dialog.MDCDialog(document.getElementById('create-role-dialog'));
        dialog.open();
    }

    showRoleDetails(role) {
        const dialog = new mdc.dialog.MDCDialog(document.getElementById('role-details-dialog'));

        document.getElementById('role-details-title').textContent = `${role.name} Details`;
        document.getElementById('role-details-content').innerHTML = `
            <div class="role-details-content">
                <div class="detail-section">
                    <h3>Basic Information</h3>
                    <div class="detail-row">
                        <span class="label">Name:</span>
                        <span class="value">${role.name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Type:</span>
                        <span class="value">${role.type === 'clusterrole' ? 'Cluster Role' : 'Role'}</span>
                    </div>
                    ${role.namespace ? `
                        <div class="detail-row">
                            <span class="label">Namespace:</span>
                            <span class="value">${role.namespace}</span>
                        </div>
                    ` : ''}
                    <div class="detail-row">
                        <span class="label">Created:</span>
                        <span class="value">${this.formatDate(role.createdAt)}</span>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Permissions</h3>
                    ${role.rules.map((rule, index) => `
                        <div class="rule-detail">
                            <h4>Rule ${index + 1}</h4>
                            <div class="rule-properties">
                                <div class="property">
                                    <span class="label">API Groups:</span>
                                    <span class="value">${rule.apiGroups.join(', ') || 'core'}</span>
                                </div>
                                <div class="property">
                                    <span class="label">Resources:</span>
                                    <span class="value">${rule.resources.join(', ')}</span>
                                </div>
                                <div class="property">
                                    <span class="label">Verbs:</span>
                                    <span class="value">${rule.verbs.join(', ')}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        dialog.open();
    }

    addPermissionRule() {
        const builder = document.getElementById('permissions-builder');
        const ruleCount = builder.children.length + 1;

        const ruleHTML = `
            <div class="permission-rule">
                <div class="rule-header">
                    <h4>Rule ${ruleCount}</h4>
                    <button class="mdc-icon-button remove-rule-btn" type="button">
                        <i class="material-icons">delete</i>
                    </button>
                </div>
                
                <div class="rule-fields">
                    <label class="mdc-text-field mdc-text-field--outlined">
                        <span class="mdc-notched-outline">
                            <span class="mdc-notched-outline__leading"></span>
                            <span class="mdc-notched-outline__notch">
                                <span class="mdc-floating-label">API Groups</span>
                            </span>
                            <span class="mdc-notched-outline__trailing"></span>
                        </span>
                        <input type="text" class="mdc-text-field__input" 
                               placeholder="e.g., '', 'apps', 'extensions'" 
                               data-field="apiGroups">
                    </label>

                    <label class="mdc-text-field mdc-text-field--outlined">
                        <span class="mdc-notched-outline">
                            <span class="mdc-notched-outline__leading"></span>
                            <span class="mdc-notched-outline__notch">
                                <span class="mdc-floating-label">Resources</span>
                            </span>
                            <span class="mdc-notched-outline__trailing"></span>
                        </span>
                        <input type="text" class="mdc-text-field__input" 
                               placeholder="e.g., 'pods', 'deployments', 'services'" 
                               data-field="resources" required>
                    </label>

                    <label class="mdc-text-field mdc-text-field--outlined">
                        <span class="mdc-notched-outline">
                            <span class="mdc-notched-outline__leading"></span>
                            <span class="mdc-notched-outline__notch">
                                <span class="mdc-floating-label">Verbs</span>
                            </span>
                            <span class="mdc-notched-outline__trailing"></span>
                        </span>
                        <input type="text" class="mdc-text-field__input" 
                               placeholder="e.g., 'get', 'list', 'create', 'update', 'delete'" 
                               data-field="verbs" required>
                    </label>
                </div>
            </div>
        `;

        builder.insertAdjacentHTML('beforeend', ruleHTML);

        // Add event listener for the remove button
        const newRule = builder.lastElementChild;
        newRule.querySelector('.remove-rule-btn').addEventListener('click', () => {
            newRule.remove();
            this.updateRuleNumbers();
        });
    }

    updateRuleNumbers() {
        const rules = document.querySelectorAll('.permission-rule');
        rules.forEach((rule, index) => {
            rule.querySelector('h4').textContent = `Rule ${index + 1}`;
        });
    }

    async createRole() {
        const formData = {
            name: document.getElementById('role-name').value,
            type: document.getElementById('role-type').value,
            namespace: document.getElementById('role-type').value === 'role' ?
                document.getElementById('role-namespace').value : null,
            rules: this.collectPermissionRules()
        };

        try {
            await this.apiService.post('/rbac/roles', formData);
            this.showSnackbar('Role created successfully');
            this.loadRBACData(); // Refresh the list
        } catch (error) {
            console.error('Create role failed:', error);
            this.showSnackbar('Failed to create role', 'error');
        }
    }

    collectPermissionRules() {
        const rules = [];
        document.querySelectorAll('.permission-rule').forEach(ruleEl => {
            const apiGroups = ruleEl.querySelector('[data-field="apiGroups"]').value.split(',').map(s => s.trim()).filter(s => s);
            const resources = ruleEl.querySelector('[data-field="resources"]').value.split(',').map(s => s.trim()).filter(s => s);
            const verbs = ruleEl.querySelector('[data-field="verbs"]').value.split(',').map(s => s.trim()).filter(s => s);

            if (resources.length && verbs.length) {
                rules.push({
                    apiGroups: apiGroups.length ? apiGroups : [''],
                    resources,
                    verbs
                });
            }
        });
        return rules;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        if (diff < 86400000) { // Less than 1 day
            return date.toLocaleTimeString();
        } else {
            return date.toLocaleDateString();
        }
    }

    setLoading(loading) {
        this.isLoading = loading;
        const loadingEl = document.getElementById('rbac-loading');
        const contentEl = document.querySelector('.rbac-page');

        if (loading) {
            loadingEl.style.display = 'flex';
            contentEl.style.opacity = '0.5';
        } else {
            loadingEl.style.display = 'none';
            contentEl.style.opacity = '1';
        }
    }

    editRole(role) {
        console.log('Editing role:', role.name);
    }

    deleteRole(role) {
        if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
            console.log('Deleting role:', role.name);
        }
    }

    manageUserRoles(user) {
        console.log('Managing roles for user:', user.name);
    }

    showUserActivity(user) {
        console.log('Showing activity for user:', user.name);
    }

    deleteUser(user) {
        if (confirm(`Are you sure you want to delete the user "${user.name}"?`)) {
            console.log('Deleting user:', user.name);
        }
    }

    editBinding(binding) {
        console.log('Editing binding:', binding.name);
    }

    deleteBinding(binding) {
        if (confirm(`Are you sure you want to delete the binding "${binding.name}"?`)) {
            console.log('Deleting binding:', binding.name);
        }
    }

    showSnackbar(message, type = 'info') {
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}
