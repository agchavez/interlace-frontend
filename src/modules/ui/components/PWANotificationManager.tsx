import { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '../../../store/store';
import PushNotificationPrompt from './PushNotificationPrompt';
import PWAInstallPrompt from './PWAInstallPrompt';
import { getNotificationPermission } from '../../../utils/pushNotifications';

/**
 * Componente que maneja los prompts de PWA (instalación y notificaciones)
 * - Muestra el prompt de instalación automáticamente
 * - Muestra el prompt de notificaciones después del login
 */
export default function PWANotificationManager() {
  const { token, isAuthenticated, status } = useAppSelector((state) => state.auth);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  // Ref para rastrear si ya se mostró el prompt en esta sesión
  const hasShownPromptRef = useRef(false);

  // Ref para el estado de autenticación anterior
  const wasAuthenticatedRef = useRef(false);

  useEffect(() => {
    // Detectar cuando el usuario se acaba de loguear
    const justLoggedIn = !wasAuthenticatedRef.current && isAuthenticated && status === 'authenticated';

    if (justLoggedIn && !hasShownPromptRef.current && token) {
      // Verificar si el usuario ya tiene permisos de notificación
      const permission = getNotificationPermission();

      // Solo mostrar si no ha otorgado ni denegado el permiso antes
      if (permission === 'default') {
        // Esperar 2 segundos después del login para mostrar el prompt
        const timer = setTimeout(() => {
          setShowNotificationPrompt(true);
          hasShownPromptRef.current = true;
        }, 2000);

        return () => clearTimeout(timer);
      } else {
        // Ya tiene permisos (granted o denied), marcar como mostrado
        hasShownPromptRef.current = true;
      }
    }

    // Actualizar el ref del estado anterior
    wasAuthenticatedRef.current = isAuthenticated;

  }, [isAuthenticated, status, token]);

  const handleCloseNotificationPrompt = () => {
    setShowNotificationPrompt(false);
  };

  const handlePermissionGranted = () => {
    console.log('✅ Usuario activó las notificaciones push');
  };

  const handlePermissionDenied = () => {
    console.log('❌ Usuario denegó las notificaciones push');
  };

  return (
    <>
      {/* Prompt de Instalación PWA - se muestra automáticamente */}
      <PWAInstallPrompt autoShow={true} delay={5000} />

      {/* Prompt de Notificaciones - se muestra después del login */}
      {isAuthenticated && token && (
        <PushNotificationPrompt
          open={showNotificationPrompt}
          onClose={handleCloseNotificationPrompt}
          authToken={token}
          onPermissionGranted={handlePermissionGranted}
          onPermissionDenied={handlePermissionDenied}
        />
      )}
    </>
  );
}
