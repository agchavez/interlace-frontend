import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  isPushNotificationSupported,
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isSubscribed,
  getNotificationPermission,
} from '../../../utils/pushNotifications';

interface PushNotificationPromptProps {
  /** Control externo del dialog */
  open: boolean;
  /** Función para cerrar el dialog */
  onClose: () => void;
  /** Token de autenticación del usuario */
  authToken: string;
  /** Callback cuando se otorga el permiso */
  onPermissionGranted?: () => void;
  /** Callback cuando se deniega el permiso */
  onPermissionDenied?: () => void;
}

export default function PushNotificationPrompt({
  open,
  onClose,
  authToken,
  onPermissionGranted,
  onPermissionDenied,
}: PushNotificationPromptProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Verificar estado cuando se abre el dialog
  useEffect(() => {
    if (open) {
      checkSubscriptionStatus();
    }
  }, [open]);

  const checkSubscriptionStatus = async () => {
    const currentPermission = getNotificationPermission();
    setPermission(currentPermission);

    if (currentPermission === 'granted') {
      const status = await isSubscribed();
      setSubscribed(status);
    }
  };

  const handleRequestPermission = async () => {
    if (!isPushNotificationSupported()) {
      setError('Tu navegador no soporta notificaciones push');
      return;
    }

    if (!authToken) {
      setError('No hay sesión activa. Por favor, inicia sesión nuevamente.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Solicitar permiso
      const permission = await requestNotificationPermission();
      setPermission(permission);

      if (permission === 'granted') {
        // Suscribirse a push notifications con el token
        const subscription = await subscribeToPushNotifications(authToken);

        if (subscription) {
          setSubscribed(true);
          onPermissionGranted?.();

          // Cerrar el dialog después de 1 segundo
          setTimeout(() => {
            onClose();
          }, 1000);
        } else {
          setError('No se pudo completar la suscripción. Verifica la configuración VAPID.');
        }
      } else {
        setError('Permiso denegado. No podrás recibir notificaciones.');
        onPermissionDenied?.();
      }
    } catch (err) {
      console.error('Error al solicitar permiso:', err);
      setError('Ocurrió un error al solicitar el permiso');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!authToken) {
      setError('No hay sesión activa.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await unsubscribeFromPushNotifications(authToken);
      if (success) {
        setSubscribed(false);
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setError('No se pudo completar la desuscripción');
      }
    } catch (err) {
      console.error('Error al desuscribirse:', err);
      setError('Ocurrió un error al desuscribirse');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsIcon color="primary" />
            <Typography variant="h6">
              {subscribed ? 'Gestionar Notificaciones' : 'Activar Notificaciones'}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!isPushNotificationSupported() ? (
          <Alert severity="warning">
            Tu navegador no soporta notificaciones push. Por favor, utiliza un navegador
            moderno como Chrome, Firefox o Edge.
          </Alert>
        ) : subscribed ? (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              ¡Estás suscrito a las notificaciones!
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Recibirás notificaciones sobre actualizaciones importantes del sistema.
              Puedes desactivarlas en cualquier momento.
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="body1" gutterBottom>
              Mantente al día con las notificaciones del sistema
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Te enviaremos notificaciones sobre:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mt: 1 }}>
              <Typography component="li" variant="body2" color="text.secondary">
                Nuevas tareas asignadas
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Actualizaciones de estado
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Mensajes importantes del sistema
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Recordatorios y alertas
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              Puedes desactivar las notificaciones en cualquier momento desde la configuración
              de tu navegador.
            </Typography>
          </>
        )}
      </DialogContent>

      <DialogActions>
        {subscribed ? (
          <>
            <Button onClick={handleClose} disabled={loading}>
              Cerrar
            </Button>
            <Button
              onClick={handleUnsubscribe}
              color="error"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Desactivando...' : 'Desactivar notificaciones'}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClose} disabled={loading}>
              Ahora no
            </Button>
            <Button
              onClick={handleRequestPermission}
              variant="contained"
              disabled={loading || !isPushNotificationSupported()}
              startIcon={<NotificationsIcon />}
            >
              {loading ? 'Activando...' : 'Activar notificaciones'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
