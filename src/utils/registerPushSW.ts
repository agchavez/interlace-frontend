/**
 * Registra un service worker dedicado solo para push notifications
 */
export async function registerPushServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('[Register Push SW] Service Workers no soportados');
    return null;
  }

  try {
    console.log('[Register Push SW] Registrando push-sw.js...');

    const registration = await navigator.serviceWorker.register('/push-sw.js', {
      scope: '/'
    });

    console.log('[Register Push SW] ✓ Registrado:', registration);

    // Esperar a que esté activo
    await navigator.serviceWorker.ready;
    console.log('[Register Push SW] ✓ Service Worker activo y listo');

    return registration;
  } catch (error) {
    console.error('[Register Push SW] ✗ Error:', error);
    return null;
  }
}
