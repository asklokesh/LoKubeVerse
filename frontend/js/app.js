// Main Application Controller
// Handles routing, navigation, and overall app state management

class App {
    constructor() {
        this.currentView = 'dashboard';
        this.isAuthenticated = false;
        this.components = {};
        this.websocket = null;
        this.notificationQueue = [];

        this.init();
    }

    async init() {
        try {
            // Initialize services
            await this.initializeServices();

            // Initialize Material Design components
            this.initializeMDC();

            // Set up navigation
            this.setupNavigation();

            // Set up authentication
            this.setupAuthentication();

            // Set up WebSocket for real-time updates
            this.setupWebSocket();

            // Set up global error handling
            this.setupErrorHandling();

            // Load initial view
            await this.loadView(this.currentView);

            console.log('✅ Kubernetes Dashboard initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            this.showNotification('Failed to initialize application', 'error');
        }
    }

    async initializeServices() {
        // Initialize all services
        window.apiService = new APIService();
        window.storageService = new StorageService();
        window.authService = new AuthService();

        // Check authentication status
        this.isAuthenticated = await window.authService.isAuthenticated();

        if (!this.isAuthenticated) {
            this.showAuthModal();
        }
    }

    initializeMDC() {
        // Initialize Material Design Components
        if (typeof mdc !== 'undefined') {
            // Initialize app bar
            const topAppBar = new mdc.topAppBar.MDCTopAppBar(
                document.querySelector('.mdc-top-app-bar')
            );

            // Initialize drawer
            const drawer = new mdc.drawer.MDCDrawer(
                document.querySelector('.mdc-drawer')
            );

            // Wire up app bar menu button to drawer
            topAppBar.listen('MDCTopAppBar:nav', () => {
                drawer.open = !drawer.open;
            });

            // Initialize all buttons
            document.querySelectorAll('.mdc-button').forEach(button => {
                new mdc.ripple.MDCRipple(button);
            });

            // Initialize all text fields
            document.querySelectorAll('.mdc-text-field').forEach(textField => {
                new mdc.textField.MDCTextField(textField);
            });

            // Initialize all select components
            document.querySelectorAll('.mdc-select').forEach(select => {
                new mdc.select.MDCSelect(select);
            });

            // Initialize all tabs
            document.querySelectorAll('.mdc-tab-bar').forEach(tabBar => {
                new mdc.tabBar.MDCTabBar(tabBar);
            });

            // Initialize all chips
            document.querySelectorAll('.mdc-chip-set').forEach(chipSet => {
                new mdc.chips.MDCChipSet(chipSet);
            });

            console.log('✅ Material Design components initialized');
        }
    }

    setupNavigation() {
        // Handle navigation clicks
        document.querySelectorAll('[data-nav]').forEach(navItem => {
            navItem.addEventListener('click', (e) => {
                e.preventDefault();
                const view = navItem.getAttribute('data-nav');
                this.navigateTo(view);
            });
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.view) {
                this.loadView(e.state.view);
            }
        });

        // Update active navigation item
        this.updateActiveNav();
    }

    setupAuthentication() {
        // Handle authentication form
        const authForm = document.getElementById('auth-form');
        if (authForm) {
            authForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin(e);
            });
        }

        // Handle logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Handle user menu
        const userMenu = document.getElementById('user-menu');
        if (userMenu) {
            userMenu.addEventListener('click', () => {
                this.toggleUserMenu();
            });
        }
    }

    setupWebSocket() {
        if (!this.isAuthenticated) return;

        try {
            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${wsProtocol}//${window.location.host}/ws`;

            this.websocket = new WebSocket(wsUrl);

            this.websocket.onopen = () => {
                console.log('✅ WebSocket connected');
                this.showNotification('Real-time updates connected', 'success');
            };

            this.websocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            this.websocket.onclose = () => {
                console.log('WebSocket disconnected');
                // Attempt to reconnect after 5 seconds
                setTimeout(() => {
                    if (this.isAuthenticated) {
                        this.setupWebSocket();
                    }
                }, 5000);
            };

            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        } catch (error) {
            console.error('Failed to setup WebSocket:', error);
        }
    }

    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.showNotification('An unexpected error occurred', 'error');
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.showNotification('An unexpected error occurred', 'error');
        });
    }

    async navigateTo(view) {
        if (view === this.currentView) return;

        try {
            // Update URL without reloading page
            history.pushState({ view }, '', `#${view}`);

            // Load the new view
            await this.loadView(view);

            this.currentView = view;
            this.updateActiveNav();
        } catch (error) {
            console.error(`Failed to navigate to ${view}:`, error);
            this.showNotification(`Failed to load ${view}`, 'error');
        }
    }

    async loadView(view) {
        if (!this.isAuthenticated && view !== 'login') {
            this.showAuthModal();
            return;
        }

        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        // Show loading state
        mainContent.innerHTML = `
            <div class="loading-container">
                <div class="mdc-circular-progress" style="width:48px;height:48px;" role="progressbar" aria-label="Loading..." aria-valuemin="0" aria-valuemax="1">
                    <div class="mdc-circular-progress__determinate-container">
                        <svg class="mdc-circular-progress__determinate-circle-graphic" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <circle class="mdc-circular-progress__determinate-track" cx="24" cy="24" r="18" stroke-width="4"/>
                            <circle class="mdc-circular-progress__determinate-circle" cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="113.097" stroke-width="4"/>
                        </svg>
                    </div>
                    <div class="mdc-circular-progress__indeterminate-container">
                        <div class="mdc-circular-progress__spinner-layer">
                            <div class="mdc-circular-progress__circle-clipper mdc-circular-progress__circle-left">
                                <svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="56.549" stroke-width="4"/>
                                </svg>
                            </div>
                            <div class="mdc-circular-progress__gap-patch">
                                <svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="56.549" stroke-width="3.2"/>
                                </svg>
                            </div>
                            <div class="mdc-circular-progress__circle-clipper mdc-circular-progress__circle-right">
                                <svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="56.549" stroke-width="4"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                <p style="margin-top: 16px; color: var(--mdc-theme-text-secondary-on-background);">Loading ${view}...</p>
            </div>
        `;

        try {
            // Initialize component if not already done
            if (!this.components[view]) {
                await this.initializeComponent(view);
            }

            // Render the component
            if (this.components[view] && typeof this.components[view].render === 'function') {
                await this.components[view].render();
            }

            // Update page title
            document.title = `Kubernetes Dashboard - ${view.charAt(0).toUpperCase() + view.slice(1)}`;

        } catch (error) {
            console.error(`Failed to load view ${view}:`, error);
            mainContent.innerHTML = `
                <div class="error-container">
                    <div class="mdc-card error-card">
                        <div class="mdc-card__content">
                            <h2 class="mdc-typography--headline6">Failed to Load ${view}</h2>
                            <p class="mdc-typography--body2">An error occurred while loading this page. Please try again.</p>
                            <button class="mdc-button mdc-button--raised" onclick="window.app.loadView('${view}')">
                                <span class="mdc-button__label">Retry</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    async initializeComponent(view) {
        try {
            switch (view) {
                case 'dashboard':
                    this.components[view] = new Dashboard();
                    break;
                case 'clusters':
                    this.components[view] = new Clusters();
                    break;
                case 'workloads':
                    this.components[view] = new Workloads();
                    break;
                case 'monitoring':
                    this.components[view] = new Monitoring();
                    break;
                case 'costs':
                    this.components[view] = new Costs();
                    break;
                case 'rbac':
                    this.components[view] = new RBAC();
                    break;
                case 'audit':
                    this.components[view] = new Audit();
                    break;
                default:
                    throw new Error(`Unknown view: ${view}`);
            }

            console.log(`✅ Component ${view} initialized`);
        } catch (error) {
            console.error(`Failed to initialize component ${view}:`, error);
            throw error;
        }
    }

    updateActiveNav() {
        // Remove active state from all nav items
        document.querySelectorAll('[data-nav]').forEach(item => {
            item.classList.remove('mdc-list-item--activated');
        });

        // Add active state to current nav item
        const activeItem = document.querySelector(`[data-nav="${this.currentView}"]`);
        if (activeItem) {
            activeItem.classList.add('mdc-list-item--activated');
        }
    }

    async handleLogin(event) {
        const formData = new FormData(event.target);
        const credentials = {
            username: formData.get('username'),
            password: formData.get('password'),
            provider: formData.get('provider') || 'local'
        };

        try {
            const loginBtn = event.target.querySelector('button[type="submit"]');
            loginBtn.disabled = true;
            loginBtn.textContent = 'Signing in...';

            const result = await window.authService.login(credentials);

            if (result.success) {
                this.isAuthenticated = true;
                this.hideAuthModal();
                this.setupWebSocket();
                this.showNotification('Successfully signed in', 'success');

                // Update user info in header
                this.updateUserInfo(result.user);

                // Load dashboard
                await this.loadView('dashboard');
            } else {
                throw new Error(result.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login failed:', error);
            this.showNotification('Login failed: ' + error.message, 'error');
        } finally {
            const loginBtn = event.target.querySelector('button[type="submit"]');
            loginBtn.disabled = false;
            loginBtn.textContent = 'Sign In';
        }
    }

    async handleLogout() {
        try {
            await window.authService.logout();
            this.isAuthenticated = false;

            // Close WebSocket
            if (this.websocket) {
                this.websocket.close();
                this.websocket = null;
            }

            // Clear components
            this.components = {};

            // Show auth modal
            this.showAuthModal();

            this.showNotification('Successfully signed out', 'success');
        } catch (error) {
            console.error('Logout failed:', error);
            this.showNotification('Logout failed', 'error');
        }
    }

    showAuthModal() {
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
            authModal.style.display = 'flex';
            authModal.setAttribute('aria-hidden', 'false');
        }
    }

    hideAuthModal() {
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
            authModal.style.display = 'none';
            authModal.setAttribute('aria-hidden', 'true');
        }
    }

    toggleUserMenu() {
        const userMenu = document.getElementById('user-menu-dropdown');
        if (userMenu) {
            const isOpen = userMenu.style.display === 'block';
            userMenu.style.display = isOpen ? 'none' : 'block';
        }
    }

    updateUserInfo(user) {
        const userNameElement = document.getElementById('user-name');
        const userEmailElement = document.getElementById('user-email');

        if (userNameElement) userNameElement.textContent = user.name || user.username;
        if (userEmailElement) userEmailElement.textContent = user.email || '';
    }

    handleWebSocketMessage(data) {
        try {
            const { type, payload } = data;

            switch (type) {
                case 'cluster_update':
                    this.handleClusterUpdate(payload);
                    break;
                case 'metric_update':
                    this.handleMetricUpdate(payload);
                    break;
                case 'alert':
                    this.handleAlert(payload);
                    break;
                case 'notification':
                    this.showNotification(payload.message, payload.type || 'info');
                    break;
                default:
                    console.log('Unknown WebSocket message type:', type);
            }
        } catch (error) {
            console.error('Failed to handle WebSocket message:', error);
        }
    }

    handleClusterUpdate(payload) {
        // Notify relevant components about cluster updates
        if (this.components.dashboard && typeof this.components.dashboard.updateClusterData === 'function') {
            this.components.dashboard.updateClusterData(payload);
        }
        if (this.components.clusters && typeof this.components.clusters.updateClusterData === 'function') {
            this.components.clusters.updateClusterData(payload);
        }
    }

    handleMetricUpdate(payload) {
        // Notify monitoring and dashboard components about metric updates
        if (this.components.monitoring && typeof this.components.monitoring.updateMetrics === 'function') {
            this.components.monitoring.updateMetrics(payload);
        }
        if (this.components.dashboard && typeof this.components.dashboard.updateMetrics === 'function') {
            this.components.dashboard.updateMetrics(payload);
        }
    }

    handleAlert(payload) {
        // Show alert notification
        this.showNotification(payload.message, payload.severity || 'warning');

        // Notify monitoring component
        if (this.components.monitoring && typeof this.components.monitoring.addAlert === 'function') {
            this.components.monitoring.addAlert(payload);
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <div class="notification__content">
                <span class="notification__message">${message}</span>
                <button class="notification__close" onclick="this.parentElement.parentElement.remove()">
                    <span class="material-icons">close</span>
                </button>
            </div>
        `;

        // Add to container
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        container.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);

        // Add to queue for testing purposes
        this.notificationQueue.push({ message, type, timestamp: Date.now() });
    }

    // Utility methods for components
    async refreshCurrentView() {
        await this.loadView(this.currentView);
    }

    getCurrentComponent() {
        return this.components[this.currentView];
    }

    // Testing support methods
    getNotifications() {
        return this.notificationQueue;
    }

    clearNotifications() {
        this.notificationQueue = [];
        const container = document.getElementById('notification-container');
        if (container) {
            container.innerHTML = '';
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}
