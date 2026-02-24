import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Paper, Button, Chip } from '@mui/material';
import { SidebarProvider } from '../context/SidebarContext';
import SidebarV2 from '../components/SidebarV2';
import AppLayoutV2 from '../components/AppLayoutV2';
import Navbar from '../components/Navbar';
import { ChangeDistributorCenter } from '../components/ChangeDistributorCenter';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SpeedIcon from '@mui/icons-material/Speed';
import PaletteIcon from '@mui/icons-material/Palette';
import DevicesIcon from '@mui/icons-material/Devices';
import CodeIcon from '@mui/icons-material/Code';

const DemoContent: React.FC = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ mb: 6 }}>
        <Chip
          label="NUEVO DISEÑO V2"
          color="secondary"
          icon={<AutoAwesomeIcon />}
          sx={{ mb: 2, fontWeight: 600 }}
        />
        <Typography variant="h3" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
          Sidebar Moderno Inspirado en shadcn/ui
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3, maxWidth: '800px' }}>
          Un diseño completamente nuevo, limpio y moderno usando 100% Material-UI.
          Sin tocar el código antiguo.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" color="secondary" size="large">
            Ver Documentación
          </Button>
          <Button variant="outlined" color="secondary" size="large">
            Comparar con Antiguo
          </Button>
        </Box>
      </Box>

      {/* Feature Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Card
            elevation={2}
            sx={{
              height: '100%',
              backgroundColor: '#1a1a1a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
                borderColor: 'secondary.main',
              },
            }}
          >
            <CardContent>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  backgroundColor: 'secondary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <SpeedIcon sx={{ color: 'white' }} />
              </Box>
              <Typography variant="h6" gutterBottom fontWeight={600} color="white">
                Rápido y Fluido
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Animaciones suaves con cubic-bezier y transiciones optimizadas para una experiencia premium.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card
            elevation={2}
            sx={{
              height: '100%',
              backgroundColor: '#1a1a1a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
                borderColor: 'primary.main',
              },
            }}
          >
            <CardContent>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  backgroundColor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <PaletteIcon sx={{ color: 'white' }} />
              </Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Diseño Moderno
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Inspirado en shadcn/ui, uno de los diseños más populares y modernos actualmente.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card
            elevation={2}
            sx={{
              height: '100%',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
            }}
          >
            <CardContent>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  backgroundColor: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <DevicesIcon sx={{ color: 'white' }} />
              </Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                100% Responsive
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Funciona perfectamente en desktop, tablet y móvil con diseño adaptativo.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card
            elevation={2}
            sx={{
              height: '100%',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
            }}
          >
            <CardContent>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  backgroundColor: 'info.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <CodeIcon sx={{ color: 'white' }} />
              </Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                100% Material-UI
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sin dependencias adicionales. Totalmente integrado con tu stack actual.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Features List */}
      <Paper elevation={1} sx={{ p: 4, mb: 6 }}>
        <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
          Características Principales
        </Typography>
        <Grid container spacing={2}>
          {[
            'Sidebar colapsable con animaciones suaves',
            'Breadcrumbs automáticos generados desde la URL',
            'Sistema de permisos completamente integrado',
            'Estados activos y hover elegantes',
            'Diseño limpio con colores neutros',
            'Compatible con dark mode',
            'Trigger button inspirado en shadcn',
            'Profile section integrada',
            'Sub-menús con animaciones',
            'Código totalmente nuevo (V2)',
            'Documentación completa incluida',
            'Listo para producción',
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CheckCircleIcon color="success" fontSize="small" />
                <Typography variant="body1">{feature}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Instructions */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          backgroundColor: 'secondary.lighter',
          border: '1px solid',
          borderColor: 'secondary.main',
        }}
      >
        <Typography variant="h5" gutterBottom fontWeight={600}>
          🎯 Prueba el Sidebar
        </Typography>
        <Typography variant="body1" paragraph>
          El sidebar está funcionando en esta página. Puedes:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <Typography component="li" variant="body1" paragraph>
            <strong>Colapsar/Expandir:</strong> Haz clic en el botón de flecha en el sidebar
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            <strong>Navegar:</strong> Los items del menú funcionan con tu sistema de permisos
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            <strong>Ver Breadcrumbs:</strong> El header muestra la ruta actual automáticamente
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            <strong>Comparar:</strong> Abre otra pestaña con el diseño antiguo para comparar
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          📖 Lee el archivo SIDEBAR_V2_README.md en la raíz del proyecto para más detalles
        </Typography>
      </Paper>
    </Box>
  );
};

const SidebarV2Demo: React.FC = () => {
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  return (
    <SidebarProvider defaultCollapsed={false}>
      <ChangeDistributorCenter />
      <Navbar
        notificationCount={0}
        onDrawerOpen={() => setNotificationDrawerOpen(true)}
      />
      <SidebarV2 />
      <AppLayoutV2>
        <DemoContent />
      </AppLayoutV2>
    </SidebarProvider>
  );
};

export default SidebarV2Demo;
