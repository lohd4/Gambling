/**
 * Utility functions for browser compatibility and feature detection
 */

/**
 * Check if localStorage is available and working
 * (Some browsers disable it in private/incognito mode)
 */
export function isLocalStorageAvailable(): boolean {
    try {
        const testKey = "__test_storage__";
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Get storage implementation based on availability
 * Falls back to in-memory storage if localStorage isn't available
 */
export class StorageProvider {
    private static memoryStorage: Record<string, string> = {};
    private static useLocalStorage: boolean = isLocalStorageAvailable();
    
    static getItem(key: string): string | null {
        if (this.useLocalStorage) {
            return localStorage.getItem(key);
        }
        return this.memoryStorage[key] || null;
    }
    
    static setItem(key: string, value: string): void {
        if (this.useLocalStorage) {
            localStorage.setItem(key, value);
        } else {
            this.memoryStorage[key] = value;
        }
    }
    
    static removeItem(key: string): void {
        if (this.useLocalStorage) {
            localStorage.removeItem(key);
        } else {
            delete this.memoryStorage[key];
        }
    }
    
    /**
     * Memory storage only persists for the current tab session
     */
    static isSessionPersistent(): boolean {
        return this.useLocalStorage;
    }
}