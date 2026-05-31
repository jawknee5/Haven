// Service Worker - Offline Support & Caching
// Location: frontend/public/service-worker.ts

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'haven-v4.2-cache';
const API_CACHE = 'haven-api-cache';
const IMAGE_CACHE = 'haven-images-cache';
const MESSAGE_QUEUE = 'haven-message-queue';

const urlsToCache = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/offline.html',
];

// Install event - cache core resources
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== API_CACHE &&
            cacheName !== IMAGE_CACHE
          ) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests - network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if offline
          return caches.match(request).then((response) => {
            if (response) {
              return response;
            }
            // Return offline response
            return new Response(
              JSON.stringify({ offline: true, message: 'Offline - using cached data' }),
              {
                status: 200,
                statusText: 'OK',
                headers: new Headers({
                  'Content-Type': 'application/json',
                }),
              }
            );
          });
        })
    );
    return;
  }

  // Image requests - cache first
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((response) => {
          return (
            response ||
            fetch(request).then((networkResponse) => {
              cache.put(request, networkResponse.clone());
              return networkResponse;
            })
          );
        });
      })
    );
    return;
  }

  // Static resources - cache first
  event.respondWith(
    caches
      .match(request)
      .then((response) => {
        return response || fetch(request);
      })
      .catch(() => {
        // Return offline page
        return caches.match('/offline.html');
      })
  );
});

// Handle messages from client
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Queue messages for sync
  if (event.data && event.data.type === 'QUEUE_MESSAGE') {
    queueMessage(event.data.payload);
  }
});

// Background sync - sync queued messages when online
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncQueuedMessages());
  }
});

/**
 * Queue message for later sync
 */
async function queueMessage(payload: any) {
  const db = await openDatabase();
  const tx = db.transaction(MESSAGE_QUEUE, 'readwrite');
  const store = tx.objectStore(MESSAGE_QUEUE);
  await store.add({
    ...payload,
    queuedAt: Date.now(),
    synced: false,
  });
}

/**
 * Sync queued messages when online
 */
async function syncQueuedMessages() {
  const db = await openDatabase();
  const tx = db.transaction(MESSAGE_QUEUE, 'readonly');
  const store = tx.objectStore(MESSAGE_QUEUE);
  const messages = await store.getAll();

  for (const message of messages) {
    try {
      await fetch('/api/bb/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });

      // Mark as synced
      const updateTx = db.transaction(MESSAGE_QUEUE, 'readwrite');
      updateTx.objectStore(MESSAGE_QUEUE).delete(message.id);
    } catch (error) {
      console.error('Failed to sync message:', error);
    }
  }
}

/**
 * Open IndexedDB
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('haven-offline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(MESSAGE_QUEUE)) {
        db.createObjectStore(MESSAGE_QUEUE, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

export {};
