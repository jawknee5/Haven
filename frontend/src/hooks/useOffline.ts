// useOffline Hook - Offline state management
// Location: frontend/src/hooks/useOffline.ts

import { useState, useEffect, useCallback } from 'react';
import offlineStorageService from '../services/offlineStorageService';

export function useOffline() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncQueue, setSyncQueue] = useState<any[]>([]);

  useEffect(() => {
    // Initialize offline storage
    offlineStorageService.init();

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      syncQueuedMessages();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncQueuedMessages = useCallback(async () => {
    try {
      setIsSyncing(true);
      const queue = await offlineStorageService.getSyncQueue();
      setSyncQueue(queue);

      for (const item of queue) {
        try {
          const response = await fetch('/api/bb/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          });

          if (response.ok) {
            await offlineStorageService.clearSyncItem(item.id);
            setSyncQueue((prev) => prev.filter((q) => q.id !== item.id));
          }
        } catch (error) {
          console.error('Failed to sync item:', error);
        }
      }
    } catch (error) {
      console.error('Error syncing queue:', error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const saveMessageOffline = useCallback(
    async (sessionId: string, role: 'user' | 'assistant', content: string) => {
      try {
        await offlineStorageService.saveMessage({
          sessionId,
          role,
          content,
          timestamp: new Date(),
          synced: false,
        });

        if (!isOnline) {
          await offlineStorageService.queueForSync({
            type: 'bb-message',
            sessionId,
            role,
            content,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Error saving offline message:', error);
      }
    },
    [isOnline]
  );

  const saveDraftOffline = useCallback(async (formId: string, formName: string, formData: Record<string, any>) => {
    try {
      await offlineStorageService.saveDraft({
        formId,
        formName,
        formData,
        savedAt: Date.now(),
        status: 'draft',
      });
    } catch (error) {
      console.error('Error saving offline draft:', error);
    }
  }, []);

  const cacheResourceOffline = useCallback(
    async (resourceId: string, name: string, category: string, data: Record<string, any>) => {
      try {
        await offlineStorageService.cacheResource({
          resourceId,
          name,
          category,
          data,
          cachedAt: Date.now(),
        });
      } catch (error) {
        console.error('Error caching resource:', error);
      }
    },
    []
  );

  const getOfflineMessages = useCallback(async (sessionId: string) => {
    try {
      return await offlineStorageService.getSessionMessages(sessionId);
    } catch (error) {
      console.error('Error retrieving offline messages:', error);
      return [];
    }
  }, []);

  const getOfflineDrafts = useCallback(async () => {
    try {
      return await offlineStorageService.getDrafts();
    } catch (error) {
      console.error('Error retrieving offline drafts:', error);
      return [];
    }
  }, []);

  const getOfflineResources = useCallback(async (category: string) => {
    try {
      return await offlineStorageService.getCachedResources(category);
    } catch (error) {
      console.error('Error retrieving offline resources:', error);
      return [];
    }
  }, []);

  const manualSync = useCallback(async () => {
    if (isOnline) {
      await syncQueuedMessages();
    }
  }, [isOnline, syncQueuedMessages]);

  const clearOfflineData = useCallback(async () => {
    try {
      await offlineStorageService.clearAll();
      setSyncQueue([]);
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  }, []);

  return {
    isOnline,
    isSyncing,
    syncQueue,
    syncQueuedMessages,
    saveMessageOffline,
    saveDraftOffline,
    cacheResourceOffline,
    getOfflineMessages,
    getOfflineDrafts,
    getOfflineResources,
    manualSync,
    clearOfflineData,
  };
}
