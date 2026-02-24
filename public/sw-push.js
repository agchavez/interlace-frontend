/**
 * Service Worker para manejar Push Notifications
 */

// Evento push - Se ejecuta cuando llega una notificación
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push recibido:', event);

  let data = {
    title: 'Nueva Notificación',
    body: 'Tienes una nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('[Service Worker] Payload:', payload);

      // El payload viene en payload.notification
      if (payload.notification) {
        data = {
          title: payload.notification.title || data.title,
          body: payload.notification.body || data.body,
          icon: payload.notification.icon || data.icon,
          badge: payload.notification.badge || data.badge,
          tag: payload.notification.tag,
          data: payload.notification.data,
        };
      }
    } catch (error) {
      console.error('[Service Worker] Error parseando payload:', error);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag || 'default-tag',
    data: data.data || {},
    requireInteraction: false,
    vibrate: [200, 100, 200],
  };

  console.log('[Service Worker] Mostrando notificación:', data.title, options);

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Evento notificationclick - Se ejecuta cuando el usuario hace clic en la notificación
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notificación clickeada:', event.notification);

  event.notification.close();

  // Determinar la URL a abrir
  let urlToOpen = '/';
  if (event.notification.data && event.notification.data.url) {
    urlToOpen = event.notification.data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si ya hay una ventana abierta, enfocarlala
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Evento notificationclose - Se ejecuta cuando se cierra la notificación
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notificación cerrada:', event.notification.tag);
});

console.log('[Service Worker] Push handler cargado');
