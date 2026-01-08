// Service Worker dedicado SOLO para Push Notifications
console.log('[Push SW] Cargando...');

// Evento PUSH
self.addEventListener('push', function(event) {
  console.log('[Push SW] ===== PUSH RECIBIDO =====');
  console.log('[Push SW] Event:', event);

  let title = 'Nueva Notificación';
  let options = {
    body: 'Tienes una nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    tag: 'tracker-notification',
    requireInteraction: false,
    vibrate: [200, 100, 200]
  };

  if (event.data) {
    try {
      const data = event.data.json();
      console.log('[Push SW] Data:', data);

      if (data.notification) {
        title = data.notification.title || title;
        options.body = data.notification.body || options.body;
        options.icon = data.notification.icon || options.icon;
        options.badge = data.notification.badge || options.badge;
        options.tag = data.notification.tag || options.tag;
        options.data = data.notification.data || {};
      }
    } catch (e) {
      console.error('[Push SW] Error:', e);
    }
  }

  console.log('[Push SW] Mostrando:', title);

  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => console.log('[Push SW] ✓ Mostrada'))
      .catch(err => console.error('[Push SW] ✗ Error:', err))
  );
});

// Evento CLICK
self.addEventListener('notificationclick', function(event) {
  console.log('[Push SW] Click en notificación');
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('[Push SW] ✓ Listo');
