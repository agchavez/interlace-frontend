import { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '../../../store/store';
import PushNotificationPrompt from './PushNotificationPrompt';
import PWAInstallPrompt from './PWAInstallPrompt';
import { getNotificationPermission } from '../../../utils/pushNotifications';

const DISMISS_KEY = 'push_notification_prompt_dismissed';

/**
 * Componente que maneja los prompts de PWA (instalación y notificaciones)
 * - Muestra el prompt de instalación automáticamente
 * - Muestra el prompt de notificaciones después del login (solo 1 vez hasta que el usuario lo permita)
 */
export default function PWANotificationManager() {
  const { token, isAuthenticated, status } = useAppSelector((state) => state.auth);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  const hasShownPromptRef = useRef(false);
  const wasAuthenticatedRef = useRef(false);

  useEffect(() => {
    const justLoggedIn = !wasAuthenticatedRef.current && isAuthenticated && status === 'authenticated';

    if (justLoggedIn && !hasShownPromptRef.current && token) {
      const permission = getNotificationPermission();
      const dismissed = localStorage.getItem(DISMISS_KEY);

      // Solo mostrar si: permiso es 'default' Y no fue descartado antes
      if (permission === 'default' && !dismissed) {
        const timer = setTimeout(() => {
          setShowNotificationPrompt(true);
          hasShownPromptRef.current = true;
        }, 2000);

        return () => clearTimeout(timer);
      } else {
        hasShownPromptRef.current = true;
      }
    }

    wasAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated, status, token]);

  const handleCloseNotificationPrompt = () => {
    setShowNotificationPrompt(false);
    // Guardar en localStorage que el usuario descartó el prompt
    localStorage.setItem(DISMISS_KEY, new Date().toISOString());
  };

  const handlePermissionGranted = () => {
    // Si aceptó, limpiar el dismiss para que no quede marcado
    localStorage.removeItem(DISMISS_KEY);
  };

  const handlePermissionDenied = () => {
    localStorage.setItem(DISMISS_KEY, new Date().toISOString());
  };

  return (
    <>
      <PWAInstallPrompt autoShow={true} delay={5000} />

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
