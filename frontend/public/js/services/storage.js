// Storage Service - High-performance local storage management
class StorageService {
    constructor() {
        this.prefix = 'k8s_dashboard_';
        this.isSupported = this.checkStorageSupport();
        this.memoryCache = new Map(); // Fallback for when localStorage is unavailable
    }

    // Check if localStorage is supported and available
    checkStorageSupport() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    // Generate prefixed key
    getKey(key) {
        return `${this.prefix}${key}`;
    }

    // Set item with automatic serialization
    set(key, value, expirationMinutes = null) {
        const prefixedKey = this.getKey(key);
        const data = {
            value,
            timestamp: Date.now(),
            expiration: expirationMinutes ? Date.now() + (expirationMinutes * 60 * 1000) : null
        };

        try {
            if (this.isSupported) {
                localStorage.setItem(prefixedKey, JSON.stringify(data));
            } else {
                this.memoryCache.set(prefixedKey, data);
            }
            return true;
        } catch (error) {
            console.warn('Storage set failed:', error);
            // Fallback to memory cache
            this.memoryCache.set(prefixedKey, data);
            return false;
        }
    }

    // Get item with automatic deserialization and expiration check
    get(key, defaultValue = null) {
        const prefixedKey = this.getKey(key);

        try {
            let dataStr = null;

            if (this.isSupported) {
                dataStr = localStorage.getItem(prefixedKey);
            } else {
                const cached = this.memoryCache.get(prefixedKey);
                dataStr = cached ? JSON.stringify(cached) : null;
            }

            if (!dataStr) {
                return defaultValue;
            }

            const data = JSON.parse(dataStr);

            // Check expiration
            if (data.expiration && Date.now() > data.expiration) {
                this.remove(key);
                return defaultValue;
            }

            return data.value;
        } catch (error) {
            console.warn('Storage get failed:', error);
            return defaultValue;
        }
    }

    // Remove item
    remove(key) {
        const prefixedKey = this.getKey(key);

        try {
            if (this.isSupported) {
                localStorage.removeItem(prefixedKey);
            }
            this.memoryCache.delete(prefixedKey);
            return true;
        } catch (error) {
            console.warn('Storage remove failed:', error);
            return false;
        }
    }

    // Clear all app data
    clear() {
        try {
            if (this.isSupported) {
                // Only remove keys with our prefix
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith(this.prefix)) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key));
            }
            this.memoryCache.clear();
            return true;
        } catch (error) {
            console.warn('Storage clear failed:', error);
            return false;
        }
    }

    // Check if key exists
    has(key) {
        const prefixedKey = this.getKey(key);

        if (this.isSupported) {
            return localStorage.getItem(prefixedKey) !== null;
        }
        return this.memoryCache.has(prefixedKey);
    }

    // Get all keys with our prefix
    getKeys() {
        const keys = [];

        try {
            if (this.isSupported) {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith(this.prefix)) {
                        keys.push(key.substring(this.prefix.length));
                    }
                }
            } else {
                for (const key of this.memoryCache.keys()) {
                    if (key.startsWith(this.prefix)) {
                        keys.push(key.substring(this.prefix.length));
                    }
                }
            }
        } catch (error) {
            console.warn('Storage getKeys failed:', error);
        }

        return keys;
    }

    // Get storage usage information
    getStorageInfo() {
        let totalSize = 0;
        let itemCount = 0;

        try {
            if (this.isSupported) {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith(this.prefix)) {
                        const value = localStorage.getItem(key);
                        totalSize += (key.length + (value ? value.length : 0)) * 2; // Rough UTF-16 size estimation
                        itemCount++;
                    }
                }
            } else {
                for (const [key, value] of this.memoryCache.entries()) {
                    if (key.startsWith(this.prefix)) {
                        totalSize += (key.length + JSON.stringify(value).length) * 2;
                        itemCount++;
                    }
                }
            }
        } catch (error) {
            console.warn('Storage info calculation failed:', error);
        }

        return {
            totalSize,
            itemCount,
            isSupported: this.isSupported,
            storageType: this.isSupported ? 'localStorage' : 'memory'
        };
    }

    // Bulk operations for better performance
    setBulk(items) {
        const results = {};
        for (const [key, value, expiration] of items) {
            results[key] = this.set(key, value, expiration);
        }
        return results;
    }

    getBulk(keys) {
        const results = {};
        for (const key of keys) {
            results[key] = this.get(key);
        }
        return results;
    }

    // Migration helper for updating stored data structure
    migrate(key, migrationFunction) {
        const value = this.get(key);
        if (value !== null) {
            try {
                const migratedValue = migrationFunction(value);
                this.set(key, migratedValue);
                return true;
            } catch (error) {
                console.warn('Storage migration failed:', error);
                return false;
            }
        }
        return false;
    }

    // Cleanup expired items
    cleanup() {
        const keys = this.getKeys();
        let cleanedCount = 0;

        for (const key of keys) {
            // This will automatically remove expired items
            const value = this.get(key);
            if (value === null) {
                cleanedCount++;
            }
        }

        return cleanedCount;
    }

    // Export data for backup
    export() {
        const data = {};
        const keys = this.getKeys();

        for (const key of keys) {
            data[key] = this.get(key);
        }

        return {
            timestamp: Date.now(),
            version: '1.0',
            data
        };
    }

    // Import data from backup
    import(backupData) {
        if (!backupData || !backupData.data) {
            throw new Error('Invalid backup data format');
        }

        let importedCount = 0;
        const errors = [];

        for (const [key, value] of Object.entries(backupData.data)) {
            try {
                this.set(key, value);
                importedCount++;
            } catch (error) {
                errors.push({ key, error: error.message });
            }
        }

        return {
            importedCount,
            errors,
            totalItems: Object.keys(backupData.data).length
        };
    }
}

// Create singleton instance
const storageService = new StorageService();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.StorageService = storageService;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageService;
}
