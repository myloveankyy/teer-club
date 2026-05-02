// Teer Club Service Worker — Push Notifications + Click Tracking

self.addEventListener('install', function (event) {
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    event.waitUntil(clients.claim());
});

self.addEventListener('push', function (event) {
    const data = event.data?.json() ?? {};

    const title = data.title || "Teer Club Update";
    const body = data.body || "New results are available on Teer Club.";
    const url = data.url || "/";
    const campaignId = data.campaignId;
    const apiUrl = data.apiUrl;

    event.waitUntil(
        self.registration.showNotification(title, {
            body: body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            vibrate: [200, 100, 200],
            data: { url, campaignId, apiUrl },
            requireInteraction: true,
            tag: campaignId || 'teer-notification'
        })
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    const data = event.notification.data || {};

    // Build target URL for navigation
    const targetUrl = data.url && data.url.startsWith('http')
        ? data.url
        : (self.location.origin + (data.url || '/'));

    // Track click — fire-and-forget, does NOT block navigation
    if (data.campaignId) {
        event.waitUntil(trackClick(data));
    }

    // Navigate user immediately — separate waitUntil so it's not blocked by tracking
    event.waitUntil(openTarget(targetUrl));
});

async function trackClick(data) {
    // Build the tracking URL with multiple fallbacks
    const baseUrl = data.apiUrl || self.location.origin;
    const trackingUrl = baseUrl.includes('/api')
        ? baseUrl.replace(/\/api\/?$/, '/api/settings/notifications/click')
        : baseUrl + '/api/settings/notifications/click';

    let subscription = null;
    try {
        subscription = await self.registration.pushManager.getSubscription();
    } catch (e) {
        // Can't get subscription — skip tracking
        return;
    }

    if (!subscription) return;

    const payload = JSON.stringify({
        endpoint: subscription.endpoint,
        campaignId: data.campaignId
    });

    // Attempt 1
    try {
        const res = await fetch(trackingUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload
        });
        if (res.ok) return; // Success
    } catch (e) {
        // First attempt failed
    }

    // Attempt 2 — retry after 1s
    try {
        await new Promise(r => setTimeout(r, 1000));
        await fetch(trackingUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload
        });
    } catch (e) {
        // Both attempts failed — silent fail, don't block user
        console.warn('[SW] Click tracking failed after retry');
    }
}

async function openTarget(targetUrl) {
    try {
        const windowClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });

        // Focus existing matching tab
        for (const client of windowClients) {
            if (client.url === targetUrl && 'focus' in client) {
                return client.focus();
            }
        }

        // Open new window
        return clients.openWindow(targetUrl);
    } catch (e) {
        return clients.openWindow(targetUrl);
    }
}
