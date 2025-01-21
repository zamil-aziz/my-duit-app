// Listen for fetch events
self.addEventListener('fetch', event => {
    if (event.request.method === 'POST') {
        // For POST requests (like adding expenses)
        event.respondWith(
            fetch(event.request.clone()).catch(error => {
                // Store failed requests for later
                return saveFailedRequest(event.request);
            })
        );
    } else {
        // For GET requests
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request);
            })
        );
    }
});

// Store failed requests in IndexedDB
const saveFailedRequest = async request => {
    const db = await openDB('offline-requests', 1);
    await db.add('requests', {
        url: request.url,
        method: request.method,
        body: await request.clone().text(),
        timestamp: Date.now(),
    });

    // Return a response indicating offline storage
    return new Response(
        JSON.stringify({
            error: 'Currently offline, expense will be synced when back online',
            offline: true,
        }),
        {
            headers: { 'Content-Type': 'application/json' },
        }
    );
};

// When coming back online
self.addEventListener('sync', event => {
    if (event.tag === 'sync-expenses') {
        event.waitUntil(syncOfflineRequests());
    }
});
