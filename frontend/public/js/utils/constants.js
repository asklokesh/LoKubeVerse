// Constants and Configuration
const API_BASE_URL = 'http://localhost:8000/api';
const WS_BASE_URL = 'ws://localhost:8000/ws';

// API Endpoints
const API_ENDPOINTS = {
    // Authentication
    auth: {
        login: '/auth/auth/login',
        logout: '/auth/auth/logout',
        session: '/auth/auth/session',
        refresh: '/auth/auth/refresh'
    },

    // Clusters
    clusters: {
        list: '/clusters/cluster/',
        create: '/clusters/cluster/',
        get: (id) => `/clusters/cluster/${id}`,
        delete: (id) => `/clusters/cluster/${id}`,
        scale: (id) => `/clusters/cluster/${id}/scale`,
        health: (id) => `/clusters/cluster/${id}/health`
    },

    // Monitoring
    monitoring: {
        health: (clusterId) => `/monitoring/monitoring/health/${clusterId}`,
        metrics: (clusterId) => `/monitoring/monitoring/metrics/${clusterId}`,
        dashboard: (clusterId) => `/monitoring/monitoring/dashboard/${clusterId}`,
        cost: (clusterId) => `/monitoring/monitoring/cost/${clusterId}`,
        logs: (clusterId) => `/monitoring/monitoring/logs/${clusterId}`,
        alerts: (clusterId) => `/monitoring/monitoring/alerts/${clusterId}`
    },

    // Workloads
    workloads: {
        list: (clusterId) => `/clusters/cluster/${clusterId}/workloads`,
        namespaces: (clusterId) => `/clusters/cluster/${clusterId}/namespaces`,
        pods: (clusterId) => `/clusters/cluster/${clusterId}/pods`,
        services: (clusterId) => `/clusters/cluster/${clusterId}/services`
    },

    // Deployments
    deployments: {
        list: '/deployments/deployment/',
        create: '/deployments/deployment/',
        status: (id) => `/deployments/deployment/status/${id}`,
        blueGreen: '/deployments/deployment/blue-green',
        canary: '/deployments/deployment/canary',
        rollback: '/deployments/deployment/rollback',
        helm: '/deployments/deployment/helm',
        gitops: '/deployments/deployment/gitops'
    },

    // RBAC
    rbac: {
        roles: (clusterId) => `/clusters/cluster/${clusterId}/rbac`,
        users: '/auth/auth/users',
        permissions: (clusterId) => `/clusters/cluster/${clusterId}/permissions`
    },

    // Cost Management
    costs: {
        summary: '/monitoring/monitoring/cost/summary',
        breakdown: (clusterId) => `/monitoring/monitoring/cost/${clusterId}`,
        optimization: '/monitoring/monitoring/cost/optimization'
    },

    // Audit Logs
    audit: {
        logs: '/auth/auth/audit',
        export: '/auth/auth/audit/export'
    }
};

// WebSocket Endpoints
const WS_ENDPOINTS = {
    metrics: '/metrics',
    logs: '/logs',
    alerts: '/alerts',
    status: '/status'
};

// UI Constants
const UI_CONSTANTS = {
    // Page names
    PAGES: {
        DASHBOARD: 'dashboard',
        CLUSTERS: 'clusters',
        WORKLOADS: 'workloads',
        MONITORING: 'monitoring',
        COSTS: 'costs',
        RBAC: 'rbac',
        AUDIT: 'audit'
    },

    // Status indicators
    STATUS: {
        HEALTHY: 'healthy',
        WARNING: 'warning',
        ERROR: 'error',
        LOADING: 'loading'
    },

    // Colors for status
    STATUS_COLORS: {
        healthy: 'var(--ios-green)',
        warning: 'var(--ios-orange)',
        error: 'var(--ios-red)',
        loading: 'var(--ios-gray)'
    },

    // Cloud providers
    PROVIDERS: {
        AWS: 'aws',
        AZURE: 'azure',
        GCP: 'gcp'
    },

    // Provider colors
    PROVIDER_COLORS: {
        aws: '#FF9900',
        azure: '#0078D4',
        gcp: '#4285F4'
    },

    // Update intervals (ms)
    INTERVALS: {
        METRICS: 5000,
        LOGS: 10000,
        ALERTS: 15000,
        COSTS: 60000
    },

    // Animation durations
    ANIMATIONS: {
        FAST: 150,
        MEDIUM: 300,
        SLOW: 500
    }
};

// Error Messages
const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
    AUTH_FAILED: 'Authentication failed. Please check your credentials.',
    PERMISSION_DENIED: 'You do not have permission to perform this action.',
    CLUSTER_NOT_FOUND: 'Cluster not found or no longer exists.',
    GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
    TIMEOUT_ERROR: 'Request timed out. Please try again.',
    RATE_LIMIT: 'Too many requests. Please wait and try again.'
};

// Success Messages
const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Successfully logged in',
    LOGOUT_SUCCESS: 'Successfully logged out',
    CLUSTER_CREATED: 'Cluster created successfully',
    CLUSTER_DELETED: 'Cluster deleted successfully',
    DEPLOYMENT_SUCCESS: 'Deployment completed successfully',
    SETTINGS_SAVED: 'Settings saved successfully'
};

// Local Storage Keys
const STORAGE_KEYS = {
    AUTH_TOKEN: 'k8s_dashboard_token',
    USER_DATA: 'k8s_dashboard_user',
    TENANT_ID: 'k8s_dashboard_tenant',
    PREFERENCES: 'k8s_dashboard_preferences',
    LAST_PAGE: 'k8s_dashboard_last_page'
};

// Default Preferences
const DEFAULT_PREFERENCES = {
    theme: 'auto', // auto, light, dark
    autoRefresh: true,
    refreshInterval: 5000,
    notifications: true,
    compactView: false,
    defaultCluster: null
};

// Validation Patterns
const VALIDATION = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    CLUSTER_NAME: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
    NAMESPACE_NAME: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        API_BASE_URL,
        WS_BASE_URL,
        API_ENDPOINTS,
        WS_ENDPOINTS,
        UI_CONSTANTS,
        ERROR_MESSAGES,
        SUCCESS_MESSAGES,
        STORAGE_KEYS,
        DEFAULT_PREFERENCES,
        VALIDATION
    };
}
