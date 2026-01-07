import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Paper, Button } from '@mui/material';
import { SidebarProvider } from '../context/SidebarContext';
import SidebarV2 from '../components/SidebarV2';
import AppLayoutV2 from '../components/AppLayoutV2';
import Navbar from '../components/Navbar';
import { ChangeDistributorCenter } from '../components/ChangeDistributorCenter';

/**
 * DEMO PAGE para probar el nuevo diseño V2 del Sidebar
 *
 * Para usar este diseño en tu aplicación:
 *
 * 1. Envuelve tu app con SidebarProvider en el nivel más alto
 * 2. Coloca el SidebarV2 component
 * 3. Envuelve tus páginas con AppLayoutV2
 *
 * Ejemplo:
 *
 * ```tsx
 * <SidebarProvider>
 *   <Navbar />
 *   <SidebarV2 />
 *   <AppLayoutV2>
 *     <YourPageContent />
 *   </AppLayoutV2>
 * </SidebarProvider>
 * ```
 */

const DemoContentV2: React.FC = () => {
  return (
    <Box>
      {/* Page Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={400} gutterBottom>
          Nuevo Diseño V2 - Inspirado en shadcn
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Este es el nuevo diseño del sidebar con breadcrumbs y navegación mejorada
        </Typography>
      </Box>

      {/* Demo Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Características
              </Typography>
              <Typography variant="body2" color="text.secondary" component="div">
                <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                  <li>Sidebar colapsable y expandible</li>
                  <li>Breadcrumbs automáticos</li>
                  <li>Diseño moderno y limpio</li>
                  <li>Animaciones suaves</li>
                  <li>Totalmente responsive</li>
                  <li>100% Material-UI</li>
                </ul>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Inspiración
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Basado en el sidebar de shadcn/ui, uno de los diseños más modernos y populares actualmente.
                Adaptado completamente para Material-UI manteniendo la consistencia del proyecto.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Migración
              </Typography>
              <Typography variant="body2" color="text.secondary">
                El código antiguo no ha sido tocado. Este es un diseño completamente nuevo (V2)
                que puedes probar antes de migrar completamente.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Full width demo card */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 4, backgroundColor: 'background.default' }}>
            <Typography variant="h5" gutterBottom>
              ¿Cómo probar este diseño?
            </Typography>
            <Typography variant="body1" paragraph>
              Este componente está listo para usar. Solo necesitas:
            </Typography>
            <Box component="ol" sx={{ pl: 3 }}>
              <Typography component="li" variant="body1" paragraph>
                Importar el <code>SidebarProvider</code> y envolver tu aplicación
              </Typography>
              <Typography component="li" variant="body1" paragraph>
                Reemplazar tu sidebar actual con <code>&lt;SidebarV2 /&gt;</code>
              </Typography>
              <Typography component="li" variant="body1" paragraph>
                Envolver tus páginas con <code>&lt;AppLayoutV2&gt;</code>
              </Typography>
            </Box>
            <Button variant="contained" sx={{ mt: 2 }}>
              Ver Documentación
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

const DemoPageV2: React.FC = () => {
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
        <DemoContentV2 />
      </AppLayoutV2>
    </SidebarProvider>
  );
};

export default DemoPageV2;
