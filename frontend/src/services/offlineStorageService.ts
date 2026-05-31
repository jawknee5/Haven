// IndexedDB Service - Local Data Persistence
// Location: frontend/src/services/offlineStorageService.ts

export interface OfflineMessage {
  id?: number;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  synced: boolean;
  queuedAt?: number;
}

export interface CachedResource {
  id?: number;
  resourceId: string;
  name: string;
  category: string;
  data: Record<string, any>;
  cachedAt: number;
  ttl?: number;
}

export interface FormDraft {
  id?: number;
  formId: string;
  formName: string;
  formData: Record<string, any>;
  savedAt: number;
  status: 'draft' | 'submitted';
}

class OfflineStorageService {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'haven-offline';
  private readonly DB_VERSION = 2;
  private readonly MESSAGE_STORE = 'bb-messages';
  private readonly RESOURCE_STORE = 'resources';
  private readonly FORM_STORE = 'form-drafts';
  private readonly SYNC_QUEUE = 'sync-queue';

  /**
   * Initialize database
   */
  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;

        // Message store
        if (!db.objectStoreNames.contains(this.MESSAGE_STORE)) {
          const msgStore = db.createObjectStore(this.MESSAGE_STORE, {
            keyPath: 'id',
            autoIncrement: true,
          });
          msgStore.createIndex('sessionId', 'sessionId', { unique: false });
          msgStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Resource store
        if (!db.objectStoreNames.contains(this.RESOURCE_STORE)) {
          const resourceStore = db.createObjectStore(this.RESOURCE_STORE, {
            keyPath: 'id',
            autoIncrement: true,
          });
          resourceStore.createIndex('resourceId', 'resourceId', { unique: false });
          resourceStore.createIndex('category', 'category', { unique: false });
          resourceStore.createIndex('cachedAt', 'cachedAt', { unique: false });
        }

        // Form draft store
        if (!db.objectStoreNames.contains(this.FORM_STORE)) {
          const formStore = db.createObjectStore(this.FORM_STORE, {
            keyPath: 'id',
            autoIncrement: true,
          });
          formStore.createIndex('formId', 'formId', { unique: false });
          formStore.createIndex('savedAt', 'savedAt', { unique: false });
        }

        // Sync queue
        if (!db.objectStoreNames.contains(this.SYNC_QUEUE)) {
          db.createObjectStore(this.SYNC_QUEUE, {
            keyPath: 'id',
            autoIncrement: true,
          });
        }
      };
    });
  }

  /**
   * Save message to IndexedDB
   */
  async saveMessage(message: OfflineMessage): Promise<number> {
    await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.MESSAGE_STORE, 'readwrite');
      const store = tx.objectStore(this.MESSAGE_STORE);
      const request = store.add({
        ...message,
        timestamp: message.timestamp.getTime(),
      });

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get messages for session
   */
  async getSessionMessages(sessionId: string): Promise<OfflineMessage[]> {
    await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.MESSAGE_STORE, 'readonly');
      const store = tx.objectStore(this.MESSAGE_STORE);
      const index = store.index('sessionId');
      const request = index.getAll(sessionId);

      request.onsuccess = () => {
        const messages = request.result.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        resolve(messages);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear old messages (cleanup)
   */
  async clearOldMessages(daysOld: number = 7): Promise<void> {
    await this.init();

    const cutoff = Date.now() - daysOld * 24 * 60 * 60 * 1000;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.MESSAGE_STORE, 'readwrite');
      const store = tx.objectStore(this.MESSAGE_STORE);
      const index = store.index('timestamp');
      const range = IDBKeyRange.upperBound(cutoff);
      const request = index.openCursor(range);

      request.onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Cache resource
   */
  async cacheResource(resource: CachedResource): Promise<number> {
    await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.RESOURCE_STORE, 'readwrite');
      const store = tx.objectStore(this.RESOURCE_STORE);
      const request = store.add(resource);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cached resources by category
   */
  async getCachedResources(category: string): Promise<CachedResource[]> {
    await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.RESOURCE_STORE, 'readonly');
      const store = tx.objectStore(this.RESOURCE_STORE);
      const index = store.index('category');
      const request = index.getAll(category);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save form draft
   */
  async saveDraft(draft: FormDraft): Promise<number> {
    await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.FORM_STORE, 'readwrite');
      const store = tx.objectStore(this.FORM_STORE);
      const request = store.add(draft);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get form drafts
   */
  async getDrafts(): Promise<FormDraft[]> {
    await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.FORM_STORE, 'readonly');
      const store = tx.objectStore(this.FORM_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Queue item for sync
   */
  async queueForSync(item: Record<string, any>): Promise<number> {
    await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.SYNC_QUEUE, 'readwrite');
      const store = tx.objectStore(this.SYNC_QUEUE);
      const request = store.add({
        ...item,
        queuedAt: Date.now(),
        synced: false,
      });

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get sync queue
   */
  async getSyncQueue(): Promise<Record<string, any>[]> {
    await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.SYNC_QUEUE, 'readonly');
      const store = tx.objectStore(this.SYNC_QUEUE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear sync item
   */
  async clearSyncItem(id: number): Promise<void> {
    await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.SYNC_QUEUE, 'readwrite');
      const store = tx.objectStore(this.SYNC_QUEUE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get database size
   */
  async getDatabaseSize(): Promise<number> {
    if (!navigator.storage || !navigator.storage.estimate) {
      return 0;
    }

    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  }

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(
        [this.MESSAGE_STORE, this.RESOURCE_STORE, this.FORM_STORE, this.SYNC_QUEUE],
        'readwrite'
      );

      [this.MESSAGE_STORE, this.RESOURCE_STORE, this.FORM_STORE, this.SYNC_QUEUE].forEach(
        (store) => {
          tx.objectStore(store).clear();
        }
      );

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export default new OfflineStorageService();
