// Authentication Service - Secure and fast authentication management
class AuthService {
    constructor() {
        this.currentUser = null;
        this.currentTenant = null;
        this.isAuthenticated = false;
        this.authCallbacks = new Set();
        this.tokenRefreshTimer = null;
        this.sessionCheckInterval = null;

        // Initialize on load
        this.init();
    }

    // Initialize auth service
    async init() {
        await this.checkExistingSession();
        this.startSessionCheck();
    }

    // Check for existing valid session
    async checkExistingSession() {
        const token = StorageService.get(STORAGE_KEYS.AUTH_TOKEN);
        const userData = StorageService.get(STORAGE_KEYS.USER_DATA);
        const tenantId = StorageService.get(STORAGE_KEYS.TENANT_ID);

        if (token && userData) {
            this.currentUser = userData;
            this.currentTenant = tenantId;
            this.isAuthenticated = true;

            // Verify session with backend
            try {
                const sessionResult = await APIService.getSession();
                if (sessionResult.success) {
                    this.updateUserData(sessionResult.data);
                    this.scheduleTokenRefresh();
                    this.notifyAuthChange(true);
                    return true;
                } else {
                    await this.logout();
                    return false;
                }
            } catch (error) {
                console.warn('Session verification failed:', error);
                await this.logout();
                return false;
            }
        }
        return false;
    }

    // Login with credentials
    async login(credentials) {
        try {
            const result = await APIService.login(credentials);

            if (result.success) {
                this.updateUserData(result.data.user);
                this.currentTenant = result.data.tenant_id || 'default';
                this.isAuthenticated = true;

                // Store tenant ID
                StorageService.set(STORAGE_KEYS.TENANT_ID, this.currentTenant);

                // Schedule token refresh
                this.scheduleTokenRefresh();

                // Notify listeners
                this.notifyAuthChange(true);

                return {
                    success: true,
                    message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
                    user: this.currentUser
                };
            } else {
                return {
                    success: false,
                    error: result.error || ERROR_MESSAGES.AUTH_FAILED
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message || ERROR_MESSAGES.NETWORK_ERROR
            };
        }
    }

    // Logout
    async logout() {
        try {
            // Call logout endpoint
            await APIService.logout();
        } catch (error) {
            console.warn('Logout API call failed:', error);
        } finally {
            // Clear local state regardless of API call result
            this.clearAuthData();
            this.notifyAuthChange(false);
        }

        return {
            success: true,
            message: SUCCESS_MESSAGES.LOGOUT_SUCCESS
        };
    }

    // Clear authentication data
    clearAuthData() {
        this.currentUser = null;
        this.currentTenant = null;
        this.isAuthenticated = false;

        // Clear stored data
        StorageService.remove(STORAGE_KEYS.AUTH_TOKEN);
        StorageService.remove(STORAGE_KEYS.USER_DATA);
        StorageService.remove(STORAGE_KEYS.TENANT_ID);

        // Clear timers
        this.clearTokenRefreshTimer();
        this.stopSessionCheck();

        // Clear API cache
        APIService.clearCache();
    }

    // Update user data
    updateUserData(userData) {
        this.currentUser = userData;
        StorageService.set(STORAGE_KEYS.USER_DATA, userData);
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Get current tenant
    getCurrentTenant() {
        return this.currentTenant;
    }

    // Check if user is authenticated
    isUserAuthenticated() {
        return this.isAuthenticated && !!this.currentUser;
    }

    // Switch tenant
    async switchTenant(tenantId) {
        if (!this.isAuthenticated) {
            throw new Error('Must be authenticated to switch tenants');
        }

        try {
            // Update tenant in storage
            StorageService.set(STORAGE_KEYS.TENANT_ID, tenantId);
            this.currentTenant = tenantId;

            // Clear API cache since tenant context changed
            APIService.clearCache();

            // Notify listeners about tenant change
            this.notifyTenantChange(tenantId);

            return {
                success: true,
                tenantId
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Check user permissions
    hasPermission(permission) {
        if (!this.currentUser || !this.currentUser.permissions) {
            return false;
        }
        return this.currentUser.permissions.includes(permission) || this.currentUser.role === 'admin';
    }

    // Check if user has role
    hasRole(role) {
        if (!this.currentUser) {
            return false;
        }
        return this.currentUser.role === role;
    }

    // Get user roles
    getUserRoles() {
        return this.currentUser ? [this.currentUser.role] : [];
    }

    // Schedule token refresh
    scheduleTokenRefresh() {
        this.clearTokenRefreshTimer();

        // Refresh token 5 minutes before expiration
        const refreshTime = (55 * 60 * 1000); // 55 minutes

        this.tokenRefreshTimer = setTimeout(async () => {
            await this.refreshToken();
        }, refreshTime);
    }

    // Clear token refresh timer
    clearTokenRefreshTimer() {
        if (this.tokenRefreshTimer) {
            clearTimeout(this.tokenRefreshTimer);
            this.tokenRefreshTimer = null;
        }
    }

    // Refresh authentication token
    async refreshToken() {
        try {
            const result = await APIService.get(API_ENDPOINTS.auth.refresh);

            if (result.success && result.data.token) {
                StorageService.set(STORAGE_KEYS.AUTH_TOKEN, result.data.token);
                this.scheduleTokenRefresh();
                return true;
            } else {
                await this.logout();
                return false;
            }
        } catch (error) {
            console.warn('Token refresh failed:', error);
            await this.logout();
            return false;
        }
    }

    // Start session check interval
    startSessionCheck() {
        this.sessionCheckInterval = setInterval(async () => {
            if (this.isAuthenticated) {
                const isValid = await this.checkExistingSession();
                if (!isValid) {
                    await this.logout();
                }
            }
        }, 5 * 60 * 1000); // Check every 5 minutes
    }

    // Stop session check interval
    stopSessionCheck() {
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval);
            this.sessionCheckInterval = null;
        }
    }

    // Add authentication state change listener
    addAuthChangeListener(callback) {
        this.authCallbacks.add(callback);

        // Return unsubscribe function
        return () => {
            this.authCallbacks.delete(callback);
        };
    }

    // Remove authentication state change listener
    removeAuthChangeListener(callback) {
        this.authCallbacks.delete(callback);
    }

    // Notify all listeners of auth state change
    notifyAuthChange(isAuthenticated) {
        this.authCallbacks.forEach(callback => {
            try {
                callback({
                    isAuthenticated,
                    user: this.currentUser,
                    tenant: this.currentTenant
                });
            } catch (error) {
                console.warn('Auth callback error:', error);
            }
        });
    }

    // Notify all listeners of tenant change
    notifyTenantChange(tenantId) {
        this.authCallbacks.forEach(callback => {
            try {
                callback({
                    isAuthenticated: this.isAuthenticated,
                    user: this.currentUser,
                    tenant: tenantId,
                    tenantChanged: true
                });
            } catch (error) {
                console.warn('Tenant change callback error:', error);
            }
        });
    }

    // Get authentication header for manual requests
    getAuthHeader() {
        const token = StorageService.get(STORAGE_KEYS.AUTH_TOKEN);
        return token ? `Bearer ${token}` : null;
    }

    // Validate email format
    validateEmail(email) {
        return VALIDATION.EMAIL.test(email);
    }

    // Validate password strength
    validatePassword(password) {
        return VALIDATION.PASSWORD.test(password);
    }

    // Get password requirements
    getPasswordRequirements() {
        return [
            'At least 8 characters long',
            'Contains at least one lowercase letter',
            'Contains at least one uppercase letter',
            'Contains at least one number',
            'Contains at least one special character (@$!%*?&)'
        ];
    }

    // Generate password strength score
    getPasswordStrength(password) {
        let score = 0;
        const checks = [
            /[a-z]/.test(password), // lowercase
            /[A-Z]/.test(password), // uppercase
            /\d/.test(password),    // number
            /[@$!%*?&]/.test(password), // special char
            password.length >= 8,   // length
            password.length >= 12   // longer length
        ];

        score = checks.filter(Boolean).length;

        return {
            score,
            strength: score < 3 ? 'weak' : score < 5 ? 'medium' : 'strong',
            isValid: this.validatePassword(password)
        };
    }

    // Cleanup on page unload
    cleanup() {
        this.clearTokenRefreshTimer();
        this.stopSessionCheck();
        this.authCallbacks.clear();
    }
}

// Create singleton instance
const authService = new AuthService();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    authService.cleanup();
});

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.AuthService = authService;
}
