/**
 * Push Notifications Utility
 * Maneja la suscripción y gestión de notificaciones push para la PWA
 */

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
const API_URL = import.meta.env.VITE_JS_APP_API_URL;

/**
 * Verifica si las notificaciones push están soportadas
 */
export function isPushNotificationSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Convierte una clave VAPID de base64 a Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Solicita permiso para mostrar notificaciones
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Este navegador no soporta notificaciones');
    return 'denied';
  }

  return await Notification.requestPermission();
}

/**
 * Obtiene el estado actual del permiso de notificaciones
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Suscribe al usuario a las notificaciones push
 * @param authToken - Token de autenticación del usuario
 */
export async function subscribeToPushNotifications(authToken: string): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) {
    console.warn('Las notificaciones push no están soportadas');
    return null;
  }

  if (!VAPID_PUBLIC_KEY) {
    console.error('VITE_VAPID_PUBLIC_KEY no está configurada');
    return null;
  }

  if (!authToken) {
    console.error('No se proporcionó token de autenticación');
    return null;
  }

  try {
    // Obtener el service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Verificar si ya existe una suscripción
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Crear nueva suscripción
      const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      console.log('✅ Suscripción a push notifications creada');
    } else {
      console.log('ℹ️ Ya existe una suscripción activa');
    }

    // Enviar la suscripción al backend
    await sendSubscriptionToBackend(subscription, authToken);

    return subscription;
  } catch (error) {
    console.error('Error al suscribirse a push notifications:', error);
    return null;
  }
}

/**
 * Envía la suscripción al backend
 */
async function sendSubscriptionToBackend(subscription: PushSubscription, authToken: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/push/subscribe/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Error al enviar la suscripción al servidor: ${response.status} - ${errorData}`);
    }

    console.log('✅ Suscripción enviada al backend');
  } catch (error) {
    console.error('Error al enviar suscripción al backend:', error);
    throw error;
  }
}

/**
 * Desuscribe al usuario de las notificaciones push
 * @param authToken - Token de autenticación del usuario
 */
export async function unsubscribeFromPushNotifications(authToken: string): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Desuscribir del navegador
      await subscription.unsubscribe();

      // Notificar al backend
      await fetch(`${API_URL}/api/push/unsubscribe/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });

      console.log('✅ Desuscripción exitosa');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error al desuscribirse:', error);
    return false;
  }
}

/**
 * Obtiene la suscripción actual
 */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('Error al obtener suscripción:', error);
    return null;
  }
}

/**
 * Verifica si el usuario está suscrito
 */
export async function isSubscribed(): Promise<boolean> {
  const subscription = await getCurrentSubscription();
  return subscription !== null;
}

/**
 * Maneja la instalación de la PWA
 */
export function setupPWAInstallPrompt() {
  let deferredPrompt: any;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevenir que Chrome 67 y anteriores muestren el prompt automáticamente
    e.preventDefault();
    // Guardar el evento para que se pueda activar después
    deferredPrompt = e;

    // Mostrar botón de instalación o ejecutar lógica personalizada
    console.log('PWA se puede instalar');

    // Disparar evento personalizado para que los componentes puedan escuchar
    window.dispatchEvent(new CustomEvent('pwa-installable', { detail: { prompt: deferredPrompt } }));
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA instalada exitosamente');
    deferredPrompt = null;
  });

  return {
    showInstallPrompt: async () => {
      if (!deferredPrompt) {
        return false;
      }

      // Mostrar el prompt
      deferredPrompt.prompt();

      // Esperar a que el usuario responda
      const { outcome } = await deferredPrompt.userChoice;

      console.log(`Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);

      deferredPrompt = null;
      return outcome === 'accepted';
    },
  };
}
