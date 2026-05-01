self.addEventListener('push', function (event) {
    const data = event.data?.json() ?? {};

    // Default fallback messages focusing on Shillong terminology
    const title = data.title || "🎯 Live Teer Updates";
    const body = data.body || "Fastest results for Shillong and Khanapara are out now!";
    const url = data.url || "/";

    event.waitUntil(
        self.registration.showNotification(title, {
            body: body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            vibrate: [200, 100, 200, 100, 200, 100, 200],
            data: { url: url },
            requireInteraction: true // Keep on screen until clicked
        })
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            if (windowClients.length > 0) {
                // Focus existing tab
                const client = windowClients[0];
                client.focus();
                // Navigate to the targeted URL if distinct from current
                if ('url' in event.notification.data && event.notification.data.url) {
                    client.navigate(event.notification.data.url);
                }
            } else {
                // Open new tab
                if (clients.openWindow && event.notification.data.url) {
                    return clients.openWindow(event.notification.data.url);
                } else if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            }
        })
    );
});
