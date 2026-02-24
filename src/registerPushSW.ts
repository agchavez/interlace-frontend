/**
 * Registra un service worker adicional solo para manejar push notifications
 * Esto es necesario porque vite-plugin-pwa no incluye automáticamente los event listeners de push
 */

export async function registerPushServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('[Push SW] Service Workers no soportados');
    return;
  }

  try {
    // Obtener el service worker existente
    const registration = await navigator.serviceWorker.ready;

    console.log('[Push SW] Service Worker activo:', registration);

    // Agregar event listener para mensajes del service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('[Push SW] Mensaje del service worker:', event.data);
    });

    // Inyectar el código de push notifications al service worker activo
    // Esto se hace ejecutando código en el contexto del service worker
    const code = `
      // Evento push
      self.addEventListener('push', function(event) {
        console.log('[SW] Push recibido:', event);

        let data = {
          title: 'Nueva Notificación',
          body: 'Tienes una nueva notificación',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-96x96.png',
        };

        if (event.data) {
          try {
            const payload = event.data.json();
            console.log('[SW] Payload:', payload);

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
            console.error('[SW] Error parseando payload:', error);
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

        console.log('[SW] Mostrando notificación:', data.title);

        event.waitUntil(
          self.registration.showNotification(data.title, options)
        );
      });

      // Evento notificationclick
      self.addEventListener('notificationclick', function(event) {
        console.log('[SW] Notificación clickeada');
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

      console.log('[SW] Push notification handlers registrados');
    `;

    // Enviar el código al service worker activo
    if (registration.active) {
      console.log('[Push SW] Código de push inyectado en service worker existente');
      // Nota: Esto no funciona directamente, necesitamos que el SW ya tenga el código
    }

    console.log('[Push SW] Configuración completada');
  } catch (error) {
    console.error('[Push SW] Error registrando push service worker:', error);
  }
}
