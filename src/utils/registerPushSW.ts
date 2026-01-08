/**
 * Registra un service worker dedicado solo para push notifications
 */
export async function registerPushServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('[Register Push SW] Service Workers no soportados');
    return null;
  }

  try {
    // Primero, desregistrar cualquier SW viejo que no sea push-sw.js
    const existingRegistrations = await navigator.serviceWorker.getRegistrations();
    for (const reg of existingRegistrations) {
      // Si es un SW de VitePWA u otro, desregistrarlo
      if (reg.active && !reg.active.scriptURL.includes('push-sw.js')) {
        console.log('[Register Push SW] Desregistrando SW viejo:', reg.active.scriptURL);
        await reg.unregister();
      }
    }

    console.log('[Register Push SW] Registrando push-sw.js...');

    const registration = await navigator.serviceWorker.register('/push-sw.js', {
      scope: '/'
    });

    console.log('[Register Push SW] Registrado:', registration);

    // Esperar a que esté activo
    await navigator.serviceWorker.ready;
    console.log('[Register Push SW] Service Worker activo y listo');

    return registration;
  } catch (error) {
    console.error('[Register Push SW] Error:', error);
    return null;
  }
}
