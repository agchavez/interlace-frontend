/**
 * Registra un service worker dedicado solo para push notifications
 */
export async function registerPushServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    // Primero, desregistrar cualquier SW viejo que no sea push-sw.js
    const existingRegistrations = await navigator.serviceWorker.getRegistrations();
    for (const reg of existingRegistrations) {
      // Si es un SW de VitePWA u otro, desregistrarlo
      if (reg.active && !reg.active.scriptURL.includes('push-sw.js')) {
        await reg.unregister();
      }
    }

    const registration = await navigator.serviceWorker.register('/push-sw.js', {
      scope: '/'
    });

    // Esperar a que esté activo
    await navigator.serviceWorker.ready;

    return registration;
  } catch (error) {
    return null;
  }
}
