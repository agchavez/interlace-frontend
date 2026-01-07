import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import GroupsIcon from '@mui/icons-material/Groups';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkIcon from '@mui/icons-material/Work';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EventIcon from '@mui/icons-material/Event';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useGetPersonnelDashboardQuery } from '../services/personnelApi';

export const PersonnelDashboardPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Obtener datos del dashboard
  const { data: dashboardData, isLoading, error } = useGetPersonnelDashboardQuery();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Alert severity="error">Error al cargar las estadísticas</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1600, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 400, mb: 1 }}>
          Dashboard de Personal
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Vista general de la gestión de personal y métricas clave
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Personal"
            value={dashboardData?.summary.total_active || 0}
            icon={<PeopleIcon />}
            color={theme.palette.primary.main}
            trend={dashboardData?.summary.growth_trend_percentage ? `${dashboardData.summary.growth_trend_percentage > 0 ? '+' : ''}${dashboardData.summary.growth_trend_percentage}%` : undefined}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Personal Activo"
            value={dashboardData?.summary.total_active || 0}
            icon={<CheckCircleIcon />}
            color="#4caf50"
            subtitle={`${dashboardData?.summary.total_inactive || 0} inactivos`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Con Acceso Sistema"
            value={dashboardData?.summary.with_system_access || 0}
            icon={<BadgeIcon />}
            color="#2196f3"
            subtitle={`${dashboardData?.summary.without_system_access || 0} sin acceso`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Antigüedad Promedio"
            value={`${dashboardData?.summary.avg_years_of_service || 0} años`}
            icon={<TrendingUpIcon />}
            color="#ff9800"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Distribución por Nivel Jerárquico */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Distribución por Nivel Jerárquico
              </Typography>
              <Box>
                {dashboardData?.by_hierarchy && dashboardData.by_hierarchy.length > 0 ? (
                  dashboardData.by_hierarchy.map((item) => (
                    <ProgressBar
                      key={item.hierarchy_level}
                      label={item.hierarchy_level}
                      value={item.count}
                      total={dashboardData.summary.total_active}
                      color={theme.palette.primary.main}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No hay datos disponibles</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribución por Tipo de Posición */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Distribución por Tipo de Posición
              </Typography>
              <Box>
                {dashboardData?.by_position_type && dashboardData.by_position_type.length > 0 ? (
                  dashboardData.by_position_type.map((item) => (
                    <ProgressBar
                      key={item.position_type}
                      label={item.position_type}
                      value={item.count}
                      total={dashboardData.summary.total_active}
                      color="#2196f3"
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No hay datos disponibles</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribución por Área */}
        <Grid item xs={12} md={8}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Personal por Área
              </Typography>
              <Grid container spacing={2}>
                {dashboardData?.by_area && dashboardData.by_area.length > 0 ? (
                  dashboardData.by_area.slice(0, 6).map((item) => (
                    <Grid item xs={12} sm={6} key={item.area__code}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          bgcolor: 'action.hover',
                          borderRadius: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: 'action.selected',
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <BusinessIcon />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                              {item.area__name}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              {item.count}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">No hay datos disponibles</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Alertas y Notificaciones */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Alertas
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <WarningIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Certificaciones por vencer"
                    secondary={`${dashboardData?.certifications.expiring_soon || 0} certificaciones vencen pronto`}
                    primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <PersonAddIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Nuevos ingresos"
                    secondary={`${dashboardData?.summary.new_hires_7_days || 0} empleados esta semana`}
                    primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <AssignmentIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Evaluaciones pendientes"
                    secondary={`${dashboardData?.evaluations.pending || 0} evaluaciones de desempeño`}
                    primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Accesos Rápidos */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Accesos Rápidos
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                        transform: 'translateY(-4px)',
                      },
                    }}
                    onClick={() => navigate('/personnel/create')}
                  >
                    <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'primary.main', width: 56, height: 56 }}>
                      <PersonAddIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Nuevo Personal
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Registrar nuevo empleado
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                        transform: 'translateY(-4px)',
                      },
                    }}
                    onClick={() => navigate('/personnel')}
                  >
                    <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'info.main', width: 56, height: 56 }}>
                      <GroupsIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Ver Todo el Personal
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Listado completo
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                        transform: 'translateY(-4px)',
                      },
                    }}
                    onClick={() => navigate('/personnel/certifications')}
                  >
                    <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'warning.main', width: 56, height: 56 }}>
                      <AssignmentIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Certificaciones
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Gestionar certificaciones
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                        transform: 'translateY(-4px)',
                      },
                    }}
                    onClick={() => navigate('/personnel/performance')}
                  >
                    <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'success.main', width: 56, height: 56 }}>
                      <TrendingUpIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Desempeño
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Evaluaciones y métricas
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// ============================================
// Helper Components
// ============================================

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend, subtitle }) => {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color }}>
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: color, opacity: 0.9 }}>{icon}</Avatar>
        </Box>
        {(trend || subtitle) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {trend && (
              <Chip label={trend} size="small" color="success" sx={{ height: 20, fontSize: '0.7rem' }} />
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

interface ProgressBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, value, total, color }) => {
  const percentage = (value / total) * 100;

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {value} ({percentage.toFixed(1)}%)
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: 'action.hover',
          '& .MuiLinearProgress-bar': {
            bgcolor: color,
            borderRadius: 4,
          },
        }}
      />
    </Box>
  );
};
