// Teer Club Service Worker — Push Notifications + Click Tracking

// Activate immediately and claim all clients
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
            data: { url: url, campaignId, apiUrl },
            requireInteraction: true,
            tag: campaignId || 'teer-notification' // Prevents duplicate notifications
        })
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    const data = event.notification.data;

    // Construct the full target URL
    const targetUrl = data.url && data.url.startsWith('http')
        ? data.url
        : (self.location.origin + (data.url || '/'));

    event.waitUntil(
        (async () => {
            // 1. Click Tracking — report back to backend
            if (data.campaignId && data.apiUrl) {
                try {
                    const subscription = await self.registration.pushManager.getSubscription();
                    if (subscription) {
                        const trackingUrl = data.apiUrl.endsWith('/api')
                            ? `${data.apiUrl}/settings/notifications/click`
                            : `${data.apiUrl}/api/settings/notifications/click`;

                        await fetch(trackingUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                endpoint: subscription.endpoint,
                                campaignId: data.campaignId
                            })
                        });
                    }
                } catch (e) {
                    // Silent fail — don't block user navigation for analytics
                    console.warn("[SW] Click tracking failed:", e);
                }
            }

            // 2. Navigate user to target URL
            const windowClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });

            // Try to focus an existing tab with matching URL
            for (const client of windowClients) {
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }

            // Try to navigate an existing tab
            for (const client of windowClients) {
                if ('navigate' in client) {
                    await client.navigate(targetUrl);
                    return client.focus();
                }
            }

            // Open new window as fallback
            return clients.openWindow(targetUrl);
        })()
    );
});
