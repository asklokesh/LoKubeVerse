// API Service - Fast and efficient API communication
class APIService {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        this.requestQueue = new Map();
        this.cache = new Map();
        this.cacheTimeout = 30000; // 30 seconds
    }

    // Get auth token from storage
    getAuthToken() {
        return StorageService.get(STORAGE_KEYS.AUTH_TOKEN);
    }

    // Set default headers including auth
    getHeaders(customHeaders = {}) {
        const headers = { ...this.defaultHeaders, ...customHeaders };
        const token = this.getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    // Create cache key
    createCacheKey(url, method, body) {
        return `${method}_${url}_${JSON.stringify(body || {})}`;
    }

    // Check cache
    getCached(cacheKey) {
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        this.cache.delete(cacheKey);
        return null;
    }

    // Set cache
    setCache(cacheKey, data) {
        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });
    }

    // Generic request method with caching and deduplication
    async request(endpoint, options = {}) {
        const {
            method = 'GET',
            body,
            headers: customHeaders = {},
            cache = method === 'GET',
            timeout = 10000
        } = options;

        const url = `${this.baseURL}${endpoint}`;
        const cacheKey = this.createCacheKey(url, method, body);

        // Check cache for GET requests
        if (cache && method === 'GET') {
            const cached = this.getCached(cacheKey);
            if (cached) {
                return cached;
            }
        }

        // Check for ongoing request (deduplication)
        if (this.requestQueue.has(cacheKey)) {
            return this.requestQueue.get(cacheKey);
        }

        const requestPromise = this._makeRequest(url, {
            method,
            headers: this.getHeaders(customHeaders),
            body: body ? JSON.stringify(body) : undefined,
            timeout
        });

        this.requestQueue.set(cacheKey, requestPromise);

        try {
            const result = await requestPromise;

            // Cache successful GET requests
            if (cache && method === 'GET' && result.success) {
                this.setCache(cacheKey, result);
            }

            return result;
        } finally {
            this.requestQueue.delete(cacheKey);
        }
    }

    // Internal request method with timeout
    async _makeRequest(url, options) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }

            return {
                success: true,
                data,
                status: response.status
            };
        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR);
            }

            return {
                success: false,
                error: error.message || ERROR_MESSAGES.NETWORK_ERROR,
                status: 0
            };
        }
    }

    // Convenience methods
    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    async post(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'POST', body });
    }

    async put(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'PUT', body });
    }

    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }

    async patch(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'PATCH', body });
    }

    // Authentication methods
    async login(credentials) {
        const result = await this.post(API_ENDPOINTS.auth.login, credentials);
        if (result.success && result.data.token) {
            StorageService.set(STORAGE_KEYS.AUTH_TOKEN, result.data.token);
            StorageService.set(STORAGE_KEYS.USER_DATA, result.data.user);
        }
        return result;
    }

    async logout() {
        try {
            await this.post(API_ENDPOINTS.auth.logout);
        } finally {
            StorageService.remove(STORAGE_KEYS.AUTH_TOKEN);
            StorageService.remove(STORAGE_KEYS.USER_DATA);
            this.cache.clear();
        }
    }

    async getSession() {
        return this.get(API_ENDPOINTS.auth.session);
    }

    // Cluster methods
    async getClusters() {
        return this.get(API_ENDPOINTS.clusters.list);
    }

    async getCluster(id) {
        return this.get(API_ENDPOINTS.clusters.get(id));
    }

    async createCluster(clusterData) {
        return this.post(API_ENDPOINTS.clusters.create, clusterData);
    }

    async deleteCluster(id) {
        return this.delete(API_ENDPOINTS.clusters.delete(id));
    }

    async scaleCluster(id, scaleData) {
        return this.post(API_ENDPOINTS.clusters.scale(id), scaleData);
    }

    async getClusterHealth(id) {
        return this.get(API_ENDPOINTS.clusters.health(id));
    }

    // Monitoring methods
    async getClusterMetrics(clusterId) {
        return this.get(API_ENDPOINTS.monitoring.metrics(clusterId), { cache: false });
    }

    async getClusterDashboard(clusterId) {
        return this.get(API_ENDPOINTS.monitoring.dashboard(clusterId));
    }

    async getClusterCosts(clusterId) {
        return this.get(API_ENDPOINTS.monitoring.cost(clusterId));
    }

    async getClusterLogs(clusterId, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${API_ENDPOINTS.monitoring.logs(clusterId)}${queryString ? '?' + queryString : ''}`;
        return this.get(endpoint, { cache: false });
    }

    async getClusterAlerts(clusterId) {
        return this.get(API_ENDPOINTS.monitoring.alerts(clusterId), { cache: false });
    }

    // Workload methods
    async getWorkloads(clusterId) {
        return this.get(API_ENDPOINTS.workloads.list(clusterId));
    }

    async getNamespaces(clusterId) {
        return this.get(API_ENDPOINTS.workloads.namespaces(clusterId));
    }

    async getPods(clusterId) {
        return this.get(API_ENDPOINTS.workloads.pods(clusterId));
    }

    async getServices(clusterId) {
        return this.get(API_ENDPOINTS.workloads.services(clusterId));
    }

    // Deployment methods
    async getDeployments() {
        return this.get(API_ENDPOINTS.deployments.list);
    }

    async createDeployment(deploymentData) {
        return this.post(API_ENDPOINTS.deployments.create, deploymentData);
    }

    async getDeploymentStatus(id) {
        return this.get(API_ENDPOINTS.deployments.status(id), { cache: false });
    }

    async deployBlueGreen(deploymentData) {
        return this.post(API_ENDPOINTS.deployments.blueGreen, deploymentData);
    }

    async deployCanary(deploymentData) {
        return this.post(API_ENDPOINTS.deployments.canary, deploymentData);
    }

    async rollbackDeployment(deploymentData) {
        return this.post(API_ENDPOINTS.deployments.rollback, deploymentData);
    }

    async deployHelm(helmData) {
        return this.post(API_ENDPOINTS.deployments.helm, helmData);
    }

    async setupGitOps(gitOpsData) {
        return this.post(API_ENDPOINTS.deployments.gitops, gitOpsData);
    }

    // RBAC methods
    async getRoles(clusterId) {
        return this.get(API_ENDPOINTS.rbac.roles(clusterId));
    }

    async getUsers() {
        return this.get(API_ENDPOINTS.rbac.users);
    }

    async getPermissions(clusterId) {
        return this.get(API_ENDPOINTS.rbac.permissions(clusterId));
    }

    // Cost methods
    async getCostSummary() {
        return this.get(API_ENDPOINTS.costs.summary);
    }

    async getCostBreakdown(clusterId) {
        return this.get(API_ENDPOINTS.costs.breakdown(clusterId));
    }

    async getCostOptimization() {
        return this.get(API_ENDPOINTS.costs.optimization);
    }

    // Audit methods
    async getAuditLogs(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${API_ENDPOINTS.audit.logs}${queryString ? '?' + queryString : ''}`;
        return this.get(endpoint);
    }

    async exportAuditLogs(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${API_ENDPOINTS.audit.export}${queryString ? '?' + queryString : ''}`;
        return this.get(endpoint);
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
    }

    // Health check
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                headers: this.getHeaders(),
                timeout: 5000
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}

// Create singleton instance
const apiService = new APIService();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.APIService = apiService;
}
