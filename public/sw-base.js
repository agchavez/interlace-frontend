// Service Worker Base con soporte para Push Notifications
// Este código se ejecuta ANTES que workbox

console.log('[SW Base] Cargando...');

// IMPORTANTE: Event Listeners de Push deben registrarse INMEDIATAMENTE
// No dentro de un evento o callback

// Evento PUSH - Recibe notificaciones push
self.addEventListener('push', function(event) {
  console.log('[SW] ===== PUSH EVENT RECIBIDO =====');
  console.log('[SW] Event:', event);
  console.log('[SW] Event.data exists:', !!event.data);

  let notificationData = {
    title: 'Nueva Notificación',
    body: 'Tienes una nueva notificación del sistema',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
  };

  if (event.data) {
    try {
      const textData = event.data.text();
      console.log('[SW] Push data (text):', textData);

      const payload = JSON.parse(textData);
      console.log('[SW] Push payload (parsed):', payload);

      if (payload.notification) {
        const n = payload.notification;
        notificationData = {
          title: n.title || notificationData.title,
          body: n.body || notificationData.body,
          icon: n.icon || notificationData.icon,
          badge: n.badge || notificationData.badge,
          tag: n.tag,
          data: n.data,
        };
      }
    } catch (error) {
      console.error('[SW] Error parseando push data:', error);
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag || 'tracker-notification',
    data: notificationData.data || {},
    requireInteraction: false,
    vibrate: [200, 100, 200],
  };

  console.log('[SW] Mostrando notificación:', notificationData.title);
  console.log('[SW] Opciones:', options);

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
      .then(() => console.log('[SW] ✓ Notificación mostrada'))
      .catch(err => console.error('[SW] ✗ Error mostrando notificación:', err))
  );
});

// Evento NOTIFICATIONCLICK - Usuario hace clic en la notificación
self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notificación clickeada:', event.notification.tag);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // Buscar una ventana abierta
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            console.log('[SW] Enfocando ventana existente');
            return client.focus().then(() => client.navigate(urlToOpen));
          }
        }
        // Abrir nueva ventana
        if (clients.openWindow) {
          console.log('[SW] Abriendo nueva ventana');
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

console.log('[SW Base] ✓ Push notification listeners registrados');
