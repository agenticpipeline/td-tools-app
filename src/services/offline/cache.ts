/**
 * Offline-First Caching Service
 * Handles AsyncStorage-based caching, cache invalidation, and offline operation queueing
 */

import { CacheEntry, OfflineOperation, NetworkStatus } from '../api/types';

const CACHE_PREFIX = 'td-tools-cache:';
const OFFLINE_QUEUE_PREFIX = 'td-tools-queue:';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const STORAGE_TYPE = typeof localStorage !== 'undefined' ? 'localStorage' : 'memory';

/**
 * In-memory storage fallback for React Native
 */
class MemoryStorage {
  private store: Map<string, string> = new Map();

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] || null;
  }

  get length(): number {
    return this.store.size;
  }
}

const storage = typeof localStorage !== 'undefined' ? localStorage : new MemoryStorage();

/**
 * Cache service for storing and retrieving data with TTL
 */
export class CacheService {
  private ttl: number;

  constructor(ttl: number = DEFAULT_TTL) {
    this.ttl = ttl;
  }

  /**
   * Set cache entry with TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.ttl,
    };

    try {
      storage.setItem(
        `${CACHE_PREFIX}${key}`,
        JSON.stringify(entry)
      );
    } catch (error) {
      console.error('Failed to set cache:', error);
    }
  }

  /**
   * Get cache entry if not expired
   */
  get<T>(key: string): T | null {
    try {
      const item = storage.getItem(`${CACHE_PREFIX}${key}`);
      if (!item) {
        return null;
      }

      const entry = JSON.parse(item) as CacheEntry<T>;
      const now = Date.now();
      const age = now - entry.timestamp;

      if (age > entry.ttl) {
        // Cache expired
        this.delete(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Failed to get cache:', error);
      return null;
    }
  }

  /**
   * Check if cache entry exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): void {
    try {
      storage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch (error) {
      console.error('Failed to delete cache:', error);
    }
  }

  /**
   * Clear all cache entries matching pattern
   */
  clearMatching(pattern: string | RegExp): void {
    try {
      const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(CACHE_PREFIX)) {
          const cacheKey = key.substring(CACHE_PREFIX.length);
          if (regex.test(cacheKey)) {
            storage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error('Failed to clear cache matching pattern:', error);
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    try {
      for (let i = storage.length - 1; i >= 0; i--) {
        const key = storage.key(i);
        if (key && key.startsWith(CACHE_PREFIX)) {
          storage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    const keys: string[] = [];

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keys.push(key.substring(CACHE_PREFIX.length));
      }
    }

    return { size: keys.length, keys };
  }
}

/**
 * Offline operation queue for syncing when connection restored
 */
export class OfflineQueueService {
  private maxRetries = 3;

  /**
   * Add operation to queue
   */
  enqueue(operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'retries' | 'maxRetries'>): string {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const queueEntry: OfflineOperation = {
      ...operation,
      id,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: this.maxRetries,
    };

    try {
      storage.setItem(
        `${OFFLINE_QUEUE_PREFIX}${id}`,
        JSON.stringify(queueEntry)
      );
    } catch (error) {
      console.error('Failed to enqueue operation:', error);
    }

    return id;
  }

  /**
   * Get all pending operations
   */
  getQueue(): OfflineOperation[] {
    const operations: OfflineOperation[] = [];

    try {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(OFFLINE_QUEUE_PREFIX)) {
          const item = storage.getItem(key);
          if (item) {
            const operation = JSON.parse(item) as OfflineOperation;
            operations.push(operation);
          }
        }
      }
    } catch (error) {
      console.error('Failed to get queue:', error);
    }

    return operations.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Remove operation from queue
   */
  remove(id: string): void {
    try {
      storage.removeItem(`${OFFLINE_QUEUE_PREFIX}${id}`);
    } catch (error) {
      console.error('Failed to remove operation from queue:', error);
    }
  }

  /**
   * Increment retry count
   */
  incrementRetry(id: string): boolean {
    try {
      const item = storage.getItem(`${OFFLINE_QUEUE_PREFIX}${id}`);
      if (!item) {
        return false;
      }

      const operation = JSON.parse(item) as OfflineOperation;

      if (operation.retries < operation.maxRetries) {
        operation.retries++;
        storage.setItem(
          `${OFFLINE_QUEUE_PREFIX}${id}`,
          JSON.stringify(operation)
        );
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to increment retry:', error);
      return false;
    }
  }

  /**
   * Clear queue
   */
  clear(): void {
    try {
      for (let i = storage.length - 1; i >= 0; i--) {
        const key = storage.key(i);
        if (key && key.startsWith(OFFLINE_QUEUE_PREFIX)) {
          storage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Failed to clear queue:', error);
    }
  }

  /**
   * Get queue statistics
   */
  getStats(): { pending: number; size: number; oldestAt: number | null } {
    const queue = this.getQueue();
    return {
      pending: queue.length,
      size: queue.reduce((sum, op) => sum + (op.data ? JSON.stringify(op.data).length : 0), 0),
      oldestAt: queue.length > 0 ? queue[0].timestamp : null,
    };
  }
}

/**
 * Network status detector
 */
export class NetworkStatusService {
  private isOnline = true;
  private listeners: Set<(status: NetworkStatus) => void> = new Set();

  constructor() {
    this.init();
  }

  private init(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.setOnline(true));
      window.addEventListener('offline', () => this.setOnline(false));
      this.isOnline = navigator.onLine;
    }
  }

  private setOnline(isOnline: boolean): void {
    if (this.isOnline !== isOnline) {
      this.isOnline = isOnline;
      this.notifyListeners();
    }
  }

  private notifyListeners(): void {
    const status: NetworkStatus = {
      isOnline: this.isOnline,
      type: this.getConnectionType(),
      strength: this.getSignalStrength(),
    };

    this.listeners.forEach((listener) => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in network status listener:', error);
      }
    });
  }

  private getConnectionType(): NetworkStatus['type'] {
    if (typeof navigator !== 'undefined' && (navigator as any).connection) {
      const type = (navigator as any).connection.type;
      if (type === 'wifi') return 'wifi';
      if (type === '4g' || type === '5g' || type === 'cellular') return 'cellular';
      if (type === 'none') return 'none';
    }
    return 'unknown';
  }

  private getSignalStrength(): number {
    if (typeof navigator !== 'undefined' && (navigator as any).connection?.downlink) {
      // Normalize to 0-100
      const downlink = (navigator as any).connection.downlink;
      return Math.min(100, Math.round((downlink / 10) * 100));
    }
    return undefined as any;
  }

  /**
   * Get current status
   */
  getStatus(): NetworkStatus {
    return {
      isOnline: this.isOnline,
      type: this.getConnectionType(),
      strength: this.getSignalStrength(),
    };
  }

  /**
   * Subscribe to status changes
   */
  subscribe(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Check if online
   */
  isConnected(): boolean {
    return this.isOnline;
  }
}

// Export singleton instances
export const cacheService = new CacheService();
export const offlineQueueService = new OfflineQueueService();
export const networkStatusService = new NetworkStatusService();
