import { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import {
  GetApp as GetAppIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { setupPWAInstallPrompt } from '../../../utils/pushNotifications';

interface PWAInstallPromptProps {
  /** Delay en milisegundos antes de mostrar el prompt */
  delay?: number;
  /** Si se debe mostrar automáticamente */
  autoShow?: boolean;
}

export default function PWAInstallPrompt({
  delay = 3000,
  autoShow = true,
}: PWAInstallPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const { showInstallPrompt } = setupPWAInstallPrompt();

    // Escuchar el evento personalizado
    const handleInstallable = (e: Event) => {
      const customEvent = e as CustomEvent;
      setDeferredPrompt(customEvent.detail.prompt);

      if (autoShow) {
        // Mostrar después del delay
        setTimeout(() => {
          setShowPrompt(true);
        }, delay);
      }
    };

    window.addEventListener('pwa-installable', handleInstallable);

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
    };
  }, [delay, autoShow]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      // Mostrar el prompt de instalación
      deferredPrompt.prompt();

      // Esperar la respuesta del usuario
      const { outcome } = await deferredPrompt.userChoice;

      console.log(`Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);

      // Limpiar el prompt
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error al mostrar el prompt de instalación:', error);
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <Snackbar
      open={showPrompt}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      onClose={handleClose}
    >
      <Alert
        severity="info"
        sx={{
          width: '100%',
          alignItems: 'center',
          '& .MuiAlert-message': {
            flex: 1,
          },
        }}
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              color="inherit"
              size="small"
              variant="outlined"
              startIcon={<GetAppIcon />}
              onClick={handleInstall}
              sx={{ textTransform: 'none' }}
            >
              Instalar
            </Button>
            <IconButton
              size="small"
              color="inherit"
              onClick={handleClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        <strong>Instala Tracker</strong> en tu dispositivo para un acceso más rápido
      </Alert>
    </Snackbar>
  );
}
