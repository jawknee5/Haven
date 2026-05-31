// Service Worker Registration & Management
// Location: frontend/src/utils/serviceWorkerManager.ts

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });

    console.log('Service Worker registered:', registration);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'activated') {
          // New service worker activated
          notifyUpdate();
        }
      });
    });

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

export function unregisterServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
    });
  });
}

export function notifyUpdate() {
  // Post message to all clients about update
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SKIP_WAITING',
    });

    // Show update notification to user
    if (window.confirm('Haven has been updated. Reload to get the latest version?')) {
      window.location.reload();
    }
  }
}

export async function syncNow() {
  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.ready;

  // Check if background sync is supported
  if (!('sync' in registration)) {
    console.log('Background Sync not supported');
    return;
  }

  try {
    await registration.sync.register('sync-messages');
    console.log('Background sync registered');
  } catch (error) {
    console.error('Background sync registration failed:', error);
  }
}

export function isCacheAvailable(): boolean {
  return 'caches' in window;
}

export function isIndexedDBAvailable(): boolean {
  return 'indexedDB' in window;
}

export function getNetworkInformation(): any {
  const connection =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection;

  if (!connection) {
    return null;
  }

  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
  };
}

export async function getStorageEstimate(): Promise<StorageEstimate | null> {
  if (!navigator.storage || !navigator.storage.estimate) {
    return null;
  }

  return navigator.storage.estimate();
}

export async function persistStorage(): Promise<boolean> {
  if (!navigator.storage || !navigator.storage.persist) {
    return false;
  }

  return navigator.storage.persist();
}

export async function isStoragePersisted(): Promise<boolean> {
  if (!navigator.storage || !navigator.storage.persisted) {
    return false;
  }

  return navigator.storage.persisted();
}
