// Service Worker personalizado con soporte para Push Notifications
// Este archivo se importa desde el service worker principal

// Evento push - Se ejecuta cuando llega una notificación
self.addEventListener('push', function(event) {
  console.log('[Custom SW] Push event recibido:', event);

  let data = {
    title: 'Nueva Notificación',
    body: 'Tienes una nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('[Custom SW] Payload JSON:', payload);

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
      console.error('[Custom SW] Error parseando payload:', error);
      console.log('[Custom SW] Data texto:', event.data.text());
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

  console.log('[Custom SW] Mostrando notificación con título:', data.title);
  console.log('[Custom SW] Opciones:', options);

  event.waitUntil(
    self.registration.showNotification(data.title, options)
      .then(() => {
        console.log('[Custom SW] Notificación mostrada exitosamente');
      })
      .catch((error) => {
        console.error('[Custom SW] Error mostrando notificación:', error);
      })
  );
});

// Evento notificationclick
self.addEventListener('notificationclick', function(event) {
  console.log('[Custom SW] Notificación clickeada');
  event.notification.close();

  let urlToOpen = '/';
  if (event.notification.data && event.notification.data.url) {
    urlToOpen = event.notification.data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

console.log('[Custom SW] Listeners de push notifications registrados');
