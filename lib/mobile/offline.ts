/**
 * Offline Caching Utilities
 * 
 * Provides offline recipe caching for mobile app using IndexedDB.
 * Stores cocktail recipes, ingredients, and user data for offline access.
 */

import { debugLog } from "@/lib/debugLog";

// Offline cache key prefixes
const CACHE_KEYS = {
  COCKTAILS: 'offline:cocktails',
  INGREDIENTS: 'offline:ingredients',
  USER_DATA: 'offline:user',
  LAST_SYNC: 'offline:lastSync',
} as const;

/**
 * Check if browser supports IndexedDB
 */
function isIndexedDBAvailable(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

/**
 * Get IndexedDB database
 */
async function getDB(): Promise<IDBDatabase> {
  if (!isIndexedDBAvailable()) {
    throw new Error('IndexedDB not available');
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MixWiseOffline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores
      if (!db.objectStoreNames.contains('cocktails')) {
        db.createObjectStore('cocktails', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('ingredients')) {
        db.createObjectStore('ingredients', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('userData')) {
        db.createObjectStore('userData', { keyPath: 'key' });
      }
    };
  });
}

/**
 * Save cocktails to offline cache
 */
export async function cacheCocktails(cocktails: any[]): Promise<void> {
  if (!isIndexedDBAvailable()) {
    console.warn('[Offline] IndexedDB not available, skipping cache');
    return;
  }

  try {
    const db = await getDB();
    const transaction = db.transaction(['cocktails'], 'readwrite');
    const store = transaction.objectStore('cocktails');

    // Clear existing and add new
    await store.clear();
    for (const cocktail of cocktails) {
      await store.add(cocktail);
    }

    // Update last sync time
    await setLastSyncTime();

    debugLog(`[Offline] Cached ${cocktails.length} cocktails`);
  } catch (error) {
    console.error('[Offline] Error caching cocktails:', error);
  }
}

/**
 * Get cached cocktails
 */
export async function getCachedCocktails(): Promise<any[]> {
  if (!isIndexedDBAvailable()) {
    return [];
  }

  try {
    const db = await getDB();
    const transaction = db.transaction(['cocktails'], 'readonly');
    const store = transaction.objectStore('cocktails');
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[Offline] Error getting cached cocktails:', error);
    return [];
  }
}

/**
 * Save ingredients to offline cache
 */
export async function cacheIngredients(ingredients: any[]): Promise<void> {
  if (!isIndexedDBAvailable()) {
    return;
  }

  try {
    const db = await getDB();
    const transaction = db.transaction(['ingredients'], 'readwrite');
    const store = transaction.objectStore('ingredients');

    await store.clear();
    for (const ingredient of ingredients) {
      await store.add(ingredient);
    }

    debugLog(`[Offline] Cached ${ingredients.length} ingredients`);
  } catch (error) {
    console.error('[Offline] Error caching ingredients:', error);
  }
}

/**
 * Get cached ingredients
 */
export async function getCachedIngredients(): Promise<any[]> {
  if (!isIndexedDBAvailable()) {
    return [];
  }

  try {
    const db = await getDB();
    const transaction = db.transaction(['ingredients'], 'readonly');
    const store = transaction.objectStore('ingredients');
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[Offline] Error getting cached ingredients:', error);
    return [];
  }
}

/**
 * Cache user-specific data (favorites, bar ingredients, etc.)
 */
export async function cacheUserData(key: string, data: any): Promise<void> {
  if (!isIndexedDBAvailable()) {
    return;
  }

  try {
    const db = await getDB();
    const transaction = db.transaction(['userData'], 'readwrite');
    const store = transaction.objectStore('userData');
    await store.put({ key, data, timestamp: Date.now() });
  } catch (error) {
    console.error('[Offline] Error caching user data:', error);
  }
}

/**
 * Get cached user data
 */
export async function getCachedUserData(key: string): Promise<any | null> {
  if (!isIndexedDBAvailable()) {
    return null;
  }

  try {
    const db = await getDB();
    const transaction = db.transaction(['userData'], 'readonly');
    const store = transaction.objectStore('userData');
    const request = store.get(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[Offline] Error getting cached user data:', error);
    return null;
  }
}

/**
 * Set last sync timestamp
 */
async function setLastSyncTime(): Promise<void> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    localStorage.setItem(CACHE_KEYS.LAST_SYNC, Date.now().toString());
  } catch (error) {
    console.error('[Offline] Error setting last sync time:', error);
  }
}

/**
 * Get last sync timestamp
 */
export function getLastSyncTime(): number | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    const timestamp = localStorage.getItem(CACHE_KEYS.LAST_SYNC);
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch (error) {
    console.error('[Offline] Error getting last sync time:', error);
    return null;
  }
}

/**
 * Clear all offline cache
 */
export async function clearCache(): Promise<void> {
  if (!isIndexedDBAvailable()) {
    return;
  }

  try {
    const db = await getDB();
    const transaction = db.transaction(['cocktails', 'ingredients', 'userData'], 'readwrite');
    
    await transaction.objectStore('cocktails').clear();
    await transaction.objectStore('ingredients').clear();
    await transaction.objectStore('userData').clear();

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(CACHE_KEYS.LAST_SYNC);
    }

    debugLog('[Offline] Cache cleared');
  } catch (error) {
    console.error('[Offline] Error clearing cache:', error);
  }
}
