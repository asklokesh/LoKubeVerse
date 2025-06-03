// Unit tests for the main App class
const { screen, fireEvent, waitFor } = require('@testing-library/dom');

// Import the class to test
const App = require('../../js/app.js');

// Mock the component classes
global.Dashboard = jest.fn().mockImplementation(() => ({
    render: jest.fn().mockResolvedValue()
}));
global.Clusters = jest.fn().mockImplementation(() => ({
    render: jest.fn().mockResolvedValue()
}));
global.Workloads = jest.fn().mockImplementation(() => ({
    render: jest.fn().mockResolvedValue()
}));
global.Monitoring = jest.fn().mockImplementation(() => ({
    render: jest.fn().mockResolvedValue()
}));
global.Costs = jest.fn().mockImplementation(() => ({
    render: jest.fn().mockResolvedValue()
}));
global.RBAC = jest.fn().mockImplementation(() => ({
    render: jest.fn().mockResolvedValue()
}));
global.Audit = jest.fn().mockImplementation(() => ({
    render: jest.fn().mockResolvedValue()
}));

// Mock services
global.APIService = jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
}));

global.StorageService = jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
    clear: jest.fn()
}));

global.AuthService = jest.fn().mockImplementation(() => ({
    login: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: jest.fn().mockResolvedValue(false)
}));

describe('App', () => {
    let app;

    beforeEach(() => {
        // Setup basic DOM structure
        document.body.innerHTML = `
            <div id="main-content"></div>
            <div id="auth-modal" style="display: none;"></div>
            <nav>
                <a data-nav="dashboard" class="mdc-list-item">Dashboard</a>
                <a data-nav="clusters" class="mdc-list-item">Clusters</a>
                <a data-nav="workloads" class="mdc-list-item">Workloads</a>
            </nav>
            <form id="auth-form">
                <input name="username" value="test@example.com" />
                <input name="password" value="password123" />
                <button type="submit">Sign In</button>
            </form>
            <button id="logout-btn">Logout</button>
        `;
    });

    afterEach(() => {
        if (app && app.websocket) {
            app.websocket.close();
        }
        jest.clearAllMocks();
    });

    describe('Initialization', () => {
        test('creates app instance with default properties', () => {
            app = new App();

            expect(app.currentView).toBe('dashboard');
            expect(app.isAuthenticated).toBe(false);
            expect(app.components).toEqual({});
            expect(app.websocket).toBeNull();
            expect(app.notificationQueue).toEqual([]);
        });

        test('initializes services on init', async () => {
            app = new App();
            await app.initializeServices();

            expect(global.APIService).toHaveBeenCalled();
            expect(global.StorageService).toHaveBeenCalled();
            expect(global.AuthService).toHaveBeenCalled();
            expect(window.apiService).toBeDefined();
            expect(window.storageService).toBeDefined();
            expect(window.authService).toBeDefined();
        });
    });

    describe('Navigation', () => {
        beforeEach(async () => {
            app = new App();
            app.isAuthenticated = true;
            await app.initializeServices();
            app.setupNavigation();
        });

        test('navigates to different views', async () => {
            const loadViewSpy = jest.spyOn(app, 'loadView').mockResolvedValue();

            await app.navigateTo('clusters');

            expect(loadViewSpy).toHaveBeenCalledWith('clusters');
            expect(app.currentView).toBe('clusters');
        });

        test('updates URL on navigation', async () => {
            jest.spyOn(app, 'loadView').mockResolvedValue();
            const pushStateSpy = jest.spyOn(history, 'pushState').mockImplementation();

            await app.navigateTo('workloads');

            expect(pushStateSpy).toHaveBeenCalledWith({ view: 'workloads' }, '', '#workloads');
        });

        test('handles navigation clicks', async () => {
            const navigateToSpy = jest.spyOn(app, 'navigateTo').mockResolvedValue();

            const navLink = document.querySelector('[data-nav="clusters"]');
            fireEvent.click(navLink);

            expect(navigateToSpy).toHaveBeenCalledWith('clusters');
        });

        test('updates active navigation item', () => {
            app.currentView = 'clusters';
            app.updateActiveNav();

            const activeItem = document.querySelector('[data-nav="clusters"]');
            const inactiveItem = document.querySelector('[data-nav="dashboard"]');

            expect(activeItem.classList.contains('mdc-list-item--activated')).toBe(true);
            expect(inactiveItem.classList.contains('mdc-list-item--activated')).toBe(false);
        });
    });

    describe('Authentication', () => {
        beforeEach(async () => {
            app = new App();
            await app.initializeServices();
            app.setupAuthentication();
        });

        test('shows auth modal when not authenticated', () => {
            app.isAuthenticated = false;
            app.showAuthModal();

            const authModal = document.getElementById('auth-modal');
            expect(authModal.style.display).toBe('flex');
            expect(authModal.getAttribute('aria-hidden')).toBe('false');
        });

        test('hides auth modal when authenticated', () => {
            app.hideAuthModal();

            const authModal = document.getElementById('auth-modal');
            expect(authModal.style.display).toBe('none');
            expect(authModal.getAttribute('aria-hidden')).toBe('true');
        });

        test('handles successful login', async () => {
            const mockLoginResult = {
                success: true,
                user: { name: 'Test User', email: 'test@example.com' }
            };

            window.authService.login.mockResolvedValue(mockLoginResult);
            jest.spyOn(app, 'hideAuthModal').mockImplementation();
            jest.spyOn(app, 'setupWebSocket').mockImplementation();
            jest.spyOn(app, 'loadView').mockResolvedValue();
            jest.spyOn(app, 'updateUserInfo').mockImplementation();

            const form = document.getElementById('auth-form');
            await app.handleLogin({ target: form, preventDefault: jest.fn() });

            expect(window.authService.login).toHaveBeenCalledWith({
                username: 'test@example.com',
                password: 'password123',
                provider: 'local'
            });
            expect(app.isAuthenticated).toBe(true);
            expect(app.hideAuthModal).toHaveBeenCalled();
            expect(app.setupWebSocket).toHaveBeenCalled();
            expect(app.loadView).toHaveBeenCalledWith('dashboard');
        });

        test('handles login failure', async () => {
            const mockLoginResult = {
                success: false,
                error: 'Invalid credentials'
            };

            window.authService.login.mockResolvedValue(mockLoginResult);
            jest.spyOn(app, 'showNotification').mockImplementation();

            const form = document.getElementById('auth-form');
            await app.handleLogin({ target: form, preventDefault: jest.fn() });

            expect(app.isAuthenticated).toBe(false);
            expect(app.showNotification).toHaveBeenCalledWith(
                'Login failed: Invalid credentials',
                'error'
            );
        });

        test('handles logout', async () => {
            app.isAuthenticated = true;
            app.websocket = { close: jest.fn() };

            window.authService.logout.mockResolvedValue();
            jest.spyOn(app, 'showAuthModal').mockImplementation();

            await app.handleLogout();

            expect(window.authService.logout).toHaveBeenCalled();
            expect(app.isAuthenticated).toBe(false);
            expect(app.websocket.close).toHaveBeenCalled();
            expect(app.websocket).toBeNull();
            expect(app.components).toEqual({});
            expect(app.showAuthModal).toHaveBeenCalled();
        });
    });

    describe('Component Loading', () => {
        beforeEach(async () => {
            app = new App();
            app.isAuthenticated = true;
            await app.initializeServices();
        });

        test('initializes components on demand', async () => {
            await app.initializeComponent('dashboard');

            expect(global.Dashboard).toHaveBeenCalled();
            expect(app.components.dashboard).toBeDefined();
        });

        test('throws error for unknown component', async () => {
            await expect(app.initializeComponent('unknown')).rejects.toThrow('Unknown view: unknown');
        });

        test('loads view with component rendering', async () => {
            const mockComponent = {
                render: jest.fn().mockResolvedValue()
            };
            app.components.clusters = mockComponent;

            await app.loadView('clusters');

            expect(mockComponent.render).toHaveBeenCalled();
            expect(document.title).toBe('Kubernetes Dashboard - Clusters');
        });

        test('shows loading state during view load', async () => {
            const loadPromise = app.loadView('dashboard');

            const mainContent = document.getElementById('main-content');
            expect(mainContent.innerHTML).toContain('Loading dashboard...');

            await loadPromise;
        });

        test('shows error state on component failure', async () => {
            jest.spyOn(app, 'initializeComponent').mockRejectedValue(new Error('Component failed'));

            await app.loadView('monitoring');

            const mainContent = document.getElementById('main-content');
            expect(mainContent.innerHTML).toContain('Failed to Load monitoring');
            expect(mainContent.innerHTML).toContain('Retry');
        });
    });

    describe('WebSocket Communication', () => {
        beforeEach(async () => {
            app = new App();
            app.isAuthenticated = true;
            await app.initializeServices();
        });

        test('sets up WebSocket connection when authenticated', () => {
            app.setupWebSocket();

            expect(global.WebSocket).toHaveBeenCalled();
            expect(app.websocket).toBeDefined();
        });

        test('does not setup WebSocket when not authenticated', () => {
            app.isAuthenticated = false;
            app.setupWebSocket();

            expect(global.WebSocket).not.toHaveBeenCalled();
            expect(app.websocket).toBeNull();
        });

        test('handles cluster update messages', () => {
            const mockDashboard = {
                updateClusterData: jest.fn()
            };
            const mockClusters = {
                updateClusterData: jest.fn()
            };

            app.components.dashboard = mockDashboard;
            app.components.clusters = mockClusters;

            const payload = { clusterId: 'test-cluster', status: 'healthy' };
            app.handleClusterUpdate(payload);

            expect(mockDashboard.updateClusterData).toHaveBeenCalledWith(payload);
            expect(mockClusters.updateClusterData).toHaveBeenCalledWith(payload);
        });

        test('handles metric update messages', () => {
            const mockMonitoring = {
                updateMetrics: jest.fn()
            };
            const mockDashboard = {
                updateMetrics: jest.fn()
            };

            app.components.monitoring = mockMonitoring;
            app.components.dashboard = mockDashboard;

            const payload = { cpu: 50, memory: 70 };
            app.handleMetricUpdate(payload);

            expect(mockMonitoring.updateMetrics).toHaveBeenCalledWith(payload);
            expect(mockDashboard.updateMetrics).toHaveBeenCalledWith(payload);
        });

        test('handles alert messages', () => {
            const mockMonitoring = {
                addAlert: jest.fn()
            };

            app.components.monitoring = mockMonitoring;
            jest.spyOn(app, 'showNotification').mockImplementation();

            const payload = { message: 'High CPU usage', severity: 'warning' };
            app.handleAlert(payload);

            expect(app.showNotification).toHaveBeenCalledWith('High CPU usage', 'warning');
            expect(mockMonitoring.addAlert).toHaveBeenCalledWith(payload);
        });
    });

    describe('Notifications', () => {
        beforeEach(() => {
            app = new App();
        });

        test('shows notification with correct styling', () => {
            app.showNotification('Test message', 'success');

            const notification = document.querySelector('.notification--success');
            expect(notification).toBeTruthy();
            expect(notification.textContent).toContain('Test message');
        });

        test('adds notification to queue', () => {
            app.showNotification('Test message', 'info');

            expect(app.notificationQueue).toHaveLength(1);
            expect(app.notificationQueue[0]).toMatchObject({
                message: 'Test message',
                type: 'info'
            });
        });

        test('clears notifications', () => {
            app.showNotification('Test message 1', 'info');
            app.showNotification('Test message 2', 'error');

            expect(app.notificationQueue).toHaveLength(2);

            app.clearNotifications();

            expect(app.notificationQueue).toHaveLength(0);
        });

        test('creates notification container if not exists', () => {
            expect(document.getElementById('notification-container')).toBeNull();

            app.showNotification('Test message', 'info');

            const container = document.getElementById('notification-container');
            expect(container).toBeTruthy();
            expect(container.className).toBe('notification-container');
        });
    });

    describe('Utility Methods', () => {
        beforeEach(async () => {
            app = new App();
            app.isAuthenticated = true;
            await app.initializeServices();
        });

        test('refreshes current view', async () => {
            app.currentView = 'monitoring';
            jest.spyOn(app, 'loadView').mockResolvedValue();

            await app.refreshCurrentView();

            expect(app.loadView).toHaveBeenCalledWith('monitoring');
        });

        test('gets current component', () => {
            const mockComponent = { name: 'test' };
            app.currentView = 'dashboard';
            app.components.dashboard = mockComponent;

            const result = app.getCurrentComponent();

            expect(result).toBe(mockComponent);
        });

        test('gets notifications for testing', () => {
            app.showNotification('Test 1', 'info');
            app.showNotification('Test 2', 'error');

            const notifications = app.getNotifications();

            expect(notifications).toHaveLength(2);
            expect(notifications[0].message).toBe('Test 1');
            expect(notifications[1].message).toBe('Test 2');
        });
    });
});
