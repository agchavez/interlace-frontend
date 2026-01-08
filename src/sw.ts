/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { NavigationRoute, registerRoute } from 'workbox-routing'

declare let self: ServiceWorkerGlobalScope

// self.__WB_MANIFEST es un placeholder que Workbox reemplaza con la lista de archivos a precache
precacheAndRoute(self.__WB_MANIFEST)

// Limpiar cachés antiguas
cleanupOutdatedCaches()

// Reclamar clientes inmediatamente
clientsClaim()

// Permitir navegación sin conexión
const handler = createHandlerBoundToURL('/index.html')
const navigationRoute = new NavigationRoute(handler, {
  allowlist: [/^\/$/]
})
registerRoute(navigationRoute)

console.log('[SW] Service Worker cargado')

// ============================================
// PUSH NOTIFICATIONS
// ============================================

console.log('[SW] Registrando event listeners de push...')

// Evento PUSH - Recibe notificaciones push del servidor
self.addEventListener('push', (event: PushEvent) => {
  console.log('[SW] ===== PUSH EVENT RECIBIDO =====')
  console.log('[SW] Event:', event)
  console.log('[SW] Event.data exists:', !!event.data)

  let notificationData = {
    title: 'Nueva Notificación',
    body: 'Tienes una nueva notificación del sistema',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    tag: undefined as string | undefined,
    data: {} as any,
  }

  if (event.data) {
    try {
      const textData = event.data.text()
      console.log('[SW] Push data (text):', textData)

      const payload = JSON.parse(textData)
      console.log('[SW] Push payload (parsed):', payload)

      if (payload.notification) {
        const n = payload.notification
        notificationData = {
          title: n.title || notificationData.title,
          body: n.body || notificationData.body,
          icon: n.icon || notificationData.icon,
          badge: n.badge || notificationData.badge,
          tag: n.tag,
          data: n.data || {},
        }
      }
    } catch (error) {
      console.error('[SW] Error parseando push data:', error)
    }
  }

  const options: NotificationOptions = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag || 'tracker-notification',
    data: notificationData.data,
    requireInteraction: false,
    vibrate: [200, 100, 200],
  }

  console.log('[SW] Mostrando notificación:', notificationData.title)
  console.log('[SW] Opciones:', options)

  event.waitUntil(
    self.registration
      .showNotification(notificationData.title, options)
      .then(() => console.log('[SW] ✓ Notificación mostrada exitosamente'))
      .catch((err) => console.error('[SW] ✗ Error mostrando notificación:', err))
  )
})

// Evento NOTIFICATIONCLICK - Usuario hace clic en la notificación
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  console.log('[SW] Notificación clickeada:', event.notification.tag)

  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    (self.clients as Clients)
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        console.log('[SW] Clientes encontrados:', clientList.length)

        // Buscar una ventana abierta
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            console.log('[SW] Enfocando ventana existente')
            return (client as WindowClient)
              .focus()
              .then(() => (client as WindowClient).navigate(urlToOpen))
          }
        }

        // Abrir nueva ventana
        if ((self.clients as Clients).openWindow) {
          console.log('[SW] Abriendo nueva ventana')
          return (self.clients as Clients).openWindow(urlToOpen)
        }
      })
      .catch((err) => console.error('[SW] Error manejando click:', err))
  )
})

// Evento NOTIFICATIONCLOSE - Notificación cerrada
self.addEventListener('notificationclose', (event: NotificationEvent) => {
  console.log('[SW] Notificación cerrada:', event.notification.tag)
})

console.log('[SW] ✓ Event listeners de push registrados correctamente')

// Confirmar que el SW está activo
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activado')
  event.waitUntil(self.clients.claim())
})

self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker instalado')
  self.skipWaiting()
})

console.log('[SW] Service Worker completamente configurado')
